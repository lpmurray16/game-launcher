import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateGameRequest, Game, UpdateGameRequest } from '../models/game.models';

@Injectable({ providedIn: 'root' })
export class GameApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5000/api/games';

  getAll(): Observable<Game[]> {
    return this.http.get<Game[]>(this.baseUrl);
  }

  getById(id: string): Observable<Game> {
    return this.http.get<Game>(`${this.baseUrl}/${id}`);
  }

  create(request: CreateGameRequest): Observable<Game> {
    return this.http.post<Game>(this.baseUrl, request);
  }

  update(id: string, request: UpdateGameRequest): Observable<Game> {
    return this.http.put<Game>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  launch(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/${id}/launch`, {});
  }
}
