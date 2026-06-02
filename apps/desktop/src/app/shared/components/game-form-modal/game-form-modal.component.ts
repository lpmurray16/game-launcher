import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { GameFormModalService } from '../../../core/services/game-form-modal.service';
import { GameApiService } from '../../../core/services/game-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { NavService } from '../../../core/services/nav.service';
import { GameFormComponent } from '../../../features/games/game-form/game-form.component';
import { CreateGameRequest, UpdateGameRequest } from '../../../core/models/game.models';

@Component({
  selector: 'app-game-form-modal',
  templateUrl: './game-form-modal.component.html',
  styleUrl: './game-form-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GameFormComponent],
})
export class GameFormModalComponent {
  readonly modalSvc = inject(GameFormModalService);
  private readonly api = inject(GameApiService);
  private readonly toast = inject(ToastService);
  private readonly nav = inject(NavService);

  readonly isSubmitting = signal(false);

  onSubmit(request: CreateGameRequest | UpdateGameRequest): void {
    const game = this.modalSvc.editingGame();
    this.isSubmitting.set(true);

    const call = game
      ? this.api.update(game.id, request as UpdateGameRequest)
      : this.api.create(request as CreateGameRequest);

    call.subscribe({
      next: () => {
        this.toast.success(game ? 'Game updated.' : 'Game added.');
        this.isSubmitting.set(false);
        this.modalSvc.close();
        this.nav.setZone('library');
      },
      error: () => {
        this.toast.error('Failed to save game. Please try again.');
        this.isSubmitting.set(false);
      },
    });
  }

  onCancel(): void {
    this.modalSvc.close();
    this.nav.setZone('library');
  }

  onBackdropClick(): void {
    this.modalSvc.close();
    this.nav.setZone('library');
  }
}
