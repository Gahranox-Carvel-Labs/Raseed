/**
 * Author: Abdul Faheem A
 * Copyrights: Gahranox Carvel Labs Technologies
 * Purpose: Utility functions for generating professional PDF invoices using jsPDF.
 * Usecase: Invoked by components to convert invoice data into a downloadable PDF format with branding and tables.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as QRCode from 'qrcode';
import { Invoice, InvoiceType, TaxType } from '../core/models';

/**
 * Generates and downloads a PDF invoice based on the provided data and configuration.
 * @param invoice Invoice - The finalized invoice object with all calculated totals.
 * @param logoUrl string | null - Optional base64 string of the seller's business logo.
 * @param appLogoUrl string | null - Optional base64 string of the Bill0 application branding.
 * @returns Promise<void>
 */
export async function generateInvoicePDF(invoice: Invoice, logoUrl?: string | null, appLogoUrl?: string | null): Promise<void> {
    const doc = new jsPDF();

    // -- Constants --
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPos = 20;

    // -- 1. Header & Logo --
    // Bill0 App Branding (Top Right)
    if (appLogoUrl) {
        try {
            // 20x20 mm logo at Top Right
            doc.addImage(appLogoUrl, 'PNG', pageWidth - margin - 20, 10, 20, 20);
        } catch (e) {
            console.warn('App Logo add failed', e);
        }
    }

    // User Logo (Top Left)
    if (logoUrl) {
        try {
            // Add image at x=margin, y=margin, with width=30 (height auto-scaled or fixed)
            doc.addImage(logoUrl, 'PNG', margin, yPos, 30, 30);
        } catch (e) {
            console.warn('Logo add failed', e);
        }
    }

    // Title (Top Right - Below App Logo)
    doc.setFontSize(22);
    // Move title down a bit if app logo is there
    const titleY = appLogoUrl ? yPos + 20 : yPos + 10;
    doc.text(invoice.type === InvoiceType.Full ? 'TAX INVOICE' : 'INVOICE', pageWidth - margin, titleY, { align: 'right' });

    // Move Y down to make space for logo + metadata
    // If Logo is 30mm height, we should start text below it.
    yPos += 35; // 20 + 35 = 55

    // Seller Name (Below Logo or implicit?)
    // Let's print Seller Name just in case it's part of address block
    doc.setFontSize(14);
    doc.text(invoice.seller.name, margin, yPos);
    yPos += 10;

    // -- 2. Top Metadata (Issue Date, #) --
    doc.setFontSize(10);
    doc.text(`Invoice No: ${invoice.invoiceNumber}`, pageWidth - margin, yPos, { align: 'right' });
    doc.text(`Date: ${invoice.issueDate.split('T')[0]}`, pageWidth - margin, yPos + 5, { align: 'right' });
    yPos += 15;

    // -- 3. From / To --
    const startYOriginal = yPos;

    // From
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('From:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    yPos += 5;
    doc.text(invoice.seller.name, margin, yPos);
    yPos += 5;
    doc.text(invoice.seller.address.line1, margin, yPos);
    yPos += 5;
    doc.text(`${invoice.seller.address.city}, ${invoice.seller.address.country}`, margin, yPos);
    if (invoice.seller.taxId) {
        yPos += 5;
        doc.text(`Tax ID: ${invoice.seller.taxId}`, margin, yPos);
    }

    // To (Right aligned or column 2)
    yPos = startYOriginal;
    const leftCol2 = 110;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', leftCol2, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    yPos += 5;
    doc.text(invoice.buyer.name, leftCol2, yPos);
    yPos += 5;
    doc.text(invoice.buyer.address.line1, leftCol2, yPos);
    yPos += 5;
    doc.text(`${invoice.buyer.address.city}, ${invoice.buyer.address.country}`, leftCol2, yPos);

    if (invoice.type === InvoiceType.Full && invoice.buyer.taxId) {
        yPos += 5;
        doc.text(`Tax ID: ${invoice.buyer.taxId}`, leftCol2, yPos);
    }

    yPos += 20;

    // -- 4. Line Items Table --
    // Prepare data
    const head = [['Description', 'Qty', 'Unit Price', 'Tax', 'Total']];
    const body = invoice.lineItems.map(item => [
        item.description,
        item.quantity,
        formatMoney(item.unitPrice.amount, item.unitPrice.currency),
        `${item.taxData.rate}%`,
        formatMoney(item.total.amount, item.total.currency)
    ]);

    autoTable(doc, {
        startY: yPos,
        head: head,
        body: body,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] } // Indigo
    });

    // Calculate final Y after table
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    yPos = finalY;

    // -- 5. Totals --
    const rightColX = pageWidth - margin;
    doc.setFontSize(10);

    const addTotalRow = (label: string, amount: number, currency: string, isBold = false) => {
        if (isBold) doc.setFont('helvetica', 'bold');
        else doc.setFont('helvetica', 'normal');

        doc.text(label, rightColX - 50, yPos);
        doc.text(formatMoney(amount, currency), rightColX, yPos, { align: 'right' });
        yPos += 7;
    };

    addTotalRow('Subtotal', invoice.subtotal.amount, invoice.subtotal.currency);
    if (invoice.totalDiscount.amount > 0) {
        addTotalRow('Discount', -invoice.totalDiscount.amount, invoice.totalDiscount.currency);
    }
    addTotalRow('Tax', invoice.totalTax.amount, invoice.totalTax.currency);
    yPos += 2;
    doc.setLineWidth(0.5);
    doc.line(rightColX - 60, yPos - 5, rightColX, yPos - 5);
    addTotalRow('Total', invoice.grandTotal.amount, invoice.grandTotal.currency, true);

    // -- 6. Footer & Notes --
    // Requirement: "this bill is generated by the free version of the Bill0 by Gahranox carvel labs technologies"
    // Place at very bottom

    // QR Code Removed as per user request
    // (Previous logic commented out/removed)

    doc.setFontSize(8);
    doc.setTextColor(100);
    const footerText = "this bill is generated by the free version of the Bill0 by Gahranox carvel labs technologies";
    doc.text(footerText, pageWidth / 2, doc.internal.pageSize.height - 15, { align: 'center' });

    // Save
    doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
}

/**
 * Formats a raw amount in the smallest currency unit into a human-readable string with currency code.
 * @param amount number - The amount in the smallest unit (e.g., 1050 for $10.50).
 * @param currency string - The ISO currency code (e.g., USD).
 * @returns string - Formatted string like "USD 1,050.00".
 */
export function formatMoney(amount: number, currency: string): string {
    // Use ISO code for PDF compatibility (fixes font issues and weird spacing with unsupported symbols)
    // e.g. "USD 1500.00" instead of "$1,500.00" or "₹1,500.00" which might break in standard fonts
    const val = (amount / 100).toFixed(2); // Ensure 2 decimal places fixed

    // Add commas formatting manually or via Intl with 'decimal' style
    const formattedNum = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount / 100);

    return `${currency} ${formattedNum}`;
}
