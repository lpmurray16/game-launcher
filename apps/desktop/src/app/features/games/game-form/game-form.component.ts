import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
  viewChildren,
  viewChild,
  ElementRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { NavService } from '../../../core/services/nav.service';

const FIELD_ORDER = [
  'name',
  'launchPath',
  'arguments',
  'workingDirectory',
  'coverArtPath',
  'tags',
  'isFavorite',
  'cancel',
  'save',
] as const;
type FormField = (typeof FIELD_ORDER)[number];

@Component({
  selector: 'app-game-form',
  templateUrl: './game-form.component.html',
  styleUrl: './game-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FaIconComponent],
})
export class GameFormComponent implements OnInit, AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly nav = inject(NavService);
  private readonly destroyRef = inject(DestroyRef);

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
  readonly focusedField = signal<FormField>('name');

  private fieldEls = new Map<FormField, HTMLElement>();
  readonly fieldRefs = viewChildren<ElementRef<HTMLElement>>('fieldRef');

  private readonly launchPathPicker =
    viewChild<ElementRef<HTMLInputElement>>('launchPathPicker');
  private readonly workingDirPicker =
    viewChild<ElementRef<HTMLInputElement>>('workingDirPicker');
  private activePickerField: 'launchPath' | 'workingDirectory' | null = null;

  form!: FormGroup;

  ngAfterViewInit(): void {
    this.nav
      .actionsFor('form')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((action) => {
        const idx = FIELD_ORDER.indexOf(this.focusedField());
        if (action === 'up') {
          const next = FIELD_ORDER[Math.max(0, idx - 1)];
          this.focusedField.set(next);
          this.fieldEls.get(next)?.focus();
        } else if (action === 'down') {
          const next = FIELD_ORDER[Math.min(FIELD_ORDER.length - 1, idx + 1)];
          this.focusedField.set(next);
          this.fieldEls.get(next)?.focus();
        } else if (action === 'back') {
          this.onCancel();
        } else if (action === 'confirm') {
          const field = this.focusedField();
          if (field === 'save') this.onSubmit();
          else if (field === 'cancel') this.onCancel();
          else if (field === 'isFavorite') {
            this.form
              .get('isFavorite')
              ?.setValue(!this.form.get('isFavorite')?.value);
          } else {
            this.fieldEls.get(field)?.focus();
          }
        }
      });
  }

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
        ? this.launchPathPicker()?.nativeElement
        : this.workingDirPicker()?.nativeElement;
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
