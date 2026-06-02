import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faPlay,
  faHeart,
  faEllipsisV,
  faPencil,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { Game } from '../../../core/models/game.models';

@Component({
  selector: 'app-game-card',
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FaIconComponent],
})
export class GameCardComponent {
  readonly game = input.required<Game>();
  readonly launched = output<string>();
  readonly deleted = output<string>();

  readonly icons = {
    play: faPlay,
    heart: faHeart,
    heartRegular: faHeartRegular,
    ellipsis: faEllipsisV,
    edit: faPencil,
    trash: faTrash,
  };

  readonly menuOpen = signal(false);

  onLaunch(): void {
    this.launched.emit(this.game().id);
  }

  onDelete(): void {
    this.menuOpen.set(false);
    this.deleted.emit(this.game().id);
  }

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
