import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { StockTrackReportItem } from "@/interface/reportInterface";

export const generateStockTrackReportPDF = (
    data: StockTrackReportItem[],
    shopName: string,
    dateRange?: { from: string; to: string }
) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || "Company Name";

    // --- Header & Info Section (Kept Same) ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(shopName.toUpperCase(), pageWidth / 2, 15, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Stock Track Report", pageWidth / 2, 22, { align: "center" });

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

    // Group data by inventory
    const groupedData = data.reduce((acc, item) => {
        const key = item.inventory.name || "N/A";
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(item);
        return acc;
    }, {} as Record<string, StockTrackReportItem[]>);

    let startY = 45;

    // --- Generate tables for each inventory ---
    Object.entries(groupedData).forEach(([_, items], index) => {
        if (index > 0) startY += 10;

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        
        // Since we are grouping, we should show which inventory this table represents.
        // I've uncommented this and used the name from the first item in the group.
        const currentName = items[0]?.inventory.name || "N/A";
        doc.text(`Inventory: ${currentName}`, 14, startY);
        startY += 7;

        // 1. Updated Mapping: Only 5 Columns
        const tableRows = items.map((item) => [
            new Date(item.createdAt).toLocaleDateString(),
            item.isPurchased === true ? "Purchase" : "Sale",
            item.inventory.name || "N/A",
            item.stock,
            Number(item.price).toLocaleString(),
        ]);
        
        // 2. Calculate Subtotals
        const subtotalPrice = items.reduce((acc, item) => acc + Number(item.price || 0), 0);
        const totalStock = items.reduce((acc, item) => acc + Number(item.stock || 0), 0);

        // 3. Updated Subtotal Row: 5 Columns
        tableRows.push([
            "",
            "",
            "SUBTOTAL",
            totalStock.toString(),
            subtotalPrice.toLocaleString()
        ]);

        autoTable(doc, {
            startY: startY,
            head: [["Date", "Type", "Name", "Stock", "Price"]],
            body: tableRows,
            theme: "striped",
            headStyles: { fillColor: [51, 65, 85], textColor: 255, halign: "center" },
            columnStyles: {
                0: { cellWidth: 30 },             // Date
                1: { cellWidth: 30 },             // Type
                2: { cellWidth: 70 },             // Name (wider for long names)
                3: { cellWidth: 25, halign: "center" }, // Stock
                4: { cellWidth: 25, halign: "right" },  // Price
            },
            styles: { fontSize: 9 },
            didParseCell: (dataCell) => {
                if (dataCell.row.index === tableRows.length - 1) {
                    dataCell.cell.styles.fontStyle = "bold";
                    dataCell.cell.styles.fillColor = [241, 245, 249];
                }
            },
        });

        startY = (doc as any).lastAutoTable.finalY + 5;

        if (startY > doc.internal.pageSize.getHeight() - 40) {
            doc.addPage();
            startY = 20;
        }
    });

    // --- Grand Total Summary Box ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const summaryX = pageWidth - 90;

    // Check if we need a new page for summary
    if (finalY > doc.internal.pageSize.getHeight() - 50) {
        doc.addPage();
        const newStartY = 20;

        doc.setFillColor(248, 250, 252);
        doc.rect(summaryX, newStartY, 76, 20, "F");
        doc.setDrawColor(226, 232, 240);
        doc.rect(summaryX, newStartY, 76, 20, "S");

        const grandTotal = data.reduce((acc, item) => acc + Number(item.price), 0);
        const grandTotalStock = data.reduce((acc, item) => acc + Number(item.stock), 0);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("Grand Total Stock:", summaryX + 2, newStartY + 7);
        doc.text(grandTotalStock.toLocaleString(), pageWidth - 16, newStartY + 7, { align: "right" });

        doc.text("Grand Total Amount:", summaryX + 2, newStartY + 15);
        doc.text(`${grandTotal.toLocaleString()} Taka`, pageWidth - 16, newStartY + 15, { align: "right" });
    } else {
        doc.setFillColor(248, 250, 252);
        doc.rect(summaryX, finalY, 76, 20, "F");
        doc.setDrawColor(226, 232, 240);
        doc.rect(summaryX, finalY, 76, 20, "S");

        const grandTotal = data.reduce((acc, item) => acc + Number(item.price), 0);
        const grandTotalStock = data.reduce((acc, item) => acc + Number(item.stock), 0);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("Grand Total Stock:", summaryX + 2, finalY + 7);
        doc.text(grandTotalStock.toLocaleString(), pageWidth - 16, finalY + 7, { align: "right" });

        doc.text("Grand Total Amount:", summaryX + 2, finalY + 15);
        doc.text(`${grandTotal.toLocaleString()} Taka`, pageWidth - 16, finalY + 15, { align: "right" });
    }

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

    doc.save(`Stock_Track_Report_${Date.now()}.pdf`);
}