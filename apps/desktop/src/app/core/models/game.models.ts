export interface Game {
  id: string;
  name: string;
  launchPath: string;
  arguments: string | null;
  workingDirectory: string | null;
  coverArtPath: string | null;
  tags: string[];
  isFavorite: boolean;
  lastPlayedAt: string | null;
  playCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGameRequest {
  name: string;
  launchPath: string;
  arguments: string | null;
  workingDirectory: string | null;
  coverArtPath: string | null;
  tags: string[];
  isFavorite: boolean;
}

export interface UpdateGameRequest {
  name: string;
  launchPath: string;
  arguments: string | null;
  workingDirectory: string | null;
  coverArtPath: string | null;
  tags: string[];
  isFavorite: boolean;
}

export type SortField = 'name' | 'lastPlayedAt' | 'playCount' | 'createdAt';
export type SortDirection = 'asc' | 'desc';

export interface LibraryFilter {
  search: string;
  favoritesOnly: boolean;
  sortField: SortField;
  sortDirection: SortDirection;
}
