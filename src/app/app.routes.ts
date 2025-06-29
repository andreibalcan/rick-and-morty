import { Routes } from '@angular/router';
import { HomeComponent } from './core/components/home/home.component';
import { PageNotFoundComponent } from './core/components/page-not-found/page-not-found.component';
import { CharactersComponent } from './features/characters/characters.component';

export const routes: Routes = [
    { path: '', title: 'Home', component: HomeComponent },
    { path: 'characters', title: 'Characters', component: CharactersComponent },
    {
        path: '**',
        title: 'Page not found',
        component: PageNotFoundComponent,
    },
];
