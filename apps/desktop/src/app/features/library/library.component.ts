import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faSearch,
  faHeart,
  faSortAlphaAsc,
  faGamepad,
  faPlus,
  faThLarge,
  faPlay,
} from '@fortawesome/free-solid-svg-icons';
import { Game, SortField } from '../../core/models/game.models';
import { GameApiService } from '../../core/services/game-api.service';
import { ToastService } from '../../core/services/toast.service';
import { GameCardComponent } from '../../shared/components/game-card/game-card.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { SearchFilterModalService } from '../../core/services/search-filter-modal.service';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    RouterLink,
    FaIconComponent,
    GameCardComponent,
    SpinnerComponent,
  ],
})
export class LibraryComponent implements OnInit {
  private readonly api = inject(GameApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly modalSvc = inject(SearchFilterModalService);

  readonly icons = {
    search: faSearch,
    heart: faHeart,
    sort: faSortAlphaAsc,
    gamepad: faGamepad,
    plus: faPlus,
    grid: faThLarge,
    play: faPlay,
  };

  readonly gridSize = signal(Number(localStorage.getItem('gridSize') ?? 240));

  readonly heroGame = computed(() => {
    const games = this.allGames();
    if (games.length === 0) return null;
    const lastPlayed = games
      .filter((g) => g.lastPlayedAt)
      .sort(
        (a, b) =>
          new Date(b.lastPlayedAt!).getTime() -
          new Date(a.lastPlayedAt!).getTime()
      )[0];
    return lastPlayed ?? games[0];
  });

  private readonly allGames = signal<Game[]>([]);
  readonly isLoading = signal(true);

  get filter() {
    return this.modalSvc.filter;
  }
  get selectedTag() {
    return this.modalSvc.selectedTag;
  }

  readonly allTags = computed(() => {
    const tags = new Set<string>();
    this.allGames().forEach((g) => g.tags.forEach((t) => tags.add(t)));
    return [...tags].sort();
  });

  readonly filteredGames = computed(() => {
    const games = this.allGames();
    const { search, favoritesOnly, sortField, sortDirection } = this.filter();
    const tag = this.selectedTag();

    let result = games;

    if (favoritesOnly) {
      result = result.filter((g) => g.isFavorite);
    }

    if (tag) {
      result = result.filter((g) => g.tags.includes(tag));
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(term) ||
          g.tags.some((t) => t.toLowerCase().includes(term))
      );
    }

    result = [...result].sort((a, b) => {
      const dir = sortDirection === 'asc' ? 1 : -1;
      if (sortField === 'name') return a.name.localeCompare(b.name) * dir;
      if (sortField === 'playCount') return (a.playCount - b.playCount) * dir;
      if (sortField === 'lastPlayedAt') {
        const aTime = a.lastPlayedAt ? new Date(a.lastPlayedAt).getTime() : 0;
        const bTime = b.lastPlayedAt ? new Date(b.lastPlayedAt).getTime() : 0;
        return (aTime - bTime) * dir;
      }
      if (sortField === 'createdAt') {
        return (
          (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
          dir
        );
      }
      return 0;
    });

    return result;
  });

  constructor() {
    effect(() => {
      this.modalSvc.tags.set(this.allTags());
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      if (params.get('favorites') === 'true') {
        this.modalSvc.applyFilterPatch({ favoritesOnly: true });
      }
    });
    this.loadGames();
  }

  onSearchChange(value: string): void {
    this.modalSvc.applyFilterPatch({ search: value });
  }

  onFavoritesToggle(): void {
    this.modalSvc.applyFilterPatch({
      favoritesOnly: !this.modalSvc.filter().favoritesOnly,
    });
  }

  onSortChange(field: SortField): void {
    const cur = this.modalSvc.filter();
    this.modalSvc.applyFilterPatch({
      sortField: field,
      sortDirection:
        cur.sortField === field && cur.sortDirection === 'asc' ? 'desc' : 'asc',
    });
  }

  onTagSelect(tag: string | null): void {
    this.modalSvc.applyTagChange(tag);
  }

  onGridSizeChange(value: string): void {
    const n = Number(value);
    this.gridSize.set(n);
    localStorage.setItem('gridSize', String(n));
  }

  onGameLaunched(id: string): void {
    this.api.launch(id).subscribe({
      next: () => this.loadGames(),
      error: (err) => {
        const detail =
          err?.error?.detail ?? err?.error?.title ?? 'Failed to launch game.';
        this.toast.error(detail);
      },
    });
  }

  onGameDeleted(id: string): void {
    this.api.delete(id).subscribe({
      next: () =>
        this.allGames.update((games) => games.filter((g) => g.id !== id)),
      error: () => this.toast.error('Failed to delete game.'),
    });
  }

  private loadGames(): void {
    this.isLoading.set(true);
    this.api.getAll().subscribe({
      next: (games) => {
        this.allGames.set(games);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load games. Is the API running?');
        this.isLoading.set(false);
      },
    });
  }
}
