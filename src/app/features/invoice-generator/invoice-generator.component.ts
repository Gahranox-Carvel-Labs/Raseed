/**
 * Author: Abdul Faheem A
 * Copyrights: Gahranox Carvel Labs Technologies
 * Purpose: Main controller for the invoice generation interface, handling form state, image processing, and PDF triggering.
 * Usecase: Users interact with this component to input billing details, add line items, and export professional invoices.
 */

import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { BillingService } from '../../core/billing.service';
import { CalculationService } from '../../core/calculation.service';
import { CurrencyCode, InvoiceType, TaxType, Invoice, LineItem, InvoiceStatus } from '../../core/models';
import { v4 as uuidv4 } from 'uuid';
import { generateInvoicePDF } from '../../utils/pdf-helper';

@Component({
    selector: 'app-invoice-generator',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './invoice-generator.component.html',
    styleUrl: './invoice-generator.component.css'
})
export class InvoiceGeneratorComponent {
    private fb = inject(FormBuilder);
    private billingService = inject(BillingService);
    private calculationService = inject(CalculationService);

    invoiceForm: FormGroup;
    logoUrl = signal<string | null>(null);
    showWelcome = signal<boolean>(true);

    // Options for Dropdowns
    currencies = Object.values(CurrencyCode);
    invoiceTypes = Object.values(InvoiceType);
    taxTypes = Object.values(TaxType);

    calculatedInvoice = signal<Invoice | null>(null);
    appLogo = signal<string | null>(null);

    constructor() {
        this.invoiceForm = this.fb.group({
            invoiceType: [InvoiceType.Simplified, Validators.required],
            currency: [CurrencyCode.USD, Validators.required],
            issueDate: [new Date().toISOString().split('T')[0], Validators.required],
            dueDate: [new Date().toISOString().split('T')[0], Validators.required],

            seller: this.fb.group({
                name: [''], // Optional
                email: ['', [Validators.email]],
                taxId: [''],
                address: this.fb.group({
                    line1: [''],
                    city: [''],
                    postalCode: [''],
                    country: ['US']
                })
            }),

            buyer: this.fb.group({
                name: [''], // Optional
                taxId: [''], // Required only for Full Invoice
                email: ['', [Validators.email]],
                address: this.fb.group({
                    line1: [''],
                    city: [''],
                    postalCode: [''],
                    country: ['US']
                })
            }),

            lineItems: this.fb.array([])
        });

        // Add initial line item
        this.addLineItem();

        // Preload App Logo
        this.preloadAppLogo();

        // Subscribe to value changes to recalculate
        this.invoiceForm.valueChanges.subscribe(val => {
            this.recalculate(val);
        });
    }

    /**
     * Initializes the application logo as a preview. Currently commented out but reserved for future branding.
     * @returns void
     */
    preloadAppLogo(): void {
        // Reserved for future implementation
    }

    /**
     * Getter to access the lineItems FormArray from the main invoice form.
     * @returns FormArray - The array of form groups representing invoice items.
     */
    get lineItems(): FormArray {
        return this.invoiceForm.get('lineItems') as FormArray;
    }

    /**
     * Adds a new empty line item group to the invoice form with default validators.
     * @returns void
     */
    addLineItem(): void {
        const itemGroup = this.fb.group({
            description: ['', Validators.required],
            quantity: [1, [Validators.required, Validators.min(1)]],
            unitPrice: [0, [Validators.required, Validators.min(0)]],
            taxRate: [0, [Validators.required, Validators.min(0)]],
            taxType: [TaxType.Exclusive, Validators.required],
            discount: [0, [Validators.min(0)]]
        });
        this.lineItems.push(itemGroup);
    }

    /**
     * Removes a line item from the form at the specified index.
     * @param index number - The position of the item in the array.
     * @returns void
     */
    removeLineItem(index: number): void {
        this.lineItems.removeAt(index);
    }

    validationErrors = signal<string[]>([]);

    /**
     * Dismisses the welcome notification.
     * @returns void
     */
    dismissWelcome(): void {
        this.showWelcome.set(false);
    }

