import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { StockTrackReportItem } from "@/interface/reportInterface";

export const generateStockTrackReportExcel = (
    data: StockTrackReportItem[],
    shopName: string,
    dateRange?: { from: string; to: string }
) => {
    // Create header information
    const headerInfo = [
        [shopName.toUpperCase()],
        ["Stock Track Report"],
        [],
        [
            "Report Period:",
            dateRange
                ? `${new Date(dateRange.from).toLocaleDateString()} to ${new Date(dateRange.to).toLocaleDateString()}`
                : "All Time"
        ],
        ["Generated On:", new Date().toLocaleDateString()],
        [], // Empty row for spacing
    ];

    // Map data to plain objects for Excel
    const rows = data.map((item) => ({
        "Date": new Date(item.createdAt).toLocaleDateString(),
        "Name": item.inventory.name,
        "Price": Number(item.price),
        "Total": Number(item.price),
    }));

    // Calculate totals
    const totalStock = data.reduce((acc, item) => acc + Number(item.stock), 0);
    const totalAmount = data.reduce((acc, item) => acc + Number(item.price), 0);

    // Add summary rows
    const summaryRows = [
        {},
        {
            "Date": "",
            "Name": "",
            "Stock": totalStock,
            "Price": "",
            "Total": totalAmount,
        }
    ];

    // Create worksheet from header info
    const ws = XLSX.utils.aoa_to_sheet(headerInfo);

    // Append data rows
    XLSX.utils.sheet_add_json(ws, rows, {
        origin: -1,
        skipHeader: false
    });

    // Append summary rows
    XLSX.utils.sheet_add_json(ws, summaryRows, {
        origin: -1,
        skipHeader: false
    });

    // Set column widths
    ws['!cols'] = [
        { wch: 12 },  // Date
        { wch: 25 },  // Inventory
        { wch: 10 },  // Stock
        { wch: 12 },  // Price
        { wch: 12 },  // Total
    ];

    // Style the header rows (bold)
    const headerStyle = { font: { bold: true, sz: 14 } };
    const titleStyle = { font: { bold: true, sz: 12 } };

    if (ws['A1']) ws['A1'].s = headerStyle;
    if (ws['A2']) ws['A2'].s = titleStyle;

    // Style the summary row
    const summaryRowIndex = headerInfo.length + rows.length + 2;
    const summaryStyle = { font: { bold: true }, fill: { fgColor: { rgb: "F1F5F9" } } };

    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].forEach(col => {
        const cellRef = `${col}${summaryRowIndex}`;
        if (ws[cellRef]) {
            ws[cellRef].s = summaryStyle;
        }
    });

    // Create a workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stock Track");

    // Generate Excel file and save
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Stock_Track_Report_${Date.now()}.xlsx`);
}