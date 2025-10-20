import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MatToolbarModule} from '@angular/material/toolbar';
import {ProductsSectionComponent} from './products/products-section.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarModule, ProductsSectionComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'tech-test-angular';
}
