import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { CreateGameRequest } from '../../../core/models/game.models';
import { GameApiService } from '../../../core/services/game-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { GameFormComponent } from '../game-form/game-form.component';

@Component({
  selector: 'app-add-game',
  templateUrl: './add-game.component.html',
  styleUrl: './add-game.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GameFormComponent],
})
export class AddGameComponent {
  private readonly api = inject(GameApiService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly isSubmitting = signal(false);

  onSubmit(request: CreateGameRequest): void {
    this.isSubmitting.set(true);

    this.api.create(request).subscribe({
      next: () => {
        this.toast.success('Game added successfully.');
        this.router.navigate(['/library']);
      },
      error: () => {
        this.toast.error('Failed to save game. Please try again.');
        this.isSubmitting.set(false);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/library']);
  }
}
