import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Episode, EpisodeResponse } from '../models/episode.model';

@Injectable({
    providedIn: 'root',
})
export class EpisodeService {
    private readonly http: HttpClient = inject(HttpClient);

    private apiUrl = 'https://rickandmortyapi.com/api/episode';

    public getAllEpisodes(): Observable<EpisodeResponse> {
        return this.http.get<any>(`${this.apiUrl}`);
    }

    public getEpisodes(id: number[]): Observable<Episode[]> {
        return this.http
            .get<Episode | Episode[]>(`${this.apiUrl}/${id}`)
            .pipe(map(res => (Array.isArray(res) ? res : [res])));
    }
}
