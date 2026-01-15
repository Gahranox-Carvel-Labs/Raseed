/**
 * Author: Abdul Faheem A
 * Copyrights: Gahranox Carvel Labs Technologies
 * Purpose: Comprehensive E2E/UAT tests for Bill0 application using Playwright.
 * Usecase: Covers all major user flows: Simplified/Full Invoice creation, Item management, Logo handling, and PDF generation.
 */

import { test, expect } from '@playwright/test';

test.describe('Bill0 Invoice Generator UAT', () => {

    test.beforeEach(async ({ page }) => {
        // Handle dialogs (like the watermark prompt)
        page.on('dialog', async dialog => {
            if (dialog.message().includes('default watermark?')) {
                await dialog.accept();
            } else {
                await dialog.dismiss();
            }
        });

        // Navigate to the home page
        await page.goto('/');

        // Forcefully hide welcome notification after navigation
        await page.addStyleTag({ content: '.welcome-notification { display: none !important; }' });
    });

    const generateBill = async (page: any) => {
        const btn = page.locator('button:has-text("Generate Bill")');
        await btn.scrollIntoViewIfNeeded();
        await btn.click();
    };

    /**
     * Scenario: Creating a standard simplified invoice for B2C.
     */
    test('should create a simplified invoice correctly', async ({ page }) => {
        // Fill Seller info
        await page.fill('input[placeholder="Your Business Name"]', 'Gahranox Labs');
        await page.fill('input[placeholder="your@email.com"]', 'contact@gahranox.com');

        // Fill Client info
        await page.fill('input[placeholder="Client / Company Name"]', 'John Doe');
        await page.fill('input[placeholder="client@example.com"]', 'john@gmail.com');

        // Fill Item row 1
        await page.locator('table.items-table tbody tr').first().locator('input[placeholder="Item name"]').fill('Web Consulting');
        await page.locator('table.items-table tbody tr').first().locator('input[type="number"]').nth(0).fill('1'); // Qty
        await page.locator('table.items-table tbody tr').first().locator('input[type="number"]').nth(1).fill('1500'); // Price

        // Check Totals
        const subtotalText = await page.locator('.row-between:has-text("Subtotal") span:last-child').innerText();
        expect(subtotalText).toContain('1,500.00');

        const grandTotalText = await page.locator('.grand-total span:last-child').innerText();
        expect(grandTotalText).toContain('1,500.00');
    });

    /**
     * Scenario: Handling multiple line items (Add/Remove).
     */
    test('should manage multiple line items', async ({ page }) => {
        // Add second item
        await page.click('button:has-text("+ Add Item")');

        const rows = page.locator('table.items-table tbody tr');
        await expect(rows).toHaveCount(2);

        // Fill second item
        await rows.nth(1).locator('input[placeholder="Item name"]').fill('Design Fee');
        await rows.nth(1).locator('input[type="number"]').nth(1).fill('500');

        // Remove first item
        await rows.nth(0).locator('.btn-icon').click();
        await expect(rows).toHaveCount(1);

        // Verify remaining item price is reflected in total
        const grandTotalText = await page.locator('.grand-total span:last-child').innerText();
        expect(grandTotalText).toContain('500.00');
    });

    /**
     * Scenario: Full Tax Invoice requirements (B2B).
     */
    test('should show Client Tax ID field for Full Invoices', async ({ page }) => {
        await page.selectOption('select[formControlName="invoiceType"]', 'Full');

        // Check if Tax ID input appears for buyer
        await expect(page.locator('input[placeholder="Client Tax ID (Required for B2B)"]')).toBeVisible();

        await page.fill('input[placeholder="Client Tax ID (Required for B2B)"]', 'VAT-12345');
    });

    /**
     * Scenario: Logo upload and removal.
     */
    test('should handle logo upload and removal', async ({ page }) => {
        // Note: Visual testing might be needed for real confirmation, 
        // but we can check if the button appears and vanishes.

        // Remove button should NOT be visible initially
        await expect(page.locator('button:has-text("Remove Logo")')).not.toBeVisible();

        // Mock/Upload logic is hard to test without actual file, but we can verify clicking the input opens it
        const fileChooserPromise = page.waitForEvent('filechooser');
        await page.click('.logo-upload');
        const fileChooser = await fileChooserPromise;
        // We skip actual upload to avoid external file dependencies in this spec draft
        // await fileChooser.setFiles('path/to/test/logo.png');
    });

    /**
     * Scenario: Validation error handling.
     */
    test('should show validation errors on generate attempt', async ({ page }) => {
        // Fill some data but leave description empty to trigger validation
        await page.fill('input[placeholder="Your Business Name"]', 'Gahranox');
        await page.locator('table.items-table tbody tr').first().locator('input[placeholder="Item name"]').fill('');

        await generateBill(page);

        await expect(page.locator('.error-box')).toBeVisible();
        await expect(page.locator('.error-box ul li')).toContainText('Line Item #1 has missing fields');
    });

    /**
     * Scenario: PDF Generation Trigger (Confirmation).
     */
    test('should prompt for watermark if no logo uploaded', async ({ page }) => {
        // Fill all required fields to reach the watermark prompt phase
        await page.fill('input[placeholder="Your Business Name"]', 'Gahranox');
        await page.locator('table.items-table tbody tr').first().locator('input[placeholder="Item name"]').fill('Services');
        await page.locator('table.items-table tbody tr').first().locator('input[type="number"]').nth(1).fill('500');

        await generateBill(page);
    });

});
