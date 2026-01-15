/**
 * Author: Abdul Faheem A
 * Copyrights: Gahranox Carvel Labs Technologies
 * Purpose: Defines the primary navigation routes for the Bill0 application.
 * Usecase: Maps URL paths to specific feature components like the Invoice Generator and Bill0 Pro views.
 */

import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/invoice-generator/invoice-generator.component').then(m => m.InvoiceGeneratorComponent)
    },
    {
        path: 'Bill0-pro',
        loadComponent: () => import('./features/Bill0-pro/Bill0-pro.component').then(m => m.Bill0ProComponent)
    }
];
