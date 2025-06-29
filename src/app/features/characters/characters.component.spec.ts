import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CharactersComponent } from './characters.component';
import { CharacterService } from '../../shared/services/character.service';
import { FavouriteService } from '../../shared/services/favourite.service';
import { ModalService } from '../../shared/services/modal.service';
import { ToastService } from '../../shared/services/toast.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { Character } from '../../shared/models/character.model';

describe('CharactersComponent', () => {
    let component: CharactersComponent;
    let fixture: ComponentFixture<CharactersComponent>;

    const mockCharacterService = {
        getAllCharacters: jest.fn(() =>
            of({
                info: { count: 1, pages: 1, next: null, prev: null },
                results: [],
            }),
        ),
    };

    const mockFavouriteService = {
        isFavourite: jest.fn(),
        addToFavourites: jest.fn(),
        removeFromFavourites: jest.fn(),
        getAllFavourites: jest.fn(() => []),
    };

    const mockModalService = {
        open: jest.fn(),
    };

    const mockToastService = {
        add: jest.fn(),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CharactersComponent, CommonModule, ReactiveFormsModule],
            providers: [
                FormBuilder,
                { provide: CharacterService, useValue: mockCharacterService },
                { provide: FavouriteService, useValue: mockFavouriteService },
                { provide: ModalService, useValue: mockModalService },
                { provide: ToastService, useValue: mockToastService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CharactersComponent);
        component = fixture.componentInstance;

        component.ngOnInit = jest.fn();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Favourites', () => {
        it('should add to favourites when not already favourite', () => {
            mockFavouriteService.isFavourite.mockReturnValue(false);

            component.onFavouriteClick({ stopPropagation: jest.fn() } as any, 1, 'Rick');

            expect(mockFavouriteService.addToFavourites).toHaveBeenCalledWith(1);
            expect(mockToastService.add).toHaveBeenCalledWith(
                'Rick added to favourites.',
                4000,
                'success',
            );
        });

        it('should remove from favourites when already favourite', () => {
            mockFavouriteService.isFavourite.mockReturnValue(true);

            component.onFavouriteClick({ stopPropagation: jest.fn() } as any, 1, 'Rick');

            expect(mockFavouriteService.removeFromFavourites).toHaveBeenCalledWith(1);
            expect(mockToastService.add).toHaveBeenCalledWith(
                'Rick removed from favourites',
                4000,
                'error',
            );
        });
    });

    describe('Filters', () => {
        it('should update filters when form is submitted', () => {
            component.filterForm.setValue({
                name: 'Rick',
                status: 'Alive',
                gender: 'Male',
                favourites: '',
            });

            component.onFilterSubmit();

            expect(component.filters).toEqual({
                name: 'Rick',
                status: 'Alive',
                gender: 'Male',
                favourites: '',
            });
        });

        it('should clear filters and reset form', () => {
            component.filterForm.setValue({
                name: 'Rick',
                status: 'Alive',
                gender: 'Male',
                favourites: '',
            });

            component.onClearFilter();

            expect(component.filters).toEqual([]);
            expect(component.filterForm.value).toEqual({
                name: '',
                status: '',
                gender: '',
                favourites: '',
            });
            expect(mockToastService.add).toHaveBeenCalledWith('Filters removed', 4000, 'error');
        });
    });

    describe('Modal', () => {
        it('should open modal with character details', () => {
            const mockCharacter: Character = {
                id: 1,
                name: 'Rick',
                status: 'Alive',
                species: 'Human',
                type: '',
                gender: 'Male',
                origin: { name: 'Earth', url: '' },
                location: { name: 'Earth', url: '' },
                image: '',
                episode: [],
                url: '',
                created: '',
            };

            component.onCardClick(mockCharacter);

            expect(mockModalService.open).toHaveBeenCalled();
        });
    });

    describe('Scroll Behavior', () => {
        beforeEach(() => {
            component.hasMore = true;
            component.isLoading = false;
        });

        it('should return false if no more content to load', () => {
            component.hasMore = false;
            const mockEvent = {
                target: {
                    scrollTop: 100,
                    clientHeight: 100,
                    scrollHeight: 200,
                },
            };
            expect(component.atBottom(mockEvent)).toBe(false);
        });

        it('should return false if currently loading', () => {
            component.isLoading = true;
            const mockEvent = {
                target: {
                    scrollTop: 100,
                    clientHeight: 100,
                    scrollHeight: 200,
                },
            };
            expect(component.atBottom(mockEvent)).toBe(false);
        });

        it('should return true for non-scrollable container when has more content', () => {
            const mockEvent = {
                target: {
                    scrollTop: 0,
                    clientHeight: 500,
                    scrollHeight: 500,
                },
            };
            expect(component.atBottom(mockEvent)).toBe(true);
        });

        it('should detect when at bottom of scrollable container', () => {
            const mockEvent = {
                target: {
                    scrollTop: 80,
                    clientHeight: 100,
                    scrollHeight: 200,
                },
            };
            expect(component.atBottom(mockEvent)).toBe(true);
        });

        it('should return false when not at bottom of scrollable container', () => {
            const mockEvent = {
                target: {
                    scrollTop: 50,
                    clientHeight: 100,
                    scrollHeight: 200,
                },
            };
            expect(component.atBottom(mockEvent)).toBe(false);
        });
    });

    describe('Form Behavior', () => {
        it('should disable other filters when favourites is selected', () => {
            component.filterForm.get('favourites')?.setValue('favourites');
            expect(component.filterForm.get('name')?.disabled).toBe(true);
            expect(component.filterForm.get('status')?.disabled).toBe(true);
            expect(component.filterForm.get('gender')?.disabled).toBe(true);
        });

        it('should enable other filters when favourites is deselected', () => {
            component.filterForm.get('favourites')?.setValue('favourites');
            component.filterForm.get('favourites')?.setValue('');
            expect(component.filterForm.get('name')?.enabled).toBe(true);
            expect(component.filterForm.get('status')?.enabled).toBe(true);
            expect(component.filterForm.get('gender')?.enabled).toBe(true);
        });
    });

    describe('Filter Handling', () => {
        it('should show toast when no favourites exist', () => {
            mockFavouriteService.getAllFavourites.mockReturnValue([]);
            component.filterForm.get('favourites')?.setValue('favourites');
            component.onFilterSubmit();
            expect(mockToastService.add).toHaveBeenCalledWith(
                'No favourite characters',
                4000,
                'error',
            );
        });

        it('should reset pagination when filters change', () => {
            component.page = 5;
            component.onFilterSubmit();
            expect(component.page).toBe(1);
        });
    });

    describe('Cleanup', () => {
        it('should unsubscribe from subscriptions on destroy', () => {
            const unsubscribeSpy = jest.spyOn(
                component.getAllCharactersSubscription,
                'unsubscribe',
            );
            component.ngOnDestroy();
            expect(unsubscribeSpy).toHaveBeenCalled();
        });
    });
});