    /**
     * Triggered when a user selects a business logo file. Processes and resizes the image.
     * @param event any - The file input change event.
     * @returns void
     */
    onLogoSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.resizeImage(file, 300, 300).then(resizedDataUrl => {
                this.logoUrl.set(resizedDataUrl);
            });
        }
    }

    /**
     * Clears the selected logo and resets the file input to allow re-selection.
     * @param input HTMLInputElement - The file input element reference.
     * @returns void
     */
    removeLogo(input: HTMLInputElement): void {
        this.logoUrl.set(null);
        input.value = '';
    }

    /**
     * Helper to resize an image using a hidden Canvas element to save bandwidth and memory.
     * @param file File - The raw image file.
     * @param maxWidth number - Maximum allowed width.
     * @param maxHeight number - Maximum allowed height.
     * @returns Promise<string> - A promise resolving to the base64 encoded resized image string.
     */
    resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<string> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d')!;
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL(file.type));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * Maps the form value to the financial model and triggers recalculation.
     * @param formValue any - The raw form value from [invoiceForm].
     * @returns void
     */
    recalculate(formValue: any): void {
        if (!formValue) return;

        const currency = formValue.currency as CurrencyCode;
        const toCents = (val: number) => Math.round((val || 0) * 100);

        const items: LineItem[] = formValue.lineItems.map((item: any) => {
            return {
                id: uuidv4(),
                productId: 'temp-id',
                description: item.description,
                quantity: item.quantity,
                unitPrice: { amount: toCents(item.unitPrice), currency },
                taxData: { rate: item.taxRate, type: item.taxType },
                discount: { amount: toCents(item.discount), currency }
            } as LineItem;
        });

        const partialInvoice: Partial<Invoice> = {
            issueDate: formValue.issueDate,
            dueDate: formValue.dueDate,
            type: formValue.invoiceType,
            currency: currency,
            lineItems: items
        };

        const result = this.calculationService.calculateInvoice(partialInvoice);
        this.calculatedInvoice.set(result);
    }

    /**
     * Recursively traverses form controls to identify and format validation errors for the user.
     * @param form FormGroup - The root form group to validate.
     * @returns string[] - A list of human-readable error messages.
     */
    private getFormValidationErrors(form: FormGroup): string[] {
        const result: string[] = [];
        Object.keys(form.controls).forEach(key => {
            const controlErrors = form.get(key)!.errors;
            if (controlErrors) {
                Object.keys(controlErrors).forEach(keyError => {
                    result.push(`Field '${key}' is invalid: ${keyError}`);
                });
            }
            if (form.get(key) instanceof FormGroup) {
                const group = form.get(key) as FormGroup;
                Object.keys(group.controls).forEach(gKey => {
                    if (group.get(gKey)!.errors) {
                        result.push(`Field '${key}.${gKey}' is missing or invalid`);
                    }
                });
            }
        });

        const items = form.get('lineItems') as FormArray;
        items.controls.forEach((ctrl, index) => {
            if (ctrl.invalid) {
                result.push(`Line Item #${index + 1} has missing fields (Description, Price or Qty)`);
            }
        });

        return result;
    }

    /**
     * Validates the form, saves the invoice to state, and triggers the PDF generation helper.
     * @returns Promise<void>
     */
    async generatePDF(): Promise<void> {
        if (this.logoUrl() === null) {
            const useDefaultLogo = confirm('Do you want to use the default watermark?');
            if (useDefaultLogo) {
                this.logoUrl.set('Bill0logoCropped.png');
            }
        }
        if (this.invoiceForm.valid && this.calculatedInvoice()) {
            this.validationErrors.set([]);

            const invoice = this.calculatedInvoice()!;

            const fullInvoice: Invoice = {
                ...invoice,
                id: uuidv4(),
                invoiceNumber: this.billingService.generateInvoiceNumber(),
                status: InvoiceStatus.Finalized,
                idempotencyKey: uuidv4(),
                seller: {
                    id: 'seller-id',
                    name: this.invoiceForm.value.seller.name,
                    taxId: this.invoiceForm.value.seller.taxId,
                    email: this.invoiceForm.value.seller.email,
                    address: this.invoiceForm.value.seller.address,
                    currency: invoice.currency
                },
                buyer: {
                    id: 'buyer-id',
                    name: this.invoiceForm.value.buyer.name,
                    email: this.invoiceForm.value.buyer.email,
                    taxId: this.invoiceForm.value.buyer.taxId,
                    address: this.invoiceForm.value.buyer.address,
                    currency: invoice.currency
                }
            };

            this.billingService.createInvoice(fullInvoice, fullInvoice.idempotencyKey);

            try {
                await generateInvoicePDF(fullInvoice, this.logoUrl(), this.appLogo());
                console.log('PDF generated successfully!');
            } catch (error) {
                console.error('PDF Generation Error:', error);
                this.validationErrors.set([`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`]);
            }
        } else {
            this.invoiceForm.markAllAsTouched();
            const errors = this.getFormValidationErrors(this.invoiceForm);
            if (errors.length === 0 && !this.invoiceForm.valid) {
                errors.push("Please check all required fields.");
            }
            this.validationErrors.set(errors);
        }
    }
}
