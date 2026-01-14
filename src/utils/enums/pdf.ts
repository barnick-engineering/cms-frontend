import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || "Company Name";

interface Inventory {
    id: string;
    name: string;
}

interface TransactionDetail {
    id: string;
    no: string;
    quantity?: number | null;
    price?: number | null;
    total?: number | null;
    inventory?: Inventory | null;
    [key: string]: any;
}

interface Transaction {
    id: string;
    no: string;
    transactionType: string;
    paymentType: string;
    customer?: { id: string; name: string };
    vendor?: { id: string; name: string };
    details: TransactionDetail[];
    totalAmount: number;
    paid: number;
    pending: number;
    createdAt: string;
}

interface Summary {
    totalAmount: number;
    totalPaid: number;
}

export interface Entity {
    name: string;
    no?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    shop: {
        name: string;
        address?: string | null;
    };
}

// --- Helper Functions ---
const getItemName = (item: TransactionDetail) =>
    item.inventory?.name || item.itemName || item.name || "N/A";

const getQuantity = (item: TransactionDetail) =>
    Number(item.quantity ?? item.qty ?? 0);

const getPrice = (item: TransactionDetail) =>
    Number(item.price ?? item.unitPrice ?? 0);

const getTotal = (item: TransactionDetail) => {
    if (item.total != null) return Number(item.total);
    if (item.amount != null) return Number(item.amount);
    return getQuantity(item) * getPrice(item);
};

