import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Transaction } from "@/interface/transactionInterface";

const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || "Company Name";

// Format date as DD/MM/YYYY, HH:MM:SS
const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
};

export const generateTransactionDetailsPDF = (
    transaction: Transaction,
    shopName: string
) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let startY = 20;

    // --- Header Section ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(shopName.toUpperCase(), pageWidth / 2, 18, { align: "center" });

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Transaction Details", pageWidth / 2, 25, { align: "center" });

    // --- Divider Line ---
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(14, 30, pageWidth - 14, 30);
    
    // Transaction Number and Type
    startY = 38;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Transaction #${transaction.no}`, 14, startY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Type: ${transaction.transactionType}`, 14, startY + 6);
    doc.setTextColor(0, 0, 0);
    
    startY += 15;

    // --- Transaction Information Sections (matching the new design) ---
    const name = transaction.vendor?.name ?? transaction.customer?.name ?? "N/A";
    const partnerType = transaction.vendor ? "Vendor" : transaction.customer ? "Customer" : "N/A";
    const paymentType = (transaction.paymentType ?? "N/A").replace("_", " ");
    const status = transaction.transactionStatus ?? "Pending";

    // Helper function to draw section header
    const drawSectionHeader = (title: string, y: number, x: number, lineStartX: number, lineEndX: number) => {
        // Draw the title text first
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128); // muted-foreground color
        doc.text(title.toUpperCase(), x, y);
        doc.setTextColor(0, 0, 0);
        
        // Draw the divider line below the text with spacing
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.5);
        const lineY = y + 3;
        doc.line(lineStartX, lineY, lineEndX, lineY);
        
        // Return Y position after header (with proper spacing)
        return y + 9;
    };

    // Helper function to draw field with label and value
    const drawField = (label: string, value: string, x: number, y: number, isRightAlign = false) => {
        // Draw label
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.text(label, x, y, { align: isRightAlign ? "right" : "left" });
        
        // Draw value below label
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        const valueY = y + 5;
        if (isRightAlign) {
            doc.text(value, x, valueY, { align: "right" });
        } else {
            doc.text(value, x, valueY);
        }
        // Return Y position for next field with proper spacing
        return valueY + 8;
    };

    // Two-column layout
    const leftX = 14;
    const rightX = pageWidth - 14;
    const columnWidth = (pageWidth - 28 - 16) / 2; // page width - margins - gap
    const columnCenter = pageWidth / 2;
    let currentY = startY;

    // Left Column - Transaction Information Section
    currentY = drawSectionHeader("Transaction Information", currentY, leftX, leftX, columnCenter - 8);
    let leftY = currentY;
    leftY = drawField(partnerType, name, leftX, leftY);
    leftY = drawField("Payment Type", paymentType, leftX, leftY);
    leftY = drawField("Status", status, leftX, leftY);

    // Right Column - Financial Details Section
    let rightY = startY; // Start at the same Y as left column
    rightY = drawSectionHeader("Financial Details", rightY, columnCenter + 8, columnCenter + 8, rightX);
    rightY = currentY; // Use the same starting Y for fields
    rightY = drawField("Total Amount", transaction.totalAmount.toLocaleString(), rightX, rightY, true);
    rightY = drawField("Paid", transaction.paid.toLocaleString(), rightX, rightY, true);
    rightY = drawField("Pending", transaction.pending.toLocaleString(), rightX, rightY, true);

    // Move to next row of sections with proper spacing
    startY = Math.max(leftY, rightY) + 15;

    // Left Column - Timeline Section
    currentY = drawSectionHeader("Timeline", startY, leftX, leftX, columnCenter - 8);
    leftY = currentY;
    leftY = drawField("Created At", formatDateTime(transaction.createdAt), leftX, leftY);
    leftY = drawField("Updated At", formatDateTime(transaction.updatedAt), leftX, leftY);

    // Right Column - Additional Information Section
    rightY = startY; // Start at the same Y as left column
    rightY = drawSectionHeader("Additional Information", rightY, columnCenter + 8, columnCenter + 8, rightX);
    rightY = currentY; // Use the same starting Y for fields
    const remarks = transaction.remarks || "N/A";
    
    // Draw Remarks label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text("Remarks", rightX, rightY, { align: "right" });
    
    // Draw Remarks value
    rightY += 5;
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    const remarksLines = doc.splitTextToSize(remarks, columnWidth);
    remarksLines.forEach((line: string, index: number) => {
        doc.text(line, rightX, rightY + (index * 6), { align: "right" });
    });
    rightY += remarksLines.length * 6 + 4;

    // Update startY for next section with proper spacing
    startY = Math.max(leftY, rightY) + 15;

    // --- Transaction Details Table ---
    if (transaction.details && transaction.details.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("Transaction Details", 14, startY);
        startY += 8;

        // Helper function to format numbers
        const formatNumber = (num: number | string | undefined | null) => {
            const n = Number(num) || 0;
            return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        };

        // Prepare table data
        const tableRows = transaction.details.map((detail) => [
            detail.inventory?.name ?? "N/A",
            formatNumber(detail.quantity || 0),
            formatNumber(detail.price || 0),
            formatNumber(detail.total || 0),
        ]);

        // Calculate subtotal (sum of all item totals)
        const subtotal = transaction.details.reduce((sum, detail) => sum + Number(detail.total || 0), 0);
        const total = transaction.totalAmount || subtotal;
        const pending = transaction.pending || 0;

        autoTable(doc, {
            startY: startY,
            head: [["Item", "Qty", "Price", "Total"]],
            body: tableRows,
            theme: "plain",
            headStyles: {
                fillColor: [31, 41, 55],
                textColor: 255,
                halign: "center",
                fontStyle: 'bold',
                fontSize: 9,
                cellPadding: 3
            },
            columnStyles: {
                0: { cellWidth: 60, halign: "left" },
                1: { cellWidth: 30, halign: "right" },
                2: { cellWidth: 30, halign: "right" },
                3: { cellWidth: 35, halign: "right" },
            },
            styles: {
                fontSize: 8,
                cellPadding: 2.5,
                lineColor: [229, 231, 235],
                lineWidth: 0.1
            },
            alternateRowStyles: {
                fillColor: [255, 255, 255]
            },
        });

        // --- Summary Section (white background with black borders) ---
        const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
        const summaryX = pageWidth - 90;
        const summaryWidth = 76;
        const summaryHeight = 32;
        const padding = 6;

        // Draw summary box with white background and black border only
        doc.setFillColor(255, 255, 255);
        doc.rect(summaryX, finalY, summaryWidth, summaryHeight, "F");
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.rect(summaryX, finalY, summaryWidth, summaryHeight, "S");

        const drawRow = (label: string, value: number, y: number, isBold = false) => {
            doc.setFont("helvetica", isBold ? "bold" : "normal");
            doc.setFontSize(9);
            
            // Label - black text on white background, with proper padding from border
            doc.setTextColor(0, 0, 0);
            doc.text(label, summaryX + padding, y);
            
            // Value - black text on white background, with proper padding from right border
            doc.setTextColor(0, 0, 0);
            const valueText = formatNumber(value);
            doc.text(valueText, summaryX + summaryWidth - padding, y, { align: "right" });
            
            doc.setFont("helvetica", "normal");
        };

        drawRow("Sub Total:", subtotal, finalY + 8);
        drawRow("Total:", total, finalY + 15);

        // Divider line - black on white background, with proper padding from borders
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.3);
        doc.line(summaryX + padding, finalY + 20, summaryX + summaryWidth - padding, finalY + 20);
        
        drawRow("Pending:", pending, finalY + 27);
    }

    // --- Footer ---
    const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.text(
            `Powered by ${COMPANY_NAME}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" }
        );
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 10, { align: "right" });
    }

    const fileName = `Transaction_${transaction.no}_${Date.now()}.pdf`;
    doc.save(fileName);
};
