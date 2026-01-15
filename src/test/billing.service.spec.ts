/**
 * Author: Abdul Faheem A
 * Copyrights: Gahranox Carvel Labs Technologies
 * Purpose: Unit tests for BillingService.
 * Usecase: Validates state management, invoice numbering, and idempotency logic.
 */

import { TestBed } from '@angular/core/testing';
import { BillingService } from '../app/core/billing.service';
import { CurrencyCode, InvoiceStatus, InvoiceType } from '../app/core/models';

describe('BillingService', () => {
    let service: BillingService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(BillingService);
        // Clear local storage for clean tests
        localStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    /**
     * Test logic for sequential invoice numbering.
     */
    it('should generate sequential invoice numbers', () => {
        const year = new Date().getFullYear();
        const num1 = service.generateInvoiceNumber();
        expect(num1).toBe(`INV-${year}-0001`);

        // Mock an existing invoice
        service.invoices.set([{
            invoiceNumber: `INV-${year}-0001`,
            id: '1', issueDate: '', dueDate: '', status: InvoiceStatus.Draft, type: InvoiceType.Simplified,
            seller: {} as any, buyer: {} as any, lineItems: [], subtotal: {} as any, totalDiscount: {} as any,
            totalTax: {} as any, grandTotal: {} as any, currency: CurrencyCode.USD, idempotencyKey: 'k1'
        }]);

        const num2 = service.generateInvoiceNumber();
        expect(num2).toBe(`INV-${year}-0002`);
    });

    /**
     * Test logic for idempotency in invoice creation.
     */
    it('should respect idempotency when creating invoices', () => {
        const key = 'test-idempotency-key';
        const data = { buyer: { name: 'Client' } as any, subtotal: { amount: 100 } as any };

        service.saveSellerProfile({ name: 'Seller' } as any);

        const inv1 = service.createInvoice(data, key);
        const inv2 = service.createInvoice(data, key);

        expect(service.invoices().length).toBe(1);
        expect(inv1.id).toBe(inv2.id);
    });

    /**
     * Test logic for updating invoice status.
     */
    it('should update invoice status correctly', () => {
        service.invoices.set([{ id: 'test-id', status: InvoiceStatus.Draft } as any]);
        service.updateInvoiceStatus('test-id', InvoiceStatus.Finalized);
        expect(service.invoices()[0].status).toBe(InvoiceStatus.Finalized);
    });
});
