import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/invoice-generator/invoice-generator.component').then(m => m.InvoiceGeneratorComponent)
    },
    {
        path: 'raseed-pro',
        loadComponent: () => import('./features/raseed-pro/raseed-pro.component').then(m => m.RaseedProComponent)
    }
];
