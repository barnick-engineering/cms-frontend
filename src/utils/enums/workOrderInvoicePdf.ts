import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { WorkOrderDetailData } from "@/interface/workOrderInterface";

// Helper function to load image as base64
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

export const generateWorkOrderInvoicePDF = async (workOrderDetail: WorkOrderDetailData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const COMPANY_NAME = "Barnick Pracharani";

    // Try to load logo
    let logoBase64 = "";
    try {
        logoBase64 = await loadImageAsBase64("/images/favicon.png");
    } catch (error) {
        console.warn("Could not load logo, continuing without it");
    }

    // --- Header Section with Logo and Company Name (Centered Group) ---
    const headerY = 15;
    const logoSize = 18; // Smaller logo
    const centerX = pageWidth / 2; // Center of the page
    const spacing = 10; // Space between logo and company name

    // Calculate text width for company name to position correctly
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    const companyNameText = COMPANY_NAME.toUpperCase();
    const companyNameWidth = doc.getTextWidth(companyNameText);

    // Calculate the total width of logo + spacing + company name
    const totalWidth = logoSize + spacing + companyNameWidth;
    const groupStartX = centerX - totalWidth / 2; // Start position to center the group

    // Add logo on the left (within centered group)
    if (logoBase64) {
        try {
            const logoX = groupStartX;
            doc.addImage(logoBase64, "PNG", logoX, headerY, logoSize, logoSize);
        } catch (error) {
            console.warn("Could not add logo image:", error);
        }
    }

    // Company name on the right of logo (same line)
    const companyNameX = logoBase64 ? groupStartX + logoSize + spacing : centerX;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(companyNameText, companyNameX, headerY + 8);

    // Invoice text on the next line, centered (reduced spacing)
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("INVOICE", centerX, headerY + 16, { align: "center" });

    // --- Divider Line ---
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    const dividerY = headerY + 25;
    doc.line(14, dividerY, pageWidth - 14, dividerY);

    let currentY = dividerY + 15;

    // --- Work Order Info Section with Bill To (Extended Box) ---
    const infoBoxY = currentY;
    
    // Calculate height needed for Bill To section
    let billToHeight = 0;
    if (workOrderDetail.customer) {
        billToHeight = 8; // "Bill To:" header
        billToHeight += 7; // Client Name line
        billToHeight += 7; // Phone line
        const addressText = workOrderDetail.customer.address || "N/A";
        const addressLines = doc.splitTextToSize(addressText, pageWidth - 60);
        const maxLines = Math.max(1, addressLines.length);
        billToHeight += maxLines * 6 + 4; // Address lines + spacing
        if (workOrderDetail.customer.contact_person_name) {
            billToHeight += 10; // Contact person line + spacing
        }
    }
    
    const infoBoxHeight = 25 + billToHeight; // Work Order Info height + Bill To height
    
    // Draw extended box background
    doc.setFillColor(250, 250, 250);
    doc.rect(14, infoBoxY, pageWidth - 28, infoBoxHeight, "F");
    doc.setDrawColor(220, 220, 220);
    doc.rect(14, infoBoxY, pageWidth - 28, infoBoxHeight, "S");

    // Work Order Info Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Work Order No:", 18, infoBoxY + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(workOrderDetail.no || "N/A", 18, infoBoxY + 15);

    doc.setFont("helvetica", "bold");
    doc.text("Date:", 80, infoBoxY + 8);
    doc.setFont("helvetica", "normal");
    const orderDate = workOrderDetail.date
        ? new Date(workOrderDetail.date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          })
        : "N/A";
    doc.text(orderDate, 80, infoBoxY + 15);

    doc.setFont("helvetica", "bold");
    doc.text("Generated On:", pageWidth - 18, infoBoxY + 8, { align: "right" });
    doc.setFont("helvetica", "normal");
    const generatedDate = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
    doc.text(generatedDate, pageWidth - 18, infoBoxY + 15, { align: "right" });

    // Bill To Section (inside the same box) - Vertical list format
    let billToY = infoBoxY + 25; // Start after Work Order Info
    if (workOrderDetail.customer) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("Bill To:", 18, billToY);
        billToY += 8;

        // Client Name with label
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("Client Name:", 18, billToY);
        const customerName = workOrderDetail.customer.name || "N/A";
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(customerName, 18 + 35, billToY); // Position after label
        billToY += 7;

        // Phone with label
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("Phone:", 18, billToY);
        const phoneText = workOrderDetail.customer.phone || "N/A";
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(phoneText, 18 + 35, billToY); // Position after label
        billToY += 7;

        // Address with label
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("Address:", 18, billToY);
        const addressText = workOrderDetail.customer.address || "N/A";
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const addressLines = doc.splitTextToSize(addressText, pageWidth - 60);
        doc.text(addressLines, 18 + 35, billToY); // Position after label
        billToY += addressLines.length * 6;

        // Contact Person (if exists)
        if (workOrderDetail.customer.contact_person_name) {
            billToY += 4;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.text(
                `Contact Person: ${workOrderDetail.customer.contact_person_name}`,
                18,
                billToY
            );
        }
    }

    currentY = infoBoxY + infoBoxHeight + 12;

    // --- Items Table (Improved Styling) ---
    if (workOrderDetail.items && workOrderDetail.items.length > 0) {
        const itemsTableRows = workOrderDetail.items.map((item) => [
            item.item || "N/A",
            item.details || "-",
            (item.total_order || 0).toString(),
            `${(item.unit_price || 0).toLocaleString("en-IN")}`,
            `${((item.total_order || 0) * (item.unit_price || 0)).toLocaleString("en-IN")}`,
        ]);

        // Calculate items subtotal
        const itemsSubtotal = workOrderDetail.items.reduce((sum, item) => {
            return sum + ((item.total_order || 0) * (item.unit_price || 0));
        }, 0);

        // Add subtotal row
        itemsTableRows.push([
            "",
            "",
            "",
            "Subtotal:",
            `${itemsSubtotal.toLocaleString("en-IN")}`,
        ]);

        autoTable(doc, {
            startY: currentY,
            head: [["Item", "Details", "Quantity", "Unit Price", "Total"]],
            body: itemsTableRows,
            theme: "striped",
            headStyles: {
                fillColor: [51, 65, 85],
                textColor: 255,
                halign: "center",
                fontStyle: "bold",
                fontSize: 10,
            },
            columnStyles: {
                0: { cellWidth: 55, fontStyle: "bold" },
                1: { cellWidth: 55 },
                2: { halign: "right", cellWidth: 25 },
                3: { halign: "right", cellWidth: 30 },
                4: { halign: "right", cellWidth: 30, fontStyle: "bold" },
            },
            styles: { fontSize: 9, cellPadding: 3 },
            didParseCell: (dataCell) => {
                // Bold the subtotal row
                if (dataCell.row.index === itemsTableRows.length - 1) {
                    dataCell.cell.styles.fontStyle = "bold";
                    dataCell.cell.styles.fillColor = [240, 240, 240];
                    dataCell.cell.styles.textColor = [0, 0, 0];
                }
            },
        });

        currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    // --- Financial Summary (Improved Design) ---
    const itemsSubtotal = workOrderDetail.items?.reduce((sum, item) => {
        return sum + ((item.total_order || 0) * (item.unit_price || 0));
    }, 0) || 0;

    const deliveryCharge = workOrderDetail.delivery_charge || 0;
    const totalAmount = workOrderDetail.amount || 0;
    const totalPaid = workOrderDetail.total_paid || 0;
    const pendingBalance = totalAmount - totalPaid;

    const summaryX = pageWidth - 95;
    const summaryWidth = 81;
    const lineHeight = 8;
    let summaryHeight = 45; // Base height
    
    if (deliveryCharge > 0) {
        summaryHeight += lineHeight;
    }
    
    // Add space for pending balance (divider + line)
    summaryHeight += lineHeight + lineHeight; // Divider line + Pending Balance line

    // Summary box with better styling
    doc.setFillColor(245, 245, 245);
    doc.rect(summaryX, currentY, summaryWidth, summaryHeight, "F");
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(summaryX, currentY, summaryWidth, summaryHeight, "S");

    let summaryY = currentY + 10;
    const paddingX = 5;

    // Subtotal (Items)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Subtotal (Items):", summaryX + paddingX, summaryY);
    doc.text(`${itemsSubtotal.toLocaleString("en-IN")}`, summaryX + summaryWidth - paddingX, summaryY, {
        align: "right",
    });
    summaryY += lineHeight;

    // Delivery Charge (if applicable)
    if (deliveryCharge > 0) {
        doc.text("Delivery Charge:", summaryX + paddingX, summaryY);
        doc.text(`${deliveryCharge.toLocaleString("en-IN")}`, summaryX + summaryWidth - paddingX, summaryY, {
            align: "right",
        });
        summaryY += lineHeight;
    }

    // Divider line
    doc.setLineWidth(0.5);
    doc.setDrawColor(180, 180, 180);
    doc.line(summaryX + paddingX, summaryY, summaryX + summaryWidth - paddingX, summaryY);
    summaryY += lineHeight;

    // Total Amount
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Total Amount:", summaryX + paddingX, summaryY);
    doc.text(`${totalAmount.toLocaleString("en-IN")}`, summaryX + summaryWidth - paddingX, summaryY, {
        align: "right",
    });
    summaryY += lineHeight;

    // Total Paid
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Total Paid:", summaryX + paddingX, summaryY);
    doc.text(`${totalPaid.toLocaleString("en-IN")}`, summaryX + summaryWidth - paddingX, summaryY, {
        align: "right",
    });
    summaryY += lineHeight;

    // Divider line
    doc.setLineWidth(0.5);
    doc.setDrawColor(180, 180, 180);
    doc.line(summaryX + paddingX, summaryY, summaryX + summaryWidth - paddingX, summaryY);
    summaryY += lineHeight;

    // Pending Balance (highlighted)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Pending Balance:", summaryX + paddingX, summaryY);
    doc.text(`${pendingBalance.toLocaleString("en-IN")}`, summaryX + summaryWidth - paddingX, summaryY, {
        align: "right",
    });

    // --- Footer ---
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(120, 120, 120);
        doc.text(
            `Powered by ${COMPANY_NAME}`,
            pageWidth / 2,
            pageHeight - 8,
            { align: "center" }
        );
        doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth - 14,
            pageHeight - 8,
            { align: "right" }
        );
        doc.setTextColor(0, 0, 0); // Reset text color
    }

    // --- Save PDF ---
    const fileName = `Invoice_${workOrderDetail.no.replace(/\//g, "_")}_${Date.now()}.pdf`;
    doc.save(fileName);
};
