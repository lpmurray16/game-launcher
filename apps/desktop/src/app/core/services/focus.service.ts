import { Injectable, signal } from '@angular/core';

export type FocusZone = 'topbar' | 'library' | 'form' | 'modal';

@Injectable({ providedIn: 'root' })
export class FocusService {
  readonly zone = signal<FocusZone>('library');

  set(zone: FocusZone): void {
    this.zone.set(zone);
  }

  is(zone: FocusZone): boolean {
    return this.zone() === zone;
  }
}
