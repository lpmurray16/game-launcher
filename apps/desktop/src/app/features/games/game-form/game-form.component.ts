import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faSave,
  faTimes,
  faPlus,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import {
  CreateGameRequest,
  Game,
  UpdateGameRequest,
} from '../../../core/models/game.models';

@Component({
  selector: 'app-game-form',
  templateUrl: './game-form.component.html',
  styleUrl: './game-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FaIconComponent],
})
export class GameFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  readonly game = input<Game | null>(null);
  readonly isSubmitting = input(false);
  readonly submitted = output<CreateGameRequest | UpdateGameRequest>();
  readonly cancelled = output<void>();

  readonly icons = {
    save: faSave,
    cancel: faTimes,
    plus: faPlus,
    trash: faTrash,
  };

  readonly tagInput = signal('');
  readonly tags = signal<string[]>([]);

  private readonly launchPathPicker?: { nativeElement: HTMLInputElement };
  private readonly workingDirPicker?: { nativeElement: HTMLInputElement };
  private activePickerField: 'launchPath' | 'workingDirectory' | null = null;

  form!: FormGroup;

  ngOnInit(): void {
    const existing = this.game();
    this.tags.set(existing?.tags ?? []);

    const strip = (s: string | null | undefined) =>
      (s ?? '')
        .trim()
        .replace(/^["']|["']$/g, '')
        .trim();

    this.form = this.fb.group({
      name: [
        existing?.name ?? '',
        [Validators.required, Validators.maxLength(200)],
      ],
      launchPath: [
        strip(existing?.launchPath),
        [Validators.required, Validators.maxLength(1000)],
      ],
      arguments: [strip(existing?.arguments), Validators.maxLength(2000)],
      workingDirectory: [
        strip(existing?.workingDirectory),
        Validators.maxLength(1000),
      ],
      coverArtPath: [strip(existing?.coverArtPath), Validators.maxLength(1000)],
      isFavorite: [existing?.isFavorite ?? false],
    });
  }

  addTag(): void {
    const tag = this.tagInput().trim();
    if (tag && !this.tags().includes(tag)) {
      this.tags.update((t) => [...t, tag]);
    }
    this.tagInput.set('');
  }

  removeTag(tag: string): void {
    this.tags.update((t) => t.filter((x) => x !== tag));
  }

  onTagInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTag();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const value = this.form.value;
    const stripQuotes = (s: string | null | undefined) =>
      s
        ?.trim()
        .replace(/^["']|["']$/g, '')
        .trim() ?? null;

    const request: CreateGameRequest = {
      name: value.name,
      launchPath: stripQuotes(value.launchPath) ?? '',
      arguments: stripQuotes(value.arguments),
      workingDirectory: stripQuotes(value.workingDirectory),
      coverArtPath: stripQuotes(value.coverArtPath),
      tags: this.tags(),
      isFavorite: value.isFavorite,
    };

    this.submitted.emit(request);
  }

  browseFile(field: 'launchPath' | 'workingDirectory'): void {
    this.activePickerField = field;
    const picker =
      field === 'launchPath'
        ? this.launchPathPicker?.nativeElement
        : this.workingDirPicker?.nativeElement;
    picker?.click();
  }

  onFilePicked(event: Event, field: 'launchPath' | 'workingDirectory'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const path = (file as File & { path?: string }).path ?? file.name;
    this.form.get(field)?.setValue(path);
    input.value = '';
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
