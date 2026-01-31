import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { WorkOrderDetailData } from "@/interface/workOrderInterface";

// Design colors (RGB 0-255)
const COLORS = {
    textDark: [51, 51, 51] as [number, number, number],
    textMuted: [153, 153, 153] as [number, number, number],
    dueDateRed: [220, 53, 69] as [number, number, number],
    totalBlue: [0, 123, 255] as [number, number, number],
    billToBg: [224, 242, 247] as [number, number, number], // light blue
    tableHeader: [52, 58, 64] as [number, number, number], // dark gray
    totalBoxBg: [248, 249, 250] as [number, number, number],
    notesLine: [255, 215, 0] as [number, number, number], // yellow
    border: [220, 220, 220] as [number, number, number],
};

const loadImageAsBase64 = async (imagePath: string): Promise<string> => {
    try {
        const response = await fetch(imagePath);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Error loading image:", error);
        return "";
    }
};

const formatDate = (dateStr: string | null | undefined) =>
    dateStr
        ? new Date(dateStr).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          })
        : "N/A";

export const generateWorkOrderInvoicePDF = async (workOrderDetail: WorkOrderDetailData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const COMPANY_NAME = "Barnick Pracharani";

    let logoBase64 = "";
    try {
        logoBase64 = await loadImageAsBase64("/images/favicon.png");
    } catch {
        // continue without logo
    }

    let currentY = margin;
    const logoSize = 16;
    let headerLeftX = margin;
    if (logoBase64) {
        try {
            doc.addImage(logoBase64, "PNG", margin, currentY, logoSize, logoSize);
            headerLeftX = margin + logoSize + 8;
        } catch {
            // continue without logo
        }
    }

    // ---------- HEADER: Barnick Pracharani left, Invoice below; Invoice Date / Phone right ----------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...COLORS.textDark);
    doc.text(COMPANY_NAME, headerLeftX, currentY + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.textMuted);
    doc.text("Invoice", headerLeftX, currentY + 12);

    const orderDate = formatDate(workOrderDetail.date);
    const rightX = pageWidth - margin;
    const PHONE = "+8801712347097";
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.textMuted);
    doc.text("Invoice Date", rightX, currentY + 4, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.textDark);
    doc.text(orderDate, rightX, currentY + 10, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.textMuted);
    doc.text("Phone", rightX, currentY + 16, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.textDark);
    doc.text(PHONE, rightX, currentY + 22, { align: "right" });

    currentY += 28;

    // ---------- Divider ----------
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 12;

    // ---------- FROM (left) and BILL TO (right) side by side ----------
    const colWidth = (pageWidth - 2 * margin - 10) / 2;
    const fromX = margin;
    const billToX = margin + colWidth + 10;
    const sectionStartY = currentY;

    // FROM section (left) - Work Order No
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.textMuted);
    doc.text("Work Order No", fromX, sectionStartY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.textDark);
    doc.text(workOrderDetail.no || "N/A", fromX, sectionStartY + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const fromBlockBottom = sectionStartY + 22;

    // BILL TO section (right, light blue background)
    const billToBoxHeight = 44;
    doc.setFillColor(...COLORS.billToBg);
    doc.roundedRect(billToX, sectionStartY - 2, colWidth + 2, billToBoxHeight, 2, 2, "F");
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(billToX, sectionStartY - 2, colWidth + 2, billToBoxHeight, 2, 2, "S");

    let billToY = sectionStartY + 4;
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text("BILL TO", billToX + 8, billToY);
    billToY += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.textDark);
    const customerName = workOrderDetail.customer?.name || "N/A";
    doc.text(customerName, billToX + 8, billToY);
    billToY += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const phoneText = workOrderDetail.customer?.phone || "N/A";
    doc.text(phoneText, billToX + 8, billToY);
    billToY += 6;
    const addressText = workOrderDetail.customer?.address || "N/A";
    const addressLines = doc.splitTextToSize(addressText, colWidth - 12);
    doc.text(addressLines, billToX + 8, billToY);
    billToY += addressLines.length * 5;
    if (workOrderDetail.customer?.contact_person_name) {
        doc.text(`Contact: ${workOrderDetail.customer.contact_person_name}`, billToX + 8, billToY);
    }
    doc.setTextColor(...COLORS.textDark);

    currentY = Math.max(fromBlockBottom, sectionStartY + billToBoxHeight) + 14;

    // ---------- Items Table (dark header, white text) ----------
    if (workOrderDetail.items && workOrderDetail.items.length > 0) {
        const itemsTableRows = workOrderDetail.items.map((item) => [
            `${item.item || "N/A"}${item.details ? ` - ${item.details}` : ""}`,
            (item.total_order || 0).toString(),
            (item.unit_price || 0).toLocaleString("en-IN"),
            ((item.total_order || 0) * (item.unit_price || 0)).toLocaleString("en-IN"),
        ]);
        const itemsSubtotal = workOrderDetail.items.reduce(
            (sum, item) => sum + (item.total_order || 0) * (item.unit_price || 0),
            0
        );
        itemsTableRows.push(["", "", "Subtotal", itemsSubtotal.toLocaleString("en-IN")]);

        autoTable(doc, {
            startY: currentY,
            head: [["Item Description", "Quantity", "Unit Price", "Total"]],
            body: itemsTableRows,
            theme: "plain",
            headStyles: {
                fillColor: COLORS.tableHeader,
                textColor: [255, 255, 255],
                fontStyle: "bold",
                fontSize: 10,
                cellPadding: 5,
            },
            columnStyles: {
                0: { cellWidth: "auto" },
                1: { halign: "center", cellWidth: 28 },
                2: { halign: "right", cellWidth: 32 },
                3: { halign: "right", cellWidth: 32 },
            },
            styles: {
                fontSize: 10,
                cellPadding: 4,
                textColor: COLORS.textDark,
            },
            didParseCell: (data) => {
                if (data.row.index === itemsTableRows.length - 1) {
                    data.cell.styles.fontStyle = "bold";
                    data.cell.styles.fillColor = [248, 249, 250];
                }
            },
        });
        currentY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 14;
    }

    // ---------- Financial Summary (right-aligned, Total in blue box) ----------
    const itemsSubtotal =
        workOrderDetail.items?.reduce(
            (sum, item) => sum + (item.total_order || 0) * (item.unit_price || 0),
            0
        ) || 0;
    const deliveryCharge = workOrderDetail.delivery_charge || 0;
    const totalAmount = workOrderDetail.amount || 0;
    const totalPaid = workOrderDetail.total_paid || 0;
    const pendingBalance = totalAmount - totalPaid;

    const summaryWidth = 80;
    const summaryX = pageWidth - margin - summaryWidth;
    const lineH = 8;
    let summaryY = currentY;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.textDark);
    doc.text("Subtotal", summaryX, summaryY);
    doc.text(`${itemsSubtotal.toLocaleString("en-IN")}`, summaryX + summaryWidth, summaryY, { align: "right" });
    summaryY += lineH;

    if (deliveryCharge > 0) {
        doc.text("Delivery Charge", summaryX, summaryY);
        doc.text(`${deliveryCharge.toLocaleString("en-IN")}`, summaryX + summaryWidth, summaryY, {
            align: "right",
        });
        summaryY += lineH;
    }

    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.5);
    doc.line(summaryX, summaryY, summaryX + summaryWidth, summaryY);
    summaryY += lineH;

    doc.setFont("helvetica", "bold");
    doc.text("Total Amount", summaryX, summaryY);
    doc.setFont("helvetica", "normal");
    doc.text(`${totalAmount.toLocaleString("en-IN")}`, summaryX + summaryWidth, summaryY, { align: "right" });
    summaryY += lineH;

    doc.text("Total Paid", summaryX, summaryY);
    doc.text(`${totalPaid.toLocaleString("en-IN")}`, summaryX + summaryWidth, summaryY, { align: "right" });
    summaryY += lineH;

    doc.setDrawColor(...COLORS.border);
    doc.line(summaryX, summaryY, summaryX + summaryWidth, summaryY);
    summaryY += lineH;

    doc.setFont("helvetica", "bold");
    doc.text("Pending Balance", summaryX, summaryY);
    doc.setFont("helvetica", "normal");
    doc.text(`${pendingBalance.toLocaleString("en-IN")}`, summaryX + summaryWidth, summaryY, { align: "right" });
    doc.setTextColor(...COLORS.textDark);

    currentY = summaryY + 16;

    // ---------- NOTES (bottom left, yellow separator) ----------
    doc.setDrawColor(...COLORS.notesLine);
    doc.setLineWidth(0.8);
    doc.line(margin, currentY, margin + 60, currentY);
    currentY += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("NOTES", margin, currentY);
    currentY += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.textMuted);
    const notesText =
        workOrderDetail.remarks && workOrderDetail.remarks.trim()
            ? workOrderDetail.remarks
            : "Thank you for your business!";
    const notesLines = doc.splitTextToSize(notesText, pageWidth - 2 * margin - 80);
    doc.text(notesLines, margin, currentY);
    doc.setTextColor(...COLORS.textDark);

    // ---------- Footer ----------
    const WEBSITE = "https://barnickpracharani.com";
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(...COLORS.textMuted);
        doc.text(`${COMPANY_NAME} | ${WEBSITE}`, pageWidth / 2, pageHeight - 10, { align: "center" });
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: "right" });
        doc.setTextColor(...COLORS.textDark);
    }

    const fileName = `Invoice_${workOrderDetail.no.replace(/\//g, "_")}_${Date.now()}.pdf`;
    doc.save(fileName);
};
