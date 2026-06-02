import { inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Observable } from 'rxjs';
import { GamepadAction, GamepadService } from './gamepad.service';

export type NavZone = 'topbar' | 'library' | 'form' | 'modal';

@Injectable({ providedIn: 'root' })
export class NavService {
  private readonly gamepad = inject(GamepadService);
  private readonly router = inject(Router);

  readonly zone = signal<NavZone>('library');
  private zoneActivatedAt = 0;
  private readonly ZONE_COOLDOWN_MS = 300;

  constructor() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e) => {
        const url = (e as NavigationEnd).urlAfterRedirects;
        if (url.startsWith('/games/')) {
          this.setZone('form');
        } else {
          this.setZone('library');
        }
      });
  }

  setZone(zone: NavZone): void {
    this.zone.set(zone);
    this.zoneActivatedAt = performance.now();
  }

  actionsFor(zone: NavZone): Observable<GamepadAction> {
    return new Observable<GamepadAction>((subscriber) => {
      const sub = this.gamepad.actions$.subscribe((action) => {
        if (
          this.zone() === zone &&
          performance.now() - this.zoneActivatedAt > this.ZONE_COOLDOWN_MS
        ) {
          subscriber.next(action);
        }
      });
      return () => sub.unsubscribe();
    });
  }
}
