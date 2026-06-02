import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faGamepad,
  faHeart,
  faPlusCircle,
} from '@fortawesome/free-solid-svg-icons';
import { NavService } from '../../../core/services/nav.service';
import { GameFormModalService } from '../../../core/services/game-form-modal.service';

const NAV_ITEMS = ['library', 'favorites', 'add'] as const;
type TopbarItem = (typeof NAV_ITEMS)[number];

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, FaIconComponent],
})
export class TopbarComponent implements OnInit {
  readonly nav = inject(NavService);
  private readonly router = inject(Router);
  readonly gameFormModal = inject(GameFormModalService);
  private readonly destroyRef = inject(DestroyRef);

  readonly focusedItem = signal<TopbarItem>('library');
  readonly isFocused = signal(false);

  readonly icons = {
    gamepad: faGamepad,
    heart: faHeart,
    plus: faPlusCircle,
  };

  ngOnInit(): void {
    this.nav
      .actionsFor('topbar')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((action) => {
        const items = [...NAV_ITEMS];
        const idx = items.indexOf(this.focusedItem());
        if (action === 'left') {
          this.focusedItem.set(items[Math.max(0, idx - 1)]);
        } else if (action === 'right') {
          this.focusedItem.set(items[Math.min(items.length - 1, idx + 1)]);
        } else if (action === 'down' || action === 'back') {
          this.nav.setZone('library');
          this.isFocused.set(false);
        } else if (action === 'confirm') {
          const item = this.focusedItem();
          if (item === 'library') this.router.navigate(['/library']);
          else if (item === 'favorites')
            this.router.navigate(['/library'], {
              queryParams: { favorites: true },
            });
          else if (item === 'add') {
            this.gameFormModal.openAdd();
          }
          this.nav.setZone('library');
          this.isFocused.set(false);
        }
      });
  }
}
