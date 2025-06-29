import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class FavouriteService {
    constructor() {}

    public addToFavourites(id: number): void {
        const existing = localStorage.getItem('favourites');
        const favorites = existing ? JSON.parse(existing) : [];

        if (!favorites.includes(id)) {
            favorites.push(id);
            localStorage.setItem('favourites', JSON.stringify(favorites));
        }
    }

    public removeFromFavourites(id: number): void {
        const existing = localStorage.getItem('favourites');
        const favorites = existing ? JSON.parse(existing) : [];

        const updated = favorites.filter((favId: number) => favId !== id);
        localStorage.setItem('favourites', JSON.stringify(updated));
    }

    public isFavourite(id: number): boolean {
        const existing = localStorage.getItem('favourites');
        const favorites = existing ? JSON.parse(existing) : [];
        return favorites.includes(id);
    }

    public getAllFavourites(): number[] {
        const existing = localStorage.getItem('favourites');
        return existing ? JSON.parse(existing) : [];
    }
}
