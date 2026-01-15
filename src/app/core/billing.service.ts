/**
 * Author: Abdul Faheem A
 * Copyrights: Gahranox Carvel Labs Technologies
 * Purpose: Manages the lifecycle of invoices, products, and customer profiles, including state persistence in localStorage.
 * Usecase: Acts as the central data store for the application, handling CRUD operations for invoices and profiles.
 */

import { Injectable, signal, computed, effect } from '@angular/core';
import { Invoice, Product, Account, InvoiceStatus, InvoiceType, CurrencyCode } from './models';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
    providedIn: 'root'
})
export class BillingService {

    // Signals for State
    readonly invoices = signal<Invoice[]>([]);
    readonly products = signal<Product[]>([]);
    readonly customers = signal<Account[]>([]);
    readonly sellerProfile = signal<Account | null>(null);

    constructor() {
        this.loadFromStorage();

        // Auto-save effect
        effect(() => {
            localStorage.setItem('Bill0_invoices', JSON.stringify(this.invoices()));
            localStorage.setItem('Bill0_products', JSON.stringify(this.products()));
            localStorage.setItem('Bill0_customers', JSON.stringify(this.customers()));
            if (this.sellerProfile()) {
                localStorage.setItem('Bill0_seller', JSON.stringify(this.sellerProfile()));
            }
        });
    }

    /**
     * Internal helper to load initial state from local storage on service initialization.
     * @returns void
     */
    private loadFromStorage(): void {
        const invoices = localStorage.getItem('Bill0_invoices');
        if (invoices) this.invoices.set(JSON.parse(invoices));

        const products = localStorage.getItem('Bill0_products');
        if (products) this.products.set(JSON.parse(products));

        const customers = localStorage.getItem('Bill0_customers');
        if (customers) this.customers.set(JSON.parse(customers));

        const seller = localStorage.getItem('Bill0_seller');
        if (seller) this.sellerProfile.set(JSON.parse(seller));
    }

    /**
     * Generates a unique, sequential invoice number based on the current year and existing count.
     * @returns string - The generated invoice number (e.g., INV-2024-0001).
     */
    generateInvoiceNumber(): string {
        // Gapless sequential numbering
        // Format: INV-{YYYY}-{0000}
        const currentYear = new Date().getFullYear();
        const prefix = `INV-${currentYear}-`;

        // Filter invoices from this year
        const yearlyInvoices = this.invoices().filter(inv => inv.invoiceNumber.startsWith(prefix));

        let maxSeq = 0;
        yearlyInvoices.forEach(inv => {
            const parts = inv.invoiceNumber.split('-');
            const seq = parseInt(parts[2], 10);
            if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
        });

        const nextSeq = maxSeq + 1;
        return `${prefix}${nextSeq.toString().padStart(4, '0')}`;
    }

    /**
     * Creates a new invoice and persists it. Supports idempotency to prevent duplicate creation.
     * @param invoiceData Partial<Invoice> - The invoice metadata.
     * @param idempotencyKey string - Unique key to check for existing transactions.
     * @returns Invoice - The newly created or existing invoice object.
     */
    createInvoice(invoiceData: Partial<Invoice>, idempotencyKey: string): Invoice {
        // Check Idempotency
        const existing = this.invoices().find(i => i.idempotencyKey === idempotencyKey);
        if (existing) return existing;

        const newInvoice: Invoice = {
            id: uuidv4(),
            invoiceNumber: this.generateInvoiceNumber(),
            issueDate: invoiceData.issueDate || new Date().toISOString(),
            dueDate: invoiceData.dueDate || new Date().toISOString(),
            status: InvoiceStatus.Draft,
            type: invoiceData.type || InvoiceType.Simplified,
            seller: this.sellerProfile()!,
            buyer: invoiceData.buyer!,
            lineItems: invoiceData.lineItems || [],
            subtotal: invoiceData.subtotal!,
            totalDiscount: invoiceData.totalDiscount!,
            totalTax: invoiceData.totalTax!,
            grandTotal: invoiceData.grandTotal!,
            currency: invoiceData.currency || CurrencyCode.USD,
            idempotencyKey: idempotencyKey,
            notes: invoiceData.notes
        };

        this.invoices.update(inv => [...inv, newInvoice]);
        return newInvoice;
    }

    /**
     * Updates the status of an existing invoice by ID.
     * @param id string - The unique ID of the invoice.
     * @param status InvoiceStatus - The new status to apply.
     * @returns void
     */
    updateInvoiceStatus(id: string, status: InvoiceStatus): void {
        this.invoices.update(invs => invs.map(inv =>
            inv.id === id ? { ...inv, status } : inv
        ));
    }

    /**
     * Adds a new product to the global catalogue.
     * @param product Product - The product details.
     * @returns void
     */
    addProduct(product: Product): void {
        this.products.update(p => [...p, product]);
    }

    /**
     * Saves or updates the seller's business profile.
     * @param profile Account - The seller account details.
     * @returns void
     */
    saveSellerProfile(profile: Account): void {
        this.sellerProfile.set(profile);
    }
}
