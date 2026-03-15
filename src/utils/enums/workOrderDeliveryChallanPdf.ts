import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { WorkOrderDetailData } from "@/interface/workOrderInterface";

const COLORS = {
    textDark: [51, 51, 51] as [number, number, number],
    textMuted: [153, 153, 153] as [number, number, number],
    billToBg: [224, 242, 247] as [number, number, number],
    tableHeader: [52, 58, 64] as [number, number, number],
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

/** Challan date = download day (today) */
const getChallanDate = () =>
    new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

export const generateWorkOrderDeliveryChallanPDF = async (
    workOrderDetail: WorkOrderDetailData
) => {
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

    // ---------- HEADER: Company left, Delivery Challan; Challan Date right ----------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...COLORS.textDark);
    doc.text(COMPANY_NAME, headerLeftX, currentY + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.textMuted);
    doc.text("Delivery Challan", headerLeftX, currentY + 12);

    const challanDate = getChallanDate();
    const rightX = pageWidth - margin;
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.textMuted);
    doc.text("Challan Date", rightX, currentY + 4, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.textDark);
    doc.text(challanDate, rightX, currentY + 10, { align: "right" });

    currentY += 28;

    // ---------- Divider ----------
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 12;

    // ---------- FROM (left) and TO (right) ----------
    const colWidth = (pageWidth - 2 * margin - 10) / 2;
    const fromX = margin;
    const toX = margin + colWidth + 10;
    const sectionStartY = currentY;

    // FROM section (left) - Barnick Pracharani
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.textMuted);
    doc.text("FROM", fromX, sectionStartY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.textDark);
    doc.text(COMPANY_NAME, fromX, sectionStartY + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const fromBlockBottom = sectionStartY + 22;

    // TO section (right, light blue background)
    const toBoxHeight = 44;
    doc.setFillColor(...COLORS.billToBg);
    doc.roundedRect(toX, sectionStartY - 2, colWidth + 2, toBoxHeight, 2, 2, "F");
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(toX, sectionStartY - 2, colWidth + 2, toBoxHeight, 2, 2, "S");

    let toY = sectionStartY + 4;
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text("TO", toX + 8, toY);
    toY += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.textDark);
    const customerName = workOrderDetail.customer?.name || "N/A";
    doc.text(customerName, toX + 8, toY);
    toY += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const phoneText = workOrderDetail.customer?.phone || "N/A";
    doc.text(phoneText, toX + 8, toY);
    toY += 6;
    const addressText = workOrderDetail.customer?.address || "N/A";
    const addressLines = doc.splitTextToSize(addressText, colWidth - 12);
    doc.text(addressLines, toX + 8, toY);
    toY += addressLines.length * 5;
    if (workOrderDetail.customer?.contact_person_name) {
        doc.text(
            `Contact: ${workOrderDetail.customer.contact_person_name}`,
            toX + 8,
            toY
        );
    }
    doc.setTextColor(...COLORS.textDark);

    currentY =
        Math.max(fromBlockBottom, sectionStartY + toBoxHeight) + 14;

    // ---------- Items Table: Item Description, Quantity only (no price) ----------
    if (workOrderDetail.items && workOrderDetail.items.length > 0) {
        const itemsTableRows = workOrderDetail.items.map((item) => [
            `${item.item || "N/A"}${item.details ? ` - ${item.details}` : ""}`,
            (item.total_order || 0).toString(),
        ]);

        autoTable(doc, {
            startY: currentY,
            head: [["Item Description", "Quantity"]],
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
                1: { halign: "center", cellWidth: 40 },
            },
            styles: {
                fontSize: 10,
                cellPadding: 4,
                textColor: COLORS.textDark,
            },
        });
        currentY =
            (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
                .finalY + 14;
    }

    // ---------- Signature section: On behalf of Barnick Pracharani ----------
    const signatureY = Math.min(currentY + 30, pageHeight - 50);
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.line(margin, signatureY - 2, margin + 60, signatureY - 2);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.textMuted);
    doc.text("Signature", margin, signatureY + 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.textDark);
    doc.text("On behalf of Barnick Pracharani", margin, signatureY + 12);

    // ---------- Footer ----------
    const WEBSITE = "https://barnickpracharani.com";
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(...COLORS.textMuted);
        doc.text(
            `${COMPANY_NAME} | ${WEBSITE}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: "center" }
        );
        doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth - margin,
            pageHeight - 10,
            { align: "right" }
        );
        doc.setTextColor(...COLORS.textDark);
    }

    const safeNo = (workOrderDetail.no || "challan").replace(/\//g, "_");
    const fileName = `Delivery_Challan_${safeNo}_${Date.now()}.pdf`;
    doc.save(fileName);
};
