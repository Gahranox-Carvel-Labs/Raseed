/**
 * Author: Abdul Faheem A
 * Copyrights: Gahranox Carvel Labs Technologies
 * Purpose: Unit tests for PDF Helper utility.
 * Usecase: Validates formatting logic and PDF generation triggers.
 */

import { formatMoney } from '../app/utils/pdf-helper';
import { CurrencyCode } from '../app/core/models';

describe('PdfHelper', () => {

    /**
     * Test logic for currency formatting.
     */
    it('should format money correctly for USD', () => {
        const result = formatMoney(1050, CurrencyCode.USD);
        expect(result).toBe('USD 10.50');
    });

    /**
     * Test logic for large amount formatting with commas.
     */
    it('should format large amounts with commas', () => {
        const result = formatMoney(100000000, CurrencyCode.USD); // $1,000,000.00
        expect(result).toBe('USD 1,000,000.00');
    });

    /**
     * Test logic for regional currency formatting.
     */
    it('should format regional currencies correctly', () => {
        const result = formatMoney(50000, CurrencyCode.AED);
        expect(result).toBe('AED 500.00');
    });
});
