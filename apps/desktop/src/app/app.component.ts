import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TopbarComponent } from './shared/components/topbar/topbar.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { SearchFilterModalComponent } from './shared/components/search-filter-modal/search-filter-modal.component';
import { SearchFilterModalService } from './core/services/search-filter-modal.service';
import { GameFormModalComponent } from './shared/components/game-form-modal/game-form-modal.component';
import { GameFormModalService } from './core/services/game-form-modal.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    RouterModule,
    TopbarComponent,
    ToastComponent,
    SearchFilterModalComponent,
    GameFormModalComponent,
  ],
})
export class AppComponent {
  readonly modalSvc = inject(SearchFilterModalService);
  readonly gameFormModalSvc = inject(GameFormModalService);
}
