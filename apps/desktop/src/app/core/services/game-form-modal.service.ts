import { Injectable, signal } from '@angular/core';
import { Game } from '../models/game.models';

@Injectable({ providedIn: 'root' })
export class GameFormModalService {
  readonly isOpen = signal(false);
  readonly editingGame = signal<Game | null>(null);

  openAdd(): void {
    this.editingGame.set(null);
    this.isOpen.set(true);
  }

  openEdit(game: Game): void {
    this.editingGame.set(game);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.editingGame.set(null);
  }
}
