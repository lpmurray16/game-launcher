import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
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

type FocusSection = 'search' | 'favorites' | 'sort' | 'tags' | 'close';

@Component({
  selector: 'app-search-filter-modal',
  templateUrl: './search-filter-modal.component.html',
  styleUrl: './search-filter-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, FaIconComponent],
})
export class SearchFilterModalComponent implements OnInit {
  readonly isOpen = input<boolean>(false);
  readonly filter = input.required<LibraryFilter>();
  readonly tags = input<string[]>([]);
  readonly selectedTag = input<string | null>(null);

  readonly filterChange = output<Partial<LibraryFilter>>();
  readonly tagChange = output<string | null>();
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
    this.tagChange.emit(this.selectedTag() === tag ? null : tag);
  }

  onClose(): void {
    this.closed.emit();
  }
}
