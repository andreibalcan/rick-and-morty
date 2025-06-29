import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Character, CharacterResponse } from '../../shared/models/character.model';
import { CharacterService } from '../../shared/services/character.service';
import { FavouriteService } from '../../shared/services/favourite.service';
import { ModalService } from '../../shared/services/modal.service';
import { ToastService } from '../../shared/services/toast.service';
import { CharacterDetailsComponent } from '../character-details/character-details.component';

@Component({
    selector: 'app-characters',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './characters.component.html',
    styleUrl: './characters.component.scss',
})
export class CharactersComponent implements OnInit, AfterViewChecked {
    @ViewChild('list') divEl!: ElementRef<HTMLDivElement>;

    public characters: Character[] = [];
    public filters: any = [];
    public isLoading: boolean = false;

    public getAllCharactersSubscription: Subscription = new Subscription();
    private getCharacterSubscription: Subscription = new Subscription();
    public hasMore: boolean = true;
    public page: number = 1;

    private readonly characterService = inject(CharacterService);
    public readonly favouriteService = inject(FavouriteService);
    public readonly filterForm: FormGroup;
    private readonly formBuilder: FormBuilder = inject(FormBuilder);
    private readonly modalService = inject(ModalService);
    private readonly toastService = inject(ToastService);

    constructor() {
        this.filterForm = this.formBuilder.group({
            name: '',
            status: '',
            gender: '',
            favourites: '',
        });

        this.setupFavouritesFormBehavior();
    }

    ngOnInit(): void {
        this.loadCharacters();
    }

    ngAfterViewChecked(): void {
        if (this.divEl && !this.isLoading && this.hasMore) {
            const el = this.divEl.nativeElement;
            if (el.scrollHeight <= el.clientHeight) {
                // Defer with setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
                setTimeout(() => {
                    if (!this.isLoading && this.hasMore) {
                        this.loadCharacters();
                    }
                }, 0);
            }
        }
    }

    public loadCharacters(): void {
        if (!this.hasMore || this.isLoading) return;

        this.isLoading = true;

        this.getAllCharactersSubscription = this.characterService
            .getAllCharacters(this.page, this.filters)
            .subscribe({
                next: (res: CharacterResponse) => {
                    const charactersToAdd = Array.isArray(res)
                        ? res
                        : (res.results || [res]).filter(Boolean);

                    if (charactersToAdd.length === 0 && this.page === 1) {
                        this.hasMore = false;
                        this.characters = [];
                    } else {
                        this.characters = [...this.characters, ...charactersToAdd];
                        this.page++;
                        this.hasMore = !!res.info?.next;
                    }
                    this.isLoading = false;
                },
                error: err => {
                    console.error('Failed to fetch characters', err);
                    this.hasMore = false;
                    const isFilterApplied =
                        this.filterForm &&
                        Object.values(this.filterForm.value).some(value => value && value !== '');

                    if (isFilterApplied) {
                        this.toastService.add('No characters match your filters.', 4000, 'error');
                    } else {
                        this.toastService.add(
                            'Failed to fetch characters. Please try again later.',
                            4000,
                            'error',
                        );
                    }

                    this.isLoading = false;
                },
            });
    }

    public onScroll(event: any): void {
        if (this.atBottom(event)) {
            this.loadCharacters();
        }
    }

    public atBottom(event: any): boolean {
        const el = event.target;
        const isScrollable = el.scrollHeight > el.clientHeight;

        if (!this.hasMore || this.isLoading) {
            return false;
        }

        if (!isScrollable && this.hasMore && !this.isLoading) {
            return true;
        }

        return el.scrollTop + el.clientHeight >= el.scrollHeight - 20;
    }

    public onFavouriteClick(event: any, id: number, name: string): void {
        event.stopPropagation();
        if (this.favouriteService.isFavourite(id)) {
            this.favouriteService.removeFromFavourites(id);
            this.toastService.add(name + ' removed from favourites', 4000, 'error');
        } else {
            this.toastService.add(name + ' added to favourites.', 4000, 'success');
            this.favouriteService.addToFavourites(id);
        }
    }

    public onCardClick(character: Character): void {
        let borderColor = '';

        switch (character.status) {
            case 'Alive':
                borderColor = '#97ce4c';
                break;
            case 'Dead':
                borderColor = '#e4a788';
                break;
            case 'unknown':
                borderColor = '#f0e14a';
                break;
            default:
                borderColor = '#97ce4c';
        }

        this.modalService.open(CharacterDetailsComponent, { character }, borderColor);
    }

    public onFilterSubmit(): void {
        this.page = 1;
        this.hasMore = true;
        this.characters = [];
        this.filters = this.filterForm.value;
        if (
            this.filters.favourites === 'favourites' &&
            this.favouriteService.getAllFavourites().length === 0
        ) {
            this.hasMore = false;
            this.characters = [];
            this.toastService.add('No favourite characters', 4000, 'error');
            return;
        }
        this.loadCharacters();
    }

    public onClearFilter(): void {
        this.filterForm.reset({ name: '', status: '', gender: '', favourites: '' });
        this.page = 1;
        this.hasMore = true;
        this.filters = [];
        this.characters = [];
        this.loadCharacters();
        this.toastService.add('Filters removed', 4000, 'error');
    }

    private setupFavouritesFormBehavior(): void {
        this.filterForm.get('favourites')?.valueChanges.subscribe(value => {
            if (value === 'favourites') {
                this.filterForm.get('name')?.setValue('');
                this.filterForm.get('name')?.disable();
                this.filterForm.get('status')?.setValue('');
                this.filterForm.get('status')?.disable();
                this.filterForm.get('gender')?.setValue('');
                this.filterForm.get('gender')?.disable();
            } else {
                this.filterForm.get('name')?.enable();
                this.filterForm.get('status')?.enable();
                this.filterForm.get('gender')?.enable();
            }
        });
    }

    get isAnyFilterApplied(): boolean {
        return Object.values(this.filterForm.value).some(value => !!value);
    }

    ngOnDestroy(): void {
        if (this.getAllCharactersSubscription) {
            this.getAllCharactersSubscription.unsubscribe();
        }
        if (this.getCharacterSubscription) {
            this.getAllCharactersSubscription.unsubscribe();
        }
    }
}
