import {Injectable, signal} from '@angular/core';

const STORAGE_KEY = 'isAdmin';

@Injectable({providedIn: 'root'})
export class AppStateService {

  readonly isAdmin = signal<boolean>(this.readInitial());

  toggleAdmin(next: boolean): void {
    this.isAdmin.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'true' : 'false');
    } catch (e) {
      console.error('Error al guardar el estado de administrador en el almacenamiento local:', e);
    }
  }

  private readInitial(): boolean {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) === true : false;
    } catch {
      return false;
    }
  }
}
