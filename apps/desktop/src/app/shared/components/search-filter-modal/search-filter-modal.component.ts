import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faSearch,
  faHeart,
  faTimes,
  faCheck,
  faSortAlphaAsc,
} from '@fortawesome/free-solid-svg-icons';
import { LibraryFilter, SortField } from '../../../core/models/game.models';
import { NavService } from '../../../core/services/nav.service';

type FocusSection = 'search' | 'favorites' | 'sort' | 'tags' | 'close';

@Component({
  selector: 'app-search-filter-modal',
  templateUrl: './search-filter-modal.component.html',
  styleUrl: './search-filter-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, FaIconComponent],
})
export class SearchFilterModalComponent implements OnInit {
  private readonly nav = inject(NavService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isOpen = input<boolean>(false);
  readonly filter = input.required<LibraryFilter>();
  readonly tags = input<string[]>([]);
  readonly selectedTags = input<string[]>([]);

  readonly filterChange = output<Partial<LibraryFilter>>();
  readonly tagChange = output<string>();
  readonly closed = output<void>();

  readonly icons = {
    search: faSearch,
    heart: faHeart,
    close: faTimes,
    check: faCheck,
    sort: faSortAlphaAsc,
  };

  readonly sortOptions: { value: SortField; label: string }[] = [
    { value: 'name', label: 'Name' },
    { value: 'lastPlayedAt', label: 'Last Played' },
    { value: 'playCount', label: 'Play Count' },
    { value: 'createdAt', label: 'Date Added' },
  ];

  readonly sections = computed<FocusSection[]>(() =>
    this.tags().length > 0
      ? ['search', 'favorites', 'sort', 'tags', 'close']
      : ['search', 'favorites', 'sort', 'close']
  );
  readonly focusedSection = signal<FocusSection>('search');
  readonly focusedSortIndex = signal(0);
  readonly focusedTagIndex = signal(0);

  readonly currentSortIndex = computed(() =>
    this.sortOptions.findIndex((o) => o.value === this.filter().sortField)
  );

  ngOnInit(): void {
    this.focusedSortIndex.set(this.currentSortIndex());

    this.nav
      .actionsFor('modal')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((action) => {
        const sections = this.sections();
        const section = this.focusedSection();
        const sIdx = sections.indexOf(section);

        if (action === 'back') {
          this.onClose();
          this.nav.setZone('library');
          return;
        }
        if (action === 'up' && sIdx > 0) {
          this.focusedSection.set(sections[sIdx - 1]);
        } else if (action === 'down' && sIdx < sections.length - 1) {
          this.focusedSection.set(sections[sIdx + 1]);
        } else if (action === 'confirm') {
          if (section === 'close') {
            this.onClose();
            this.nav.setZone('library');
          } else if (section === 'favorites') this.onFavoritesClick();
          else if (section === 'sort') {
            this.onSortClick(this.sortOptions[this.focusedSortIndex()].value);
          } else if (section === 'tags') {
            const tag = this.tags()[this.focusedTagIndex()];
            if (tag) this.onTagClick(tag);
          }
        } else if (section === 'sort') {
          if (action === 'left')
            this.focusedSortIndex.update((i) => Math.max(0, i - 1));
          else if (action === 'right')
            this.focusedSortIndex.update((i) =>
              Math.min(this.sortOptions.length - 1, i + 1)
            );
        } else if (section === 'tags') {
          if (action === 'left')
            this.focusedTagIndex.update((i) => Math.max(0, i - 1));
          else if (action === 'right')
            this.focusedTagIndex.update((i) =>
              Math.min(this.tags().length - 1, i + 1)
            );
        }
      });
  }

  onSearchInput(value: string): void {
    this.filterChange.emit({ search: value });
  }

  onFavoritesClick(): void {
    this.filterChange.emit({ favoritesOnly: !this.filter().favoritesOnly });
  }

  onSortClick(value: SortField): void {
    this.filterChange.emit({ sortField: value });
  }

  onTagClick(tag: string): void {
    this.tagChange.emit(tag);
  }

  onClose(): void {
    this.closed.emit();
  }
}
