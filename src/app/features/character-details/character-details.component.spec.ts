import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CharacterDetailsComponent } from './character-details.component';
import { EpisodeService } from '../../shared/services/episode.service';
import { LocationService } from '../../shared/services/location.service';
import { of } from 'rxjs';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ElementRef } from '@angular/core';
import { Episode } from '../../shared/models/episode.model';
import { Character } from '../../shared/models/character.model';
import { Location } from '../../shared/models/location.model';

describe('CharacterDetailsComponent', () => {
    let component: CharacterDetailsComponent;
    let fixture: ComponentFixture<CharacterDetailsComponent>;

    const mockEpisodeService = {
        getEpisodes: jest.fn(() => of([] as Episode[])),
    };

    const mockLocationService = {
        getLocation: jest.fn((url: string) => of(null as Location | null)),
    };

    const mockCharacter: Character = {
        id: 1,
        name: 'Rick Sanchez',
        status: 'Alive',
        species: 'Human',
        type: '',
        gender: 'Male',
        origin: { name: 'Earth (C-137)', url: 'https://rickandmortyapi.com/api/location/1' },
        location: { name: 'Citadel of Ricks', url: 'https://rickandmortyapi.com/api/location/3' },
        image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
        episode: [
            'https://rickandmortyapi.com/api/episode/1',
            'https://rickandmortyapi.com/api/episode/2',
        ],
        url: 'https://rickandmortyapi.com/api/character/1',
        created: '2017-11-04T18:48:46.250Z',
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CharacterDetailsComponent, CommonModule, AsyncPipe],
            providers: [
                { provide: EpisodeService, useValue: mockEpisodeService },
                { provide: LocationService, useValue: mockLocationService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CharacterDetailsComponent);
        component = fixture.componentInstance;
        component.character = mockCharacter;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should load character data on init', fakeAsync(() => {
            const mockLocation: Location = {
                id: 3,
                name: 'Citadel of Ricks',
                type: 'Space station',
                dimension: 'unknown',
                residents: [],
                url: 'https://rickandmortyapi.com/api/location/3',
                created: '2017-11-10T13:08:13.191Z',
            };

            const mockOrigin: Location = {
                id: 1,
                name: 'Earth (C-137)',
                type: 'Planet',
                dimension: 'Dimension C-137',
                residents: [],
                url: 'https://rickandmortyapi.com/api/location/1',
                created: '2017-11-10T12:42:04.162Z',
            };

            const mockEpisodes: Episode[] = [
                {
                    id: 1,
                    name: 'Pilot',
                    air_date: 'December 2, 2013',
                    episode: 'S01E01',
                    characters: [],
                    url: 'https://rickandmortyapi.com/api/episode/1',
                    created: '2017-11-10T12:56:33.798Z',
                },
            ];

            mockLocationService.getLocation
                .mockReturnValueOnce(of(mockLocation))
                .mockReturnValueOnce(of(mockOrigin));

            mockEpisodeService.getEpisodes.mockReturnValue(of(mockEpisodes));

            component.ngOnInit();
            tick();

            expect(mockLocationService.getLocation).toHaveBeenCalledWith(
                mockCharacter.location.url,
            );
            expect(mockLocationService.getLocation).toHaveBeenCalledWith(mockCharacter.origin.url);

            component.location$.subscribe(location => {
                expect(location).toEqual(mockLocation);
            });

            component.origin$.subscribe(origin => {
                expect(origin).toEqual(mockOrigin);
            });

            component.episodes$.subscribe(episodes => {
                expect(episodes).toEqual(mockEpisodes);
            });

            expect(component.loading).toBe(false);
        }));
    });

    describe('Scroll Behavior', () => {
        beforeEach(() => {
            component.episodesContainer = {
                nativeElement: {
                    scrollLeft: 0,
                    scrollWidth: 1000,
                    clientWidth: 500,
                    scrollBy: jest.fn(),
                },
            } as unknown as ElementRef<HTMLDivElement>;
        });

        it('should show right button when content is scrollable', () => {
            component.checkScrollButtons();
            expect(component.showRightButton).toBe(true);
            expect(component.showLeftButton).toBe(false);
        });

        it('should show left button when scrolled right', () => {
            component.episodesContainer!.nativeElement.scrollLeft = 100;
            component.checkScrollButtons();
            expect(component.showLeftButton).toBe(true);
        });

        it('should hide right button when scrolled to end', () => {
            component.episodesContainer!.nativeElement.scrollLeft = 500;
            component.checkScrollButtons();
            expect(component.showRightButton).toBe(false);
        });

        it('should scroll left when scrollLeft is called', () => {
            component.scrollLeft();
            expect(component.episodesContainer?.nativeElement.scrollBy).toHaveBeenCalledWith({
                left: -200,
                behavior: 'smooth',
            });
        });

        it('should scroll right when scrollRight is called', () => {
            component.scrollRight();
            expect(component.episodesContainer?.nativeElement.scrollBy).toHaveBeenCalledWith({
                left: 200,
                behavior: 'smooth',
            });
        });
    });

    describe('Cleanup', () => {
        it('should unsubscribe and disconnect ResizeObserver on destroy', () => {
            const unsubscribeSpy = jest.spyOn(component.loadDataSubscription, 'unsubscribe');
            component.resizeObserver = {
                disconnect: jest.fn(),
            } as unknown as ResizeObserver;

            component.ngOnDestroy();

            expect(unsubscribeSpy).toHaveBeenCalled();
            if (component.resizeObserver) {
                expect(component.resizeObserver.disconnect).toHaveBeenCalled();
            }
        });
    });
});
