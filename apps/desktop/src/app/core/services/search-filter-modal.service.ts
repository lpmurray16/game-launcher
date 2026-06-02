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
  readonly selectedTag = signal<string | null>(null);

  open(): void {
    this.isOpen.set(true);
  }
  close(): void {
    this.isOpen.set(false);
  }

  applyFilterPatch(patch: Partial<LibraryFilter>): void {
    this.filter.update((f) => ({ ...f, ...patch }));
  }

  applyTagChange(tag: string | null): void {
    this.selectedTag.update((t) => (tag === null || t === tag ? null : tag));
  }
}
