import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  { path: '', redirectTo: 'library', pathMatch: 'full' },
  {
    path: 'library',
    loadComponent: () =>
      import('./features/library/library.component').then(
        (m) => m.LibraryComponent
      ),
  },
  {
    path: 'games/add',
    loadComponent: () =>
      import('./features/games/add-game/add-game.component').then(
        (m) => m.AddGameComponent
      ),
  },
  {
    path: 'games/edit/:id',
    loadComponent: () =>
      import('./features/games/edit-game/edit-game.component').then(
        (m) => m.EditGameComponent
      ),
  },
  { path: '**', redirectTo: 'library' },
];
