import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { EpisodeService } from './episode.service';
import { Episode, EpisodeResponse } from '../models/episode.model';

describe('EpisodeService', () => {
    let service: EpisodeService;
    let httpMock: HttpTestingController;
    const API_URL: string = 'https://rickandmortyapi.com/api/episode';

    const mockSingleEpisode: Episode = {
        id: 28,
        name: 'The Ricklantis Mixup',
        air_date: 'September 10, 2017',
        episode: 'S03E07',
        characters: [
            'https://rickandmortyapi.com/api/character/1',
            'https://rickandmortyapi.com/api/character/2',
            'https://rickandmortyapi.com/api/character/8',
            'https://rickandmortyapi.com/api/character/15',
        ],
        url: 'https://rickandmortyapi.com/api/episode/28',
        created: '2017-11-10T12:56:36.618Z',
    };

    const mockMultipleEpisodes: Episode[] = [
        {
            id: 10,
            name: 'Close Rick-counters of the Rick Kind',
            air_date: 'April 7, 2014',
            episode: 'S01E10',
            characters: [
                'https://rickandmortyapi.com/api/character/1',
                'https://rickandmortyapi.com/api/character/2',
                'https://rickandmortyapi.com/api/character/8',
                'https://rickandmortyapi.com/api/character/22',
            ],
            url: 'https://rickandmortyapi.com/api/episode/10',
            created: '2017-11-10T12:56:34.747Z',
        },
        {
            id: 28,
            name: 'The Ricklantis Mixup',
            air_date: 'September 10, 2017',
            episode: 'S03E07',
            characters: [
                'https://rickandmortyapi.com/api/character/1',
                'https://rickandmortyapi.com/api/character/2',
                'https://rickandmortyapi.com/api/character/8',
                'https://rickandmortyapi.com/api/character/15',
            ],
            url: 'https://rickandmortyapi.com/api/episode/28',
            created: '2017-11-10T12:56:36.618Z',
        },
    ];

    const mockEpisodeResponse: EpisodeResponse = {
        info: {
            count: 51,
            pages: 3,
            next: 'https://rickandmortyapi.com/api/episode?page=2',
            prev: null,
        },
        results: [
            {
                id: 1,
                name: 'Pilot',
                air_date: 'December 2, 2013',
                episode: 'S01E01',
                characters: [
                    'https://rickandmortyapi.com/api/character/1',
                    'https://rickandmortyapi.com/api/character/2',
                    'https://rickandmortyapi.com/api/character/35',
                    'https://rickandmortyapi.com/api/character/38',
                ],
                url: 'https://rickandmortyapi.com/api/episode/1',
                created: '2017-11-10T12:56:33.798Z',
            },
        ],
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [EpisodeService, provideHttpClient(), provideHttpClientTesting()],
        });

        service = TestBed.inject(EpisodeService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('.getAllEpisodes', () => {
        it('should make GET request to /episode and return episode response', () => {
            service.getAllEpisodes().subscribe(data => {
                expect(data).toEqual(mockEpisodeResponse);
                expect(data.info.count).toBe(51);
                expect(data.info.pages).toBe(3);
                expect(data.results.length).toBe(1);
                expect(data.results[0].name).toBe('Pilot');
                expect(data.results[0].episode).toBe('S01E01');
            });

            const req = httpMock.expectOne(API_URL);
            expect(req.request.method).toEqual('GET');
            req.flush(mockEpisodeResponse);
        });

        it('should handle server errors when getting all episodes', () => {
            const mockError = { error: 'There is nothing here' };

            service.getAllEpisodes().subscribe({
                next: () => fail('Should have failed'),
                error: error => {
                    expect(error.status).toBe(404);
                    expect(error.error).toEqual(mockError.error);
                },
            });

            const req = httpMock.expectOne(API_URL);
            req.flush(mockError, { status: 404, statusText: 'Not Found' });
        });

        it('should handle network errors when getting all episodes', () => {
            service.getAllEpisodes().subscribe({
                next: () => fail('Should have failed'),
                error: error => {
                    expect(error).toBeInstanceOf(ProgressEvent);
                    expect(error.type).toBe('error');
                },
            });

            const req = httpMock.expectOne(API_URL);
            req.error(new ProgressEvent('network error'));
        });
    });

    describe('.getEpisodes', () => {
        it('should get single episode by ID and return as array', () => {
            const episodeIds = [28];

            service.getEpisodes(episodeIds).subscribe(data => {
                expect(Array.isArray(data)).toBe(true);
                expect(data.length).toBe(1);
                expect(data[0]).toEqual(mockSingleEpisode);
                expect(data[0].name).toBe('The Ricklantis Mixup');
                expect(data[0].episode).toBe('S03E07');
                expect(data[0].air_date).toBe('September 10, 2017');
            });

            const req = httpMock.expectOne(API_URL + '/28');
            expect(req.request.method).toEqual('GET');
            req.flush(mockSingleEpisode);
        });

        it('should get multiple episodes by IDs and return as array', () => {
            const episodeIds = [10, 28];

            service.getEpisodes(episodeIds).subscribe(data => {
                expect(Array.isArray(data)).toBe(true);
                expect(data.length).toBe(2);
                expect(data).toEqual(mockMultipleEpisodes);
                expect(data[0].name).toBe('Close Rick-counters of the Rick Kind');
                expect(data[0].episode).toBe('S01E10');
                expect(data[1].name).toBe('The Ricklantis Mixup');
                expect(data[1].episode).toBe('S03E07');
            });

            const req = httpMock.expectOne(API_URL + '/10,28');
            expect(req.request.method).toEqual('GET');
            req.flush(mockMultipleEpisodes);
        });

        it('should handle single episode ID with array notation', () => {
            const episodeIds = [1];

            service.getEpisodes(episodeIds).subscribe(data => {
                expect(Array.isArray(data)).toBe(true);
                expect(data.length).toBe(1);
                expect(data[0].id).toBe(1);
            });

            const req = httpMock.expectOne(API_URL + '/1');
            req.flush({
                id: 1,
                name: 'Pilot',
                air_date: 'December 2, 2013',
                episode: 'S01E01',
                characters: [
                    'https://rickandmortyapi.com/api/character/1',
                    'https://rickandmortyapi.com/api/character/2',
                ],
                url: 'https://rickandmortyapi.com/api/episode/1',
                created: '2017-11-10T12:56:33.798Z',
            });
        });

        it('should handle three or more episode IDs', () => {
            const episodeIds = [1, 10, 28];

            service.getEpisodes(episodeIds).subscribe(data => {
                expect(Array.isArray(data)).toBe(true);
                expect(data.length).toBe(3);
            });

            const req = httpMock.expectOne(API_URL + '/1,10,28');
            expect(req.request.method).toEqual('GET');
            req.flush([
                mockEpisodeResponse.results[0],
                mockMultipleEpisodes[0],
                mockMultipleEpisodes[1],
            ]);
        });

        it('should handle episode not found error', () => {
            const mockError = { error: 'Episode not found' };
            const episodeIds = [999];

            service.getEpisodes(episodeIds).subscribe({
                next: () => fail('Should have failed'),
                error: error => {
                    expect(error.status).toBe(404);
                    expect(error.error).toEqual(mockError.error);
                },
            });

            const req = httpMock.expectOne(API_URL + '/999');
            req.flush(mockError, { status: 404, statusText: 'Not Found' });
        });

        it('should handle invalid episode IDs in array', () => {
            const mockError = { error: 'Hey! you must provide an id' };
            const episodeIds = [0, -1];

            service.getEpisodes(episodeIds).subscribe({
                next: () => fail('Should have failed'),
                error: error => {
                    expect(error.status).toBe(400);
                    expect(error.error).toEqual(mockError.error);
                },
            });

            const req = httpMock.expectOne(API_URL + '/0,-1');
            req.flush(mockError, { status: 400, statusText: 'Bad Request' });
        });

        it('should handle network errors when getting specific episodes', () => {
            const episodeIds = [28];

            service.getEpisodes(episodeIds).subscribe({
                next: () => fail('Should have failed'),
                error: error => {
                    expect(error).toBeInstanceOf(ProgressEvent);
                    expect(error.type).toBe('error');
                },
            });

            const req = httpMock.expectOne(API_URL + '/28');
            req.error(new ProgressEvent('network error'));
        });

        it('should correctly map single episode response to array using pipe operator', () => {
            const episodeIds = [28];

            service.getEpisodes(episodeIds).subscribe(data => {
                expect(Array.isArray(data)).toBe(true);
                expect(data.length).toBe(1);
                expect(data[0]).toEqual(mockSingleEpisode);
            });

            const req = httpMock.expectOne(API_URL + '/28');
            req.flush(mockSingleEpisode);
        });

        it('should not modify array response from API', () => {
            const episodeIds = [10, 28];

            service.getEpisodes(episodeIds).subscribe(data => {
                expect(Array.isArray(data)).toBe(true);
                expect(data.length).toBe(2);
                expect(data).toEqual(mockMultipleEpisodes);
            });

            const req = httpMock.expectOne(API_URL + '/10,28');
            req.flush(mockMultipleEpisodes);
        });
    });
});
