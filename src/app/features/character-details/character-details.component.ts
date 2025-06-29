import { Component, ElementRef, inject, Input, OnInit, ViewChild } from '@angular/core';
import { Character } from '../../shared/models/character.model';
import { EpisodeService } from '../../shared/services/episode.service';
import { LocationService } from '../../shared/services/location.service';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { Episode } from '../../shared/models/episode.model';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Location } from '../../shared/models/location.model';

@Component({
    selector: 'app-character-details',
    imports: [CommonModule, AsyncPipe],
    templateUrl: './character-details.component.html',
    styleUrl: './character-details.component.scss',
})
export class CharacterDetailsComponent implements OnInit {
    @Input() character!: Character;
    @ViewChild('episodesContainer') episodesContainer?: ElementRef<HTMLDivElement>;

    private readonly locationService = inject(LocationService);
    private readonly episodeService = inject(EpisodeService);

    public location$: Observable<Location | null> = of();
    public origin$: Observable<Location | null> = of();
    public episodes$: Observable<Episode[]> = of([]);

    public loading: boolean = true;

    public showLeftButton: boolean = false;
    public showRightButton: boolean = false;
    public resizeObserver?: ResizeObserver;

    public loadDataSubscription: Subscription = new Subscription;

    ngOnInit(): void {
        this.loadData();
    }

    ngAfterViewInit() {
        setTimeout(() => this.initializeScrollButtons(), 0);
    }

    private loadData(): void {
        const location$ = this.character.location.url
            ? this.locationService.getLocation(this.character.location.url)
            : of(null);

        const origin$ = this.character.origin.url
            ? this.locationService.getLocation(this.character.origin.url)
            : of(null);

        const episodeIds = this.character.episode
            .map(url => Number(url.split('/').pop()))
            .filter((id): id is number => !isNaN(id));
        const episodes$ = episodeIds.length ? this.episodeService.getEpisodes(episodeIds) : of([]);

        this.loadDataSubscription = forkJoin([location$, origin$, episodes$]).subscribe(([location, origin, episodes]) => {
            this.location$ = of(location);
            this.origin$ = of(origin);
            this.episodes$ = of(episodes);
            this.loading = false;
        });
    }

    private initializeScrollButtons() {
        if (!this.episodesContainer?.nativeElement) {
            setTimeout(() => this.initializeScrollButtons(), 0);
            return;
        }

        this.checkScrollButtons();

        if (typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver(() => {
                this.checkScrollButtons();
            });
            this.resizeObserver.observe(this.episodesContainer.nativeElement);
        }
    }

    public scrollLeft(): void {
        const container = this.episodesContainer?.nativeElement;
        if (!container) return;

        const scrollAmount = 200;
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }

    public scrollRight(): void {
        const container = this.episodesContainer?.nativeElement;
        if (!container) return;

        const scrollAmount = 200;
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }

    public onScroll(): void {
        this.checkScrollButtons();
    }

    public checkScrollButtons() {
        const container = this.episodesContainer?.nativeElement;
        if (!container) return;

        const { scrollLeft, scrollWidth, clientWidth } = container;

        this.showLeftButton = scrollLeft > 0;

        this.showRightButton = scrollLeft < scrollWidth - clientWidth - 1;
    }

    ngOnDestroy() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        if (this.loadDataSubscription) {
            this.loadDataSubscription.unsubscribe();
        }
    }
}
