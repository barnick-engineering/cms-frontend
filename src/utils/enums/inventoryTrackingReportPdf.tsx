import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || "Company Name";

interface Inventory {
    id: string;
    name: string;
}

interface InventoryTracking {
    id: string;
    inventory: Inventory;
    stock: number;
    price: number;
    isPurchased: boolean;
    createdAt: string;
    updatedAt: string;
}

interface InventoryDetails {
    no: string;
    name: string;
    description?: string | null;
    quantity: number;
    lastPrice: number;
    unitOfMeasurement?: {
        id: string;
        name: string;
    };
}

const formatNumber = (num: number | string | undefined | null) => {
    const n = Number(num) || 0;
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const generateInventoryTrackingPDF = (
    inventoryDetails: InventoryDetails,
    trackingData: InventoryTracking[],
    shopName: string = "Shop Name"
) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- Header ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(shopName.toUpperCase(), pageWidth / 2, 15, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Inventory Tracking Report", pageWidth / 2, 22, { align: "center" });

    // --- Info Section ---
    doc.setLineWidth(0.5);
    doc.line(14, 28, pageWidth - 14, 28);

    // Inventory Details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Inventory:", 14, 38);
    doc.setFont("helvetica", "normal");
    doc.text(inventoryDetails.name, 38, 38);

    doc.setFont("helvetica", "bold");
    doc.text("Item No:", 14, 46);
    doc.setFont("helvetica", "normal");
    doc.text(inventoryDetails.no, 38, 46);

    doc.setFont("helvetica", "bold");
    doc.text("Current Stock:", pageWidth - 60, 38, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text(
        `${inventoryDetails.quantity} ${inventoryDetails.unitOfMeasurement?.name || ''}`,
        pageWidth - 14,
        38,
        { align: "right" }
    );

    doc.setFont("helvetica", "bold");
    doc.text("Last Price:", pageWidth - 60, 46, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text(`${formatNumber(inventoryDetails.lastPrice)}`, pageWidth - 20, 46, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.text("Generated On:", pageWidth - 60, 54, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleDateString(), pageWidth - 14, 54, { align: "right" });

    // --- Table Section ---
    const tableRows: any[] = [];
    let runningStock = 0;
    let totalPurchased = 0;
    let totalSold = 0;

    // Sort by date ascending to show chronological order
    const sortedData = [...trackingData].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    sortedData.forEach((item, index) => {
        const transactionType = item.isPurchased ? 'PURCHASE' : 'SALE';
        const stockChange = item.isPurchased ? item.stock : -item.stock;
        runningStock += stockChange;

        if (item.isPurchased) {
            totalPurchased += item.stock;
        } else {
            totalSold += item.stock;
        }

        tableRows.push([
            (index + 1).toString(),
            new Date(item.createdAt).toLocaleDateString(),
            new Date(item.createdAt).toLocaleTimeString(),
            transactionType,
            item.isPurchased ? item.stock.toString() : '-',
            item.isPurchased ? '-' : item.stock.toString(),
            formatNumber(item.price),
            formatNumber(item.stock * item.price),
            runningStock.toString(),
        ]);
    });

    // Add subtotal row
    tableRows.push([
        '',
        '',
        '',
        {
            content: 'SUBTOTAL',
            styles: { fontStyle: 'bold', fillColor: [226, 232, 240] }
        },
        {
            content: totalPurchased.toString(),
            styles: { fontStyle: 'bold', fillColor: [226, 232, 240], halign: 'center' }
        },
        {
            content: totalSold.toString(),
            styles: { fontStyle: 'bold', fillColor: [226, 232, 240], halign: 'center' }
        },
        {
            content: '',
            styles: { fillColor: [226, 232, 240] }
        },
        {
            content: '',
            styles: { fillColor: [226, 232, 240] }
        },
        {
            content: runningStock.toString(),
            styles: { fontStyle: 'bold', fillColor: [226, 232, 240], halign: 'center' }
        },
    ]);

    autoTable(doc, {
        startY: 65,
        head: [["#", "Date", "Time", "Type", "Purchased", "Sold", "Price", "Amount", "Stock In Hand"]],
        body: tableRows,
        theme: "striped",
        headStyles: {
            fillColor: [51, 65, 85],
            textColor: 255,
            halign: "center",
            fontStyle: 'bold',
            fontSize: 9
        },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 25 },
            2: { cellWidth: 22 },
            3: { cellWidth: 25, halign: 'center' },
            4: { cellWidth: 20, halign: 'center' },
            5: { cellWidth: 20, halign: 'center' },
            6: { halign: "right", cellWidth: 20 },
            7: { halign: "right", cellWidth: 22 },
            8: { halign: "center", cellWidth: 20 },
        },
        styles: {
            fontSize: 8,
            cellPadding: 2
        },
    });

    // --- Summary Box ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const summaryX = pageWidth - 90;

    doc.setFillColor(248, 250, 252);
    doc.rect(summaryX, finalY, 76, 38, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(summaryX, finalY, 76, 38, "S");

    const drawRow = (label: string, value: string | number, y: number, isBold = false) => {
        if (isBold) doc.setFont("helvetica", "bold");
        else doc.setFont("helvetica", "normal");
        doc.text(label, summaryX + 2, y);
        doc.text(String(value), pageWidth - 16, y, { align: "right" });
    };

    doc.setFontSize(10);
    drawRow("Total Purchased:", `${totalPurchased} ${inventoryDetails.unitOfMeasurement?.name || ''}`, finalY + 8);
    drawRow("Total Sold:", `${totalSold} ${inventoryDetails.unitOfMeasurement?.name || ''}`, finalY + 16);
    
    doc.setDrawColor(200);
    doc.line(summaryX + 2, finalY + 20, pageWidth - 16, finalY + 20);
    
    drawRow("Current Stock:", `${inventoryDetails.quantity} ${inventoryDetails.unitOfMeasurement?.name || ''}`, finalY + 26, true);

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
        doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth - 14,
            doc.internal.pageSize.getHeight() - 10,
            { align: "right" }
        );
    }

    // --- Save PDF ---
    doc.save(`Inventory_Tracking_${inventoryDetails.name.replace(/\s+/g, "_")}_${Date.now()}.pdf`);
}