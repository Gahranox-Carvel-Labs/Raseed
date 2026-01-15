/**
 * Author: Abdul Faheem A
 * Copyrights: Gahranox Carvel Labs Technologies
 * Purpose: Unit tests for InvoiceGeneratorComponent.
 * Usecase: Ensures UI logic, form validation, and reactive recalculations work as expected.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvoiceGeneratorComponent } from '../app/features/invoice-generator/invoice-generator.component';
import { ReactiveFormsModule } from '@angular/forms';
import { BillingService } from '../app/core/billing.service';
import { CalculationService } from '../app/core/calculation.service';
import { CurrencyCode } from '../app/core/models';

describe('InvoiceGeneratorComponent', () => {
    let component: InvoiceGeneratorComponent;
    let fixture: ComponentFixture<InvoiceGeneratorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [InvoiceGeneratorComponent, ReactiveFormsModule],
            providers: [BillingService, CalculationService]
        }).compileComponents();

        fixture = TestBed.createComponent(InvoiceGeneratorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    /**
     * Test logic for adding line items.
     */
    it('should add a line item correctly', () => {
        const initialCount = component.lineItems.length;
        component.addLineItem();
        expect(component.lineItems.length).toBe(initialCount + 1);
    });

    /**
     * Test logic for form validation.
     */
    it('should be invalid when required fields are missing', () => {
        component.invoiceForm.patchValue({ currency: '' });
        expect(component.invoiceForm.valid).toBeFalsy();
    });

    /**
     * Test logic for currency selection change.
     */
    it('should update currency correctly', () => {
        component.invoiceForm.patchValue({ currency: CurrencyCode.INR });
        expect(component.invoiceForm.value.currency).toBe(CurrencyCode.INR);
    });
});
