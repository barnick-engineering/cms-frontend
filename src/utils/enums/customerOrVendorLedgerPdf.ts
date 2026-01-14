import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { TransactionLedgerDetailItem } from "@/interface/reportInterface";

interface Summary {
    totalAmount: number;
    totalPaid: number;
}

export const generateLedgerPDF = (
    entityName: string,
    shopName: string, // Use this directly
    data: TransactionLedgerDetailItem[],
    summary: Summary,
    dateRange?: { from: string; to: string },
    entityType?: "customer" | "vendor"
) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || "Company Name";

    // --- Header Section ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(shopName.toUpperCase(), pageWidth / 2, 15, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Ledger Transaction Report", pageWidth / 2, 22, { align: "center" });

    // --- Info Section ---
    doc.setLineWidth(0.5);
    doc.line(14, 28, pageWidth - 14, 28);

    // Decide label based on entity type
    const accountLabel = entityType === "customer" ? "Customer:" : "Vendor:";
    const accountName = data.length > 0 && data[0].entityName
        ? data[0].entityName
        : entityName;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(accountLabel, 14, 38);
    doc.setFont("helvetica", "normal");
    doc.text(accountName, 48, 38);

    doc.setFont("helvetica", "bold");
    doc.text(`Report Period:`, 14, 45);
    doc.setFont("helvetica", "normal");
    const period = dateRange
        ? `${new Date(dateRange.from).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} to ${new Date(dateRange.to).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`
        : "All Time";
    doc.text(period, 48, 45);

    doc.setFont("helvetica", "bold");
    doc.text(`Generated On:`, pageWidth - 14, 38, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleDateString(), pageWidth - 14, 45, { align: "right" });

    // --- Table Section ---
    const tableRows = data.map((item) => [
        new Date(item.createdAt).toLocaleDateString(),
        item.transactionNo,
        item.inventoryName,
        item.transactionType,
        item.quantity,
        Number(item.price).toLocaleString(),
        Number(item.total).toLocaleString(),
    ]);

    // --- Subtotal ---
    const subtotal = data.reduce((acc, item) => acc + Number(item.total), 0);
    tableRows.push([
        "", "", "", "Subtotal", "", "", subtotal.toLocaleString()
    ]);

    autoTable(doc, {
        startY: 55,
        head: [["Date", "Trx No", "Item", "Type", "Qty", "Price", "Total"]],
        body: tableRows,
        theme: "striped",
        headStyles: { fillColor: [51, 65, 85], textColor: 255, halign: "center" },
        columnStyles: {
            0: { cellWidth: 25 },
            5: { halign: "right" },
            6: { halign: "right" },
        },
        styles: { fontSize: 9 },
        didParseCell: (dataCell) => {
            // Bold the subtotal row
            if (dataCell.row.index === tableRows.length - 1) {
                dataCell.cell.styles.fontStyle = "bold";
            }
        },
    });

    // --- Summary Box ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const summaryX = pageWidth - 90;

    doc.setFillColor(248, 250, 252);
    doc.rect(summaryX, finalY, 76, 28, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(summaryX, finalY, 76, 28, "S");

    const drawRow = (label: string, value: number, y: number, isBold = false) => {
        if (isBold) doc.setFont("helvetica", "bold");
        doc.text(label, summaryX + 2, y);
        doc.text(`${value ? value.toLocaleString() : '0.00'} Taka`, pageWidth - 16, y, { align: "right" });
        doc.setFont("helvetica", "normal");
    };

    drawRow("Total Amount:", summary.totalAmount, finalY + 7);
    drawRow("Total Paid:", summary.totalPaid, finalY + 14);

    doc.setDrawColor(200);
    doc.line(summaryX + 2, finalY + 17, pageWidth - 16, finalY + 17);
    drawRow("Balance Due:", summary.totalAmount - summary.totalPaid, finalY + 24, true);

    // --- Footer ---
    const pageCount = (doc as any).internal.getNumberOfPages();
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

    doc.save(`Ledger_${accountName.replace(/\s+/g, "_")}_${Date.now()}.pdf`);
}