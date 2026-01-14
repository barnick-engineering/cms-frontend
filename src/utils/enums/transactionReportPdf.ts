import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface TransactionReportItem {
    no: string;
    createdAt: string;
    transactionType: string;
    vendor?: { name: string };
    customer?: { name: string };
    totalAmount: number;
    paid: number;
    pending: number;
    paymentType: string;
    details: Array<{
        inventory?: { name: string };
        quantity: string;
        price: string;
        total: string;
        unitOfMeasurement?: { name: string };
    }>;
}

interface TransactionSummary {
    totalTransactions: number;
    totalBillAmount: number;
    totalPaid: number;
    totalDue: number;
}

export const generateTransactionReportPDF = (
    data: TransactionReportItem[],
    shopName: string,
    dateRange?: { from: string; to: string },
    transactionType?: string
) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || "Company Name";

    // Calculate summary
    const summary: TransactionSummary = {
        totalTransactions: data.length,
        totalBillAmount: data.reduce((acc, item) => acc + Number(item.totalAmount), 0),
        totalPaid: data.reduce((acc, item) => acc + Number(item.paid), 0),
        totalDue: data.reduce((acc, item) => acc + Number(item.pending), 0),
    };

    // --- Header Section ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(shopName.toUpperCase(), pageWidth / 2, 15, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Transaction Report", pageWidth / 2, 22, { align: "center" });

    // --- Info Section ---
    doc.setLineWidth(0.5);
    doc.line(14, 28, pageWidth - 14, 28);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Transaction Type:`, 14, 38);
    doc.setFont("helvetica", "normal");
    doc.text(transactionType || "All Types", 55, 38);

    doc.setFont("helvetica", "bold");
    doc.text(`Report Period:`, 14, 45);
    doc.setFont("helvetica", "normal");
    const period = dateRange
        ? `${new Date(dateRange.from).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} to ${new Date(dateRange.to).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`
        : "All Time";
    doc.text(period, 55, 45);

    doc.setFont("helvetica", "bold");
    doc.text(`Generated On:`, pageWidth - 14, 38, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleDateString(), pageWidth - 14, 45, { align: "right" });

    // --- Table Section ---
    const tableRows = data.map((item) => {
        const partyName = item.vendor?.name || item.customer?.name || "N/A";
        const itemsSummary = item.details
            .map((d) => `${d.inventory?.name || "N/A"} (${d.quantity})`)
            .join(", ");

        return [
            new Date(item.createdAt).toLocaleDateString(),
            // item.no,
            // item.transactionType,
            partyName,
            itemsSummary,
            item.paymentType,
            Number(item.totalAmount).toLocaleString(),
            Number(item.paid).toLocaleString(),
            Number(item.pending).toLocaleString(),
        ];
    });

    // --- Calculate and Add Subtotal Row ---
    const subtotalAmount = data.reduce((acc, item) => acc + Number(item.totalAmount || 0), 0);
    const subtotalPaid = data.reduce((acc, item) => acc + Number(item.paid || 0), 0);
    const subtotalDue = data.reduce((acc, item) => acc + Number(item.pending || 0), 0);

    tableRows.push([
        "",                            // Party column
        "",                            // Items column
        "",                            // Method column
        "TOTAL",                       // Date column
        subtotalAmount.toLocaleString(),// Amount column
        subtotalPaid.toLocaleString(),  // Paid column
        subtotalDue.toLocaleString(),   // Due column
    ]);

    autoTable(doc, {
        startY: 55,
        head: [["Date", "Party", "Items", "Method", "Amount", "Paid", "Due"]],
        body: tableRows,
        theme: "striped",
        headStyles: { fillColor: [51, 65, 85], textColor: 255, halign: "center" },
        columnStyles: {
            0: { cellWidth: 22 },
            1: { cellWidth: 30 },
            2: { cellWidth: 35 },
            3: { cellWidth: 25 },
            4: { cellWidth: 25 },
            5: { cellWidth: 22 },
            6: { cellWidth: 18, halign: "right" },
            7: { cellWidth: 18, halign: "right" },
            8: { cellWidth: 15, halign: "right" },
        },
        styles: { fontSize: 8 },
        didParseCell: (dataCell) => {
            const rowIndex = dataCell.row.index;
            if (rowIndex === tableRows.length - 1) {
                dataCell.cell.styles.fontStyle = "bold";
                dataCell.cell.styles.fillColor = [240, 240, 240]; // Light grey background for subtotal
            }
        },
    });

    // --- Summary Box ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const summaryX = pageWidth - 90;

    doc.setFillColor(248, 250, 252);
    doc.rect(summaryX, finalY, 76, 35, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(summaryX, finalY, 76, 35, "S");

    // Change the function definition to add 'showCurrency'
    const drawRow = (label: string, value: number, y: number, isBold = false, showCurrency = true) => {
        if (isBold) doc.setFont("helvetica", "bold");
        doc.text(label, summaryX + 2, y);

        // Logic to skip "Taka" for transaction count
        const formattedValue = showCurrency
            ? `${value.toLocaleString()} Taka`
            : value.toLocaleString();

        doc.text(formattedValue, pageWidth - 16, y, { align: "right" });
        doc.setFont("helvetica", "normal");
    };

    // Update the calls
    drawRow("Total Transactions:", summary.totalTransactions, finalY + 7, false, false); // No Taka
    drawRow("Total Bill Amount:", summary.totalBillAmount, finalY + 14); // Has Taka
    drawRow("Total Paid:", summary.totalPaid, finalY + 21); // Has Taka
    drawRow("Total Due:", summary.totalDue, finalY + 31, true); // Has Taka

    doc.setDrawColor(200);
    doc.line(summaryX + 2, finalY + 24, pageWidth - 16, finalY + 24);
    drawRow("Total Due:", summary.totalDue, finalY + 31, true);

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

    const fileName = `Transaction_Report_${transactionType || "All"}_${Date.now()}.pdf`;
    doc.save(fileName);
}