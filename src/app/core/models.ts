/**
 * Author: Abdul Faheem A
 * Copyrights: Gahranox Carvel Labs Technologies
 * Purpose: Central repository for all interfaces, enums, and types used across the Bill0 billing platform.
 * Usecase: Ensures type safety and consistent data structures for invoices, accounts, and financial calculations.
 */

// Enums
export enum CurrencyCode {
    USD = 'USD',
    EUR = 'EUR',
    INR = 'INR',
    GBP = 'GBP',
    AED = 'AED', // Added for potential regional context given "Bill0" name
    SAR = 'SAR'
}

export enum TaxType {
    Inclusive = 'Inclusive',
    Exclusive = 'Exclusive'
}

export enum InvoiceStatus {
    Draft = 'Draft',
    Finalized = 'Finalized',
    Paid = 'Paid',
    Void = 'Void'
}

export enum InvoiceType {
    Simplified = 'Simplified', // B2C, Low Value
    Full = 'Full'             // B2B, High Value
}

// Smallest Unit Principle
export interface Money {
    amount: number; // Integer: cents, paise, etc.
    currency: CurrencyCode;
}

export interface ExchangeRate {
    fromCurrency: CurrencyCode;
    toCurrency: CurrencyCode;
    rate: number; // Floating point allowed for rate, but validation should be careful
    validFrom: string; // ISO Date
    validTo?: string; // ISO Date
}

// Core Entities
export interface Account {
    id: string; // UUID
    name: string;
    email: string;
    taxId?: string; // VAT/GST/TRN - Required for Full Invoices
    address: Address;
    currency: CurrencyCode; // Default currency
}

export interface Address {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string; // ISO code preferably
}

export interface Product {
    id: string; // UUID
    name: string;
    code: string; // SKU or internal code
    taxInformationCode?: string; // Global tax classification
    defaultPrice: number; // In smallest unit
    active: boolean;
}

export interface RatePlan {
    id: string; // UUID
    productId: string;
    name: string; // e.g., "Standard-USD", "Premium-EUR"
    pricing: Money; // Price in specific currency
    taxData: TaxData; // region specific tax rules
}

export interface TaxData {
    rate: number; // Percentage, e.g., 5 for 5%
    type: TaxType;
}

export interface LineItem {
    id: string; // UUID
    productId: string;
    description: string;
    quantity: number;
    unitPrice: Money; // Exclusive of tax if TaxType is Exclusive
    taxData: TaxData;
    discount?: Money; // Discount amount
    proration?: ProrationDetails;

    // Computed values (for display/integrity)
    subtotal: Money;
    taxAmount: Money;
    total: Money;
}

export interface ProrationDetails {
    startDate: string; // ISO Date
    endDate: string; // ISO Date
    totalDaysInPeriod: number;
    daysOfUse: number;
    factor: number; // daysOfUse / totalDaysInPeriod
}

export interface Invoice {
    id: string; // UUID
    invoiceNumber: string; // Sequential, gapless
    issueDate: string; // ISO Date
    dueDate: string; // ISO Date

    type: InvoiceType;
    status: InvoiceStatus;

    seller: Account; // Snapshot of seller details
    buyer: Account; // Snapshot of buyer details

    lineItems: LineItem[];

    // Totals
    subtotal: Money;
    totalDiscount: Money;
    totalTax: Money;
    grandTotal: Money;

    currency: CurrencyCode;
    exchangeRate?: ExchangeRate; // If transaction currency != base currency

    // Verification
    idempotencyKey: string;
    irn?: string; // Invoice Reference Number (Govt)
    qrCodeData?: string;

    notes?: string; // Footer notes
}

export interface CreditNote {
    id: string;
    originalInvoiceId: string; // Reference to Invoice
    reason: string;
    amount: Money;
    issueDate: string;
}

export interface DebitNote {
    id: string;
    originalInvoiceId: string;
    reason: string;
    amount: Money;
    issueDate: string;
}
