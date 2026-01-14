import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { StockReportItem } from "@/interface/reportInterface";

export const generateStockReportExcel = (
    data: StockReportItem[],
    shopName: string,
    dateRange?: { from: string; to: string }
) => {
    // Create header information
    const headerInfo = [
        [shopName.toUpperCase()],
        ["Stock Report"],
        [],
        ["Report Period:", dateRange ? `${dateRange.from} to ${dateRange.to}` : "All Time"],
        ["Generated On:", new Date().toLocaleDateString()],
        [],
    ];

    // Map data to plain objects for Excel
    const rows = data.map((item) => ({
        RefNo: item.no,
        Name: item.name,
        Description: item.description || "N/A",
        Quantity: Number(item.quantity),
        LastPrice: Number(item.lastPrice),
        TotalValue: Number(item.quantity) * Number(item.lastPrice),
    }));

    // Calculate totals
    const totalQuantity = data.reduce((acc, item) => acc + Number(item.quantity), 0);
    const totalValue = data.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.lastPrice)), 0);

    // Add total row
    rows.push({
        RefNo: "",
        Name: "Total",
        Description: "",
        Quantity: totalQuantity,
        LastPrice: 0,
        TotalValue: totalValue,
    });

    // Convert rows to array format
    const dataRows = rows.map(row => [
        row.RefNo,
        row.Name,
        row.Description,
        row.Quantity,
        row.LastPrice,
        row.TotalValue,
    ]);

    // Combine header, column names, and data
    const worksheetData = [
        ...headerInfo,
        ["Ref No", "Name", "Description", "Quantity", "Last Price", "Total Value"],
        ...dataRows,
        [],
        ["Summary"],
        ["Total Items:", data.length],
        ["Total Quantity:", totalQuantity],
        ["Total Value:", totalValue],
    ];

    // Create a worksheet
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    ws['!cols'] = [
        { wch: 15 }, // Ref No
        { wch: 25 }, // Name
        { wch: 35 }, // Description
        { wch: 12 }, // Quantity
        { wch: 12 }, // Last Price
        { wch: 15 }, // Total Value
    ];

    // Style the header rows (make them bold)
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let R = 0; R < 2; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            if (!ws[cellAddress]) continue;
            if (!ws[cellAddress].s) ws[cellAddress].s = {};
            ws[cellAddress].s.font = { bold: true };
        }
    }

    // Create a workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stock Report");

    // Generate Excel file and save
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Stock_Report_${Date.now()}.xlsx`);
}