const formatNumber = (num: number | string | undefined | null) => {
    const n = Number(num) || 0;
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// --- Main PDF Function ---
export const generatePDF = (
    entity: Entity,
    transactions: Transaction[],
    summary: Summary,
) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- Header Section ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(entity.shop.name.toUpperCase(), pageWidth / 2, 18, { align: "center" });

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Transaction Report with Details", pageWidth / 2, 25, { align: "center" });

    // --- Divider Line ---
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(14, 30, pageWidth - 14, 30);

    // Determine account label (Customer / Vendor / Account Holder)
    let accountLabel = "Account Holder:";
    let accountName = entity.name;

    if (transactions.length > 0) {
        const firstTrx = transactions[0];
        if (firstTrx.customer) {
            accountLabel = "Customer:";
            accountName = firstTrx.customer.name;
        } else if (firstTrx.vendor) {
            accountLabel = "Vendor:";
            accountName = firstTrx.vendor.name;
        }
    }

    // --- Left Side Info ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(accountLabel, 14, 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(accountName, 14 + doc.getTextWidth(accountLabel) + 3, 40);

    // --- Right Side Info ---
    const generatedDate = new Date().toLocaleDateString("en-GB", { 
        day: "2-digit", 
        month: "2-digit", 
        year: "numeric" 
    });
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Generated On:", pageWidth - 14, 40, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const generatedTextWidth = doc.getTextWidth("Generated On: ");
    doc.text(generatedDate, pageWidth - 14 - generatedTextWidth, 40, { align: "right" });

    // Optional contact info
    if (entity.phone) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("Phone:", pageWidth - 14, 47, { align: "right" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const phoneLabelWidth = doc.getTextWidth("Phone: ");
        doc.text(entity.phone, pageWidth - 14 - phoneLabelWidth, 47, { align: "right" });
    }

    // --- Table Section with Details ---
    const tableRows: any[] = [];
    let subtotalQty = 0;
    let subtotalTotal = 0;

    transactions.forEach(trx => {
        // Transaction Header Row
        const trxDate = new Date(trx.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
        
        tableRows.push([
            {
                content: trxDate,
                styles: { fontStyle: 'bold', fillColor: [249, 250, 251], textColor: [17, 24, 39] }
            },
            {
                content: trx.no,
                styles: { fontStyle: 'bold', fillColor: [249, 250, 251], textColor: [17, 24, 39] }
            },
            {
                content: trx.transactionType,
                styles: { fontStyle: 'bold', fillColor: [249, 250, 251], textColor: [17, 24, 39] }
            },
            {
                content: trx.paymentType || '-',
                styles: { fontStyle: 'bold', fillColor: [249, 250, 251], textColor: [17, 24, 39] }
            },
            {
                content: '',
                styles: { fillColor: [249, 250, 251] }
            },
            {
                content: '',
                styles: { fillColor: [249, 250, 251] }
            },
            {
                content: formatNumber(trx.totalAmount),
                styles: { fontStyle: 'bold', fillColor: [249, 250, 251], textColor: [17, 24, 39], halign: 'right' }
            },
        ]);

        // Handle transactions with details (PURCHASE, SALE, etc.)
        if (trx.details && trx.details.length > 0) {
            trx.details.forEach((item, idx) => {
                const qty = getQuantity(item);
                const total = getTotal(item);

                subtotalQty += qty;
                subtotalTotal += total;

                // Item row (indented)
                tableRows.push([
                    '',
                    `  ${idx + 1}.`,
                    `  ${getItemName(item)}`,
                    '',
                    qty.toString(),
                    formatNumber(getPrice(item)),
                    formatNumber(total),
                ]);
            });

            // Transaction Summary Row (Paid/Pending)
            if (trx.paid > 0 || trx.pending > 0) {
                tableRows.push([
                    '',
                    '',
                    {
                        content: `  Paid: ${formatNumber(trx.paid)} | Pending: ${formatNumber(trx.pending)}`,
                        colSpan: 3,
                        styles: { fontStyle: 'italic', textColor: [107, 114, 128], fontSize: 8 }
                    },
                    '',
                    '',
                    '',
                    ''
                ]);
            }
        } else {
            // Handle transactions without details (PAYMENT, RECEIVABLE, COMMISSION)
            const amount = trx.paid || trx.totalAmount || 0;
            subtotalTotal += amount;

            tableRows.push([
                '',
                '',
                `  ${trx.transactionType}`,
                '',
                '-',
                '-',
                formatNumber(amount),
            ]);

            // Payment details
            if (trx.paid > 0) {
                tableRows.push([
                    '',
                    '',
                    {
                        content: `  Paid: ${formatNumber(trx.paid)}`,
                        colSpan: 3,
                        styles: { fontStyle: 'italic', textColor: [107, 114, 128], fontSize: 8 }
                    },
                    '',
                    '',
                    '',
                    ''
                ]);
            }
        }

        // Add spacing row between transactions
        tableRows.push([
            { content: '', colSpan: 7, styles: { minCellHeight: 2, fillColor: [255, 255, 255] } },
            '', '', '', '', '', ''
        ]);
    });

    // Add subtotal row
    tableRows.push([
        '',
        '',
        '',
        {
            content: 'Subtotal',
            styles: { fontStyle: 'bold', fillColor: [243, 244, 246], textColor: [17, 24, 39] }
        },
        {
            content: subtotalQty > 0 ? subtotalQty.toString() : '-',
            styles: { fontStyle: 'bold', fillColor: [243, 244, 246], textColor: [17, 24, 39], halign: 'center' }
        },
        {
            content: '',
            styles: { fillColor: [243, 244, 246] }
        },
        {
            content: formatNumber(subtotalTotal),
            styles: { fontStyle: 'bold', fillColor: [243, 244, 246], textColor: [17, 24, 39], halign: 'right' }
        }
    ]);

    autoTable(doc, {
        startY: 52,
        head: [["Date", "Trx No", "Description", "Payment", "Qty", "Price", "Amount"]],
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
            0: { cellWidth: 22, halign: "left" },
            1: { cellWidth: 25, halign: "left" },
            2: { cellWidth: 'auto', halign: "left" },
            3: { cellWidth: 22, halign: "center" },
            4: { halign: "center", cellWidth: 18 },
            5: { halign: "right", cellWidth: 22 },
            6: { halign: "right", cellWidth: 25 },
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
        didDrawCell: (data) => {
            // Add subtle borders between rows
            if (data.row.index > 0 && data.column.index === 0) {
                doc.setDrawColor(229, 231, 235);
                doc.setLineWidth(0.1);
                doc.line(data.cell.x, data.cell.y, data.cell.x + data.cell.width, data.cell.y);
            }
        },
    });

    // --- Summary Box ---
    const finalY = (doc as any).lastAutoTable.finalY + 12;
    const summaryX = pageWidth - 95;
    const summaryWidth = 81;
    const summaryHeight = 32;
    const padding = 8;

    // Draw summary box with white background and black border (matching theme)
    doc.setFillColor(255, 255, 255);
    doc.rect(summaryX, finalY, summaryWidth, summaryHeight, "F");
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(summaryX, finalY, summaryWidth, summaryHeight, "S");

    const balanceDue = summary.totalAmount - summary.totalPaid;

    const drawRow = (label: string, value: number, y: number, isBold = false, isNegativeValue = false) => {
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        doc.setFontSize(9);
        
        // Label - with proper padding from left border
        doc.setTextColor(0, 0, 0);
        doc.text(label, summaryX + padding, y);
        
        // Value - with proper padding from right border to prevent breaking
        if (isNegativeValue && value < 0) {
            doc.setTextColor(220, 38, 38); // Red for negative
        } else {
            doc.setTextColor(0, 0, 0);
        }
        
        const valueText = formatNumber(Math.abs(value));
        // Use summaryX + summaryWidth - padding to ensure proper spacing from right border
        doc.text(valueText, summaryX + summaryWidth - padding, y, { align: "right" });
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
    };

    drawRow("Total Amount:", summary.totalAmount, finalY + 8);
    drawRow("Total Paid:", summary.totalPaid, finalY + 15);

    // Divider line - black to match theme
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(summaryX + padding, finalY + 20, summaryX + summaryWidth - padding, finalY + 20);
    
    // Balance Due (highlighted)
    drawRow("Balance Due:", balanceDue, finalY + 27, true, true);

    // --- Footer ---
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.text(`Powered by ${COMPANY_NAME}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 10, { align: "right" });
    }

    // --- Save PDF ---
    doc.save(`Transaction_Report_${entity.name.replace(/\s+/g, "_")}_${Date.now()}.pdf`);
}