/**
 * Author: Abdul Faheem A
 * Copyrights: Gahranox Carvel Labs Technologies
 * Purpose: Root component of the Bill0 application, coordinating top-level navigation and application-wide state.
 * Usecase: Acts as the entry point for the Angular application, hosting the primary router outlet for feature views.
 */

import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Bill0');
}
