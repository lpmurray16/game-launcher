import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
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
import { NavService } from '../../core/services/nav.service';
import { GameFormModalService } from '../../core/services/game-form-modal.service';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, FaIconComponent, GameCardComponent, SpinnerComponent],
})
export class LibraryComponent implements OnInit {
  private readonly api = inject(GameApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly modalSvc = inject(SearchFilterModalService);
  readonly nav = inject(NavService);
  readonly gameFormModal = inject(GameFormModalService);
  private readonly destroyRef = inject(DestroyRef);

  readonly focusedIndex = signal(0);

  readonly icons = {
    search: faSearch,
    heart: faHeart,
    sort: faSortAlphaAsc,
    gamepad: faGamepad,
    plus: faPlus,
    grid: faThLarge,
    play: faPlay,
  };

  readonly gridSize = signal(Number(localStorage.getItem('gridSize') ?? 160));

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
  get selectedTags() {
    return this.modalSvc.selectedTags;
  }

  readonly allTags = computed(() => {
    const tags = new Set<string>();
    this.allGames().forEach((g) => g.tags.forEach((t) => tags.add(t)));
    return [...tags].sort();
  });

  readonly filteredGames = computed(() => {
    const games = this.allGames();
    const { search, favoritesOnly, sortField, sortDirection } = this.filter();
    const tags = this.selectedTags();

    let result = games;

    if (favoritesOnly) {
      result = result.filter((g) => g.isFavorite);
    }

    if (tags.length > 0) {
      result = result.filter((g) => tags.some((t) => g.tags.includes(t)));
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

    this.nav
      .actionsFor('library')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((action) => {
        if (action === 'select') {
          this.modalSvc.open();
          this.nav.setZone('modal');
          return;
        }
        if (action === 'menu') {
          this.nav.setZone('topbar');
          return;
        }
        const games = this.filteredGames();
        const len = games.length;
        if (len === 0) return;
        const cols = Math.max(
          1,
          Math.floor(window.innerWidth / (this.gridSize() + 16))
        );
        this.focusedIndex.update((i) => {
          if (action === 'up') {
            const next = i - cols;
            if (next < 0) {
              this.nav.setZone('topbar');
              return i;
            }
            return next;
          }
          if (action === 'down') return Math.min(i + cols, len - 1);
          if (action === 'left') return Math.max(i - 1, 0);
          if (action === 'right') return Math.min(i + 1, len - 1);
          return i;
        });
        if (action === 'confirm') {
          const game = games[this.focusedIndex()];
          if (game) this.onGameLaunched(game.id);
        }
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

  onTagSelect(tag: string): void {
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
