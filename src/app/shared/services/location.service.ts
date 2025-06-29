import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Location } from '../models/location.model';

@Injectable({
    providedIn: 'root',
})
export class LocationService {
    private readonly http: HttpClient = inject(HttpClient);

    public getLocation(url: string): Observable<Location> {
        return this.http.get<Location>(url);
    }
}
