import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Character, CharacterResponse } from '../models/character.model';
import { FavouriteService } from './favourite.service';

@Injectable({
    providedIn: 'root',
})
export class CharacterService {
    private readonly http: HttpClient = inject(HttpClient);
    public readonly favouriteService = inject(FavouriteService);

    private apiUrl = 'https://rickandmortyapi.com/api/character';

    public getAllCharacters(page: number = 1, filters: any = {}): Observable<CharacterResponse> {
        const params = new URLSearchParams();

        params.set('page', page.toString());

        if (
            filters.favourites === 'favourites' &&
            this.favouriteService.getAllFavourites().length > 0
        ) {
            const ids = this.favouriteService.getAllFavourites();
            return this.http.get<CharacterResponse>(`${this.apiUrl}/${ids.join(',')}`);
        }

        if (filters.name) params.set('name', filters.name);
        if (filters.status) params.set('status', filters.status);
        if (filters.gender) params.set('gender', filters.gender);

        return this.http.get<CharacterResponse>(`${this.apiUrl}/?${params.toString()}`);
    }
}
