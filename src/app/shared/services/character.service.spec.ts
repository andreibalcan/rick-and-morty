import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CharacterService } from './character.service';
import { FavouriteService } from './favourite.service';
import { Character, CharacterResponse } from '../models/character.model';

describe('CharacterService', () => {
    let service: CharacterService;
    let httpMock: HttpTestingController;
    let favouriteService: FavouriteService;
    const API_URL: string = 'https://rickandmortyapi.com/api/character';

    const mockSingleCharacter: Character = {
        id: 1,
        name: 'Rick Sanchez',
        status: 'Alive',
        species: 'Human',
        type: '',
        gender: 'Male',
        origin: {
            name: 'Earth (C-137)',
            url: 'https://rickandmortyapi.com/api/location/1',
        },
        location: {
            name: 'Earth (Replacement Dimension)',
            url: 'https://rickandmortyapi.com/api/location/20',
        },
        image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
        episode: [
            'https://rickandmortyapi.com/api/episode/1',
            'https://rickandmortyapi.com/api/episode/2',
        ],
        url: 'https://rickandmortyapi.com/api/character/1',
        created: '2017-11-04T18:48:46.250Z',
    };

    const mockMultipleCharacters: Character[] = [
        mockSingleCharacter,
        {
            id: 2,
            name: 'Morty Smith',
            status: 'Alive',
            species: 'Human',
            type: '',
            gender: 'Male',
            origin: {
                name: 'Earth (C-137)',
                url: 'https://rickandmortyapi.com/api/location/1',
            },
            location: {
                name: 'Earth (Replacement Dimension)',
                url: 'https://rickandmortyapi.com/api/location/20',
            },
            image: 'https://rickandmortyapi.com/api/character/avatar/2.jpeg',
            episode: [
                'https://rickandmortyapi.com/api/episode/1',
                'https://rickandmortyapi.com/api/episode/2',
            ],
            url: 'https://rickandmortyapi.com/api/character/2',
            created: '2017-11-04T18:50:21.651Z',
        },
    ];

    const mockCharacterResponse: CharacterResponse = {
        info: {
            count: 826,
            pages: 42,
            next: 'https://rickandmortyapi.com/api/character/?page=2',
            prev: null,
        },
        results: [mockSingleCharacter],
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                CharacterService,
                {
                    provide: FavouriteService,
                    useValue: {
                        getAllFavourites: jest.fn(),
                    },
                },
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        });

        service = TestBed.inject(CharacterService);
        httpMock = TestBed.inject(HttpTestingController);
        favouriteService = TestBed.inject(FavouriteService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('.getAllCharacters', () => {
        it('should make GET request to /character with default page and no filters', () => {
            service.getAllCharacters().subscribe(data => {
                expect(data).toEqual(mockCharacterResponse);
                expect(data.info.count).toBe(826);
                expect(data.info.pages).toBe(42);
                expect(data.results.length).toBe(1);
                expect(data.results[0].name).toBe('Rick Sanchez');
                expect(data.results[0].status).toBe('Alive');
            });

            const req = httpMock.expectOne(`${API_URL}/?page=1`);
            expect(req.request.method).toEqual('GET');
            req.flush(mockCharacterResponse);
        });

        it('should make GET request with specified page number', () => {
            service.getAllCharacters(2).subscribe(data => {
                expect(data).toEqual(mockCharacterResponse);
            });

            const req = httpMock.expectOne(`${API_URL}/?page=2`);
            expect(req.request.method).toEqual('GET');
            req.flush(mockCharacterResponse);
        });

        it('should make GET request with name filter', () => {
            service.getAllCharacters(1, { name: 'rick' }).subscribe(data => {
                expect(data).toEqual(mockCharacterResponse);
            });

            const req = httpMock.expectOne(`${API_URL}/?page=1&name=rick`);
            expect(req.request.method).toEqual('GET');
            req.flush(mockCharacterResponse);
        });

        it('should make GET request with multiple filters', () => {
            service
                .getAllCharacters(1, { name: 'rick', status: 'Alive', gender: 'Male' })
                .subscribe(data => {
                    expect(data).toEqual(mockCharacterResponse);
                });

            const req = httpMock.expectOne(`${API_URL}/?page=1&name=rick&status=Alive&gender=Male`);
            expect(req.request.method).toEqual('GET');
            req.flush(mockCharacterResponse);
        });

        it('should return favourites when filters.favourites is "favourites"', () => {
            (favouriteService.getAllFavourites as jest.Mock).mockReturnValue([1, 2]);

            service.getAllCharacters(1, { favourites: 'favourites' }).subscribe((data: any) => {
                expect(Array.isArray(data)).toBe(true);
                expect(data.length).toBe(2);
                expect(data).toEqual(mockMultipleCharacters);
            });

            const req = httpMock.expectOne(`${API_URL}/1,2`);
            expect(req.request.method).toEqual('GET');
            req.flush(mockMultipleCharacters);
        });

        it('should handle network errors when getting all characters', () => {
            service.getAllCharacters().subscribe({
                next: () => fail('Should have failed'),
                error: error => {
                    expect(error).toBeInstanceOf(ProgressEvent);
                    expect(error.type).toBe('error');
                },
            });

            const req = httpMock.expectOne(`${API_URL}/?page=1`);
            req.error(new ProgressEvent('network error'));
        });

        it('should handle invalid page number', () => {
            const mockError = { error: 'Character not found' };

            service.getAllCharacters(999).subscribe({
                next: () => fail('Should have failed'),
                error: error => {
                    expect(error.status).toBe(404);
                    expect(error.error).toEqual(mockError.error);
                },
            });

            const req = httpMock.expectOne(`${API_URL}/?page=999`);
            req.flush(mockError, { status: 404, statusText: 'Not Found' });
        });

        it('should handle invalid filter combination', () => {
            const mockError = { error: 'Invalid filter values' };
            const encodedUrl = `${API_URL}/?page=1&name=invalid%24name`;

            service.getAllCharacters(1, { name: 'invalid$name' }).subscribe({
                next: () => fail('Should have failed'),
                error: error => {
                    expect(error.status).toBe(400);
                    expect(error.error).toEqual(mockError.error);
                },
            });

            const req = httpMock.expectOne(encodedUrl);
            expect(req.request.method).toEqual('GET');
            req.flush(mockError, { status: 400, statusText: 'Bad Request' });
        });
    });
});
