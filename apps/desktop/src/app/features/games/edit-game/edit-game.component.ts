import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Game, UpdateGameRequest } from '../../../core/models/game.models';
import { GameApiService } from '../../../core/services/game-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { GameFormComponent } from '../game-form/game-form.component';

@Component({
  selector: 'app-edit-game',
  templateUrl: './edit-game.component.html',
  styleUrl: './edit-game.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GameFormComponent],
})
export class EditGameComponent implements OnInit {
  private readonly api = inject(GameApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  readonly game = signal<Game | null>(null);
  readonly isLoading = signal(true);
  readonly isSubmitting = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/library']);
      return;
    }

    this.api.getById(id).subscribe({
      next: (game) => {
        this.game.set(game);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Game not found.');
        this.router.navigate(['/library']);
      },
    });
  }

  onSubmit(request: UpdateGameRequest): void {
    const id = this.game()?.id;
    if (!id) return;

    this.isSubmitting.set(true);

    this.api.update(id, request).subscribe({
      next: () => {
        this.toast.success('Game updated successfully.');
        this.router.navigate(['/library']);
      },
      error: () => {
        this.toast.error('Failed to update game. Please try again.');
        this.isSubmitting.set(false);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/library']);
  }
}
