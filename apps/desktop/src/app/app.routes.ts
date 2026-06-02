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
  { path: 'games/add', redirectTo: 'library', pathMatch: 'full' },
  { path: 'games/edit/:id', redirectTo: 'library', pathMatch: 'full' },
  { path: '**', redirectTo: 'library' },
];
