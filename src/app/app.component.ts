import {Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {MatToolbarModule} from '@angular/material/toolbar';
import {ProductsSectionComponent} from './products/components/products-section.component';
import {AppStateService} from './core/state/app-state.service';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatButton} from '@angular/material/button';
import {NgIf} from '@angular/common';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AppEventsService} from './core/state/app-events.service';
import {ProductNewDialogComponent} from './products/dialogs/product-new-dialog/product-new-dialog.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatToolbarModule,
    ProductsSectionComponent,
    MatSlideToggleModule,
    MatButton,
    MatTooltipModule,
    NgIf,
    MatDialogModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'tech-test-angular';

  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  private readonly events = inject(AppEventsService);
  private readonly appState = inject(AppStateService);
  readonly isAdmin = this.appState.isAdmin;

  onToggleAdmin(checked: boolean): void {
    this.appState.toggleAdmin(checked);
  }

  openNewProductDialog(): void {
    const ref = this.dialog.open(ProductNewDialogComponent, {
      width: '55vw',
      maxWidth: '600px',
      maxHeight: '90vh',
      autoFocus: false,
      restoreFocus: true,
    });

    ref.afterClosed().subscribe(result => {
      if (result === 'created') {
        // notifica a la lista que refresque
        this.events.notifyProductsMutated();
        this.snack.open('Lista actualizada', undefined, { duration: 1500 });
      }
    });
  }
}
