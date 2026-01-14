import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ExpenseReportItem } from "@/interface/reportInterface";

export const generateExpenseReportPDF = (
    data: ExpenseReportItem[],
    shopName: string,
    dateRange?: { from: string; to: string }
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
    doc.text("Expense Report", pageWidth / 2, 22, { align: "center" });

    // --- Info Section ---
    doc.setLineWidth(0.5);
    doc.line(14, 28, pageWidth - 14, 28);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Report Period:`, 14, 38);
    doc.setFont("helvetica", "normal");
    const period = dateRange
        ? `${new Date(dateRange.from).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} to ${new Date(dateRange.to).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`
        : "All Time";
    doc.text(period, 48, 38);

    doc.setFont("helvetica", "bold");
    doc.text(`Generated On:`, pageWidth - 14, 38, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleDateString(), pageWidth - 14, 45, { align: "right" });

    // --- Table Section ---
    const tableRows = data.map((item) => [
        new Date(item.createdAt).toLocaleDateString(),
        item.title,
        item.remarks || "N/A",
        item.type,
        Number(item.amount).toLocaleString(),
    ]);

    // --- Total Row ---
    const totalExpenses = data.reduce((acc, item) => acc + Number(item.amount), 0);
    tableRows.push([
        "", "", "", "Total Expenses", totalExpenses.toLocaleString()
    ]);

    autoTable(doc, {
        startY: 50,
        head: [["Date", "Title", "Remarks", "Type", "Amount"]],
        body: tableRows,
        theme: "striped",
        headStyles: { fillColor: [51, 65, 85], textColor: 255, halign: "center" },
        columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 40 },
            2: { cellWidth: 45 },
            3: { cellWidth: 40 },
            4: { halign: "right", cellWidth: 40 },
        },
        styles: { fontSize: 9 },
        didParseCell: (dataCell) => {
            // Bold the total row
            if (dataCell.row.index === tableRows.length - 1) {
                dataCell.cell.styles.fontStyle = "bold";
                dataCell.cell.styles.fillColor = [248, 250, 252];
            }
        },
    });

    // --- Summary Box ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const summaryX = pageWidth - 90;

    doc.setFillColor(248, 250, 252);
    doc.rect(summaryX, finalY, 76, 15, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(summaryX, finalY, 76, 15, "S");

    doc.setFont("helvetica", "bold");
    doc.text("Total Expenses:", summaryX + 2, finalY + 10);
    doc.text(`${totalExpenses.toLocaleString()} Taka`, pageWidth - 16, finalY + 10, { align: "right" });

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

    doc.save(`Expense_Report_${Date.now()}.pdf`);
}