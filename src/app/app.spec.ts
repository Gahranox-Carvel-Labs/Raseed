/**
 * Author: Abdul Faheem A
 * Copyrights: Gahranox Carvel Labs Technologies
 * Purpose: Unit tests for the root App component.
 * Usecase: Ensures the application shell boots correctly and initializes state.
 */

import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter } from '@angular/router';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
