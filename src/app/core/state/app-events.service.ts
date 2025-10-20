import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';


@Injectable({ providedIn: 'root' })
export class AppEventsService {
  private readonly productMutableSubject = new Subject<void>();
  readonly productMutate$ = this.productMutableSubject.asObservable();

  notifyProductsMutated(): void {
    this.productMutableSubject.next();
  }
}
