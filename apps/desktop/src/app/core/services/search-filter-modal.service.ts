import { Injectable, signal } from '@angular/core';
import { LibraryFilter } from '../models/game.models';

@Injectable({ providedIn: 'root' })
export class SearchFilterModalService {
  readonly isOpen = signal(false);

  readonly filter = signal<LibraryFilter>({
    search: '',
    favoritesOnly: false,
    sortField: 'name',
    sortDirection: 'asc',
  });

  readonly tags = signal<string[]>([]);
  readonly selectedTags = signal<string[]>([]);

  open(): void {
    this.isOpen.set(true);
  }
  close(): void {
    this.isOpen.set(false);
  }

  applyFilterPatch(patch: Partial<LibraryFilter>): void {
    this.filter.update((f) => ({ ...f, ...patch }));
  }

  applyTagChange(tag: string): void {
    this.selectedTags.update((tags) =>
      tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag]
    );
  }

  clearTags(): void {
    this.selectedTags.set([]);
  }
}
