/**
 * Author: Abdul Faheem A
 * Copyrights: Gahranox Carvel Labs Technologies
 * Purpose: Unit tests for CalculationService.
 * Usecase: Ensures accuracy of financial calculations across various scenarios (VAT exclusive/inclusive, discounts, proration).
 */

import { TestBed } from '@angular/core/testing';
import { CalculationService } from '../app/core/calculation.service';
import { CurrencyCode, TaxType, LineItem } from '../app/core/models';

describe('CalculationService', () => {
    let service: CalculationService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CalculationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    /**
     * Test logic for calculateLineItem with exclusive tax.
     */
    it('should calculate line item with exclusive tax correctly', () => {
        const item: Partial<LineItem> = {
            quantity: 2,
            unitPrice: { amount: 1000, currency: CurrencyCode.USD }, // $10.00
            taxData: { rate: 15, type: TaxType.Exclusive },
            discount: { amount: 200, currency: CurrencyCode.USD } // $2.00
        };

        const result = service.calculateLineItem(item);

        // Subtotal = 2 * 1000 = 2000
        // Taxable = 2000 - 200 = 1800
        // Tax = 1800 * 0.15 = 270
        // Total = 1800 + 270 = 2070
        expect(result.subtotal.amount).toBe(2000);
        expect(result.taxAmount.amount).toBe(270);
        expect(result.total.amount).toBe(2070);
    });

    /**
     * Test logic for calculateLineItem with inclusive tax.
     */
    it('should calculate line item with inclusive tax correctly', () => {
        const item: Partial<LineItem> = {
            quantity: 1,
            unitPrice: { amount: 1150, currency: CurrencyCode.USD }, // $11.50
            taxData: { rate: 15, type: TaxType.Inclusive },
            discount: { amount: 0, currency: CurrencyCode.USD }
        };

        const result = service.calculateLineItem(item);

        // Subtotal = 1150
        // Tax = 1150 - (1150 / 1.15) = 1150 - 1000 = 150
        // Total = 1150
        expect(result.subtotal.amount).toBe(1150);
        expect(result.taxAmount.amount).toBe(150);
        expect(result.total.amount).toBe(1150);
    });

    /**
     * Test logic for proration calculation.
     */
    it('should calculate proration factor correctly', () => {
        const start = new Date('2024-01-01');
        const end = new Date('2024-01-15');
        const pStart = new Date('2024-01-01');
        const pEnd = new Date('2024-01-31');

        const result = service.calculateProration(start, end, pStart, pEnd);

        // Total days in Jan = 31
        // Days of use (1 to 15) = 15
        // Factor = 15 / 31
        expect(result.daysOfUse).toBe(15);
        expect(result.totalDaysInPeriod).toBe(31);
        expect(result.factor).toBeCloseTo(15 / 31, 5);
    });
});
