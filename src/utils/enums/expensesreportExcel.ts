import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { ExpenseReportItem } from "@/interface/reportInterface";

export const generateExpenseReportExcel = (
    data: ExpenseReportItem[],
    shopName: string,
    dateRange?: { from: string; to: string }
) => {
    // Create header information
    const headerInfo = [
        [shopName.toUpperCase()],
        ["Expense Report"],
        [],
        ["Report Period:", dateRange ? `${dateRange.from} to ${dateRange.to}` : "All Time"],
        ["Generated On:", new Date().toLocaleDateString()],
        [],
    ];

    // Map data to plain objects for Excel
    const rows = data.map((item) => ({
        Date: new Date(item.createdAt).toLocaleDateString(),
        Title: item.title,
        Type: item.type,
        Amount: Number(item.amount),
        Remarks: item.remarks || "N/A",
    }));

    // Calculate total
    const totalExpenses = data.reduce((acc, item) => acc + Number(item.amount), 0);

    // Add total row
    rows.push({
        Date: "",
        Title: "",
        Type: "Total Expenses",
        Amount: totalExpenses,
        Remarks: "",
    });

    // Convert rows to array format
    const dataRows = rows.map(row => [
        row.Date,
        row.Title,
        row.Type,
        row.Amount,
        row.Remarks
    ]);

    // Combine header, column names, and data
    const worksheetData = [
        ...headerInfo,
        ["Date", "Title", "Type", "Amount", "Remarks"],
        ...dataRows,
    ];

    // Create a worksheet
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    ws['!cols'] = [
        { wch: 12 }, // Date
        { wch: 25 }, // Title
        { wch: 15 }, // Type
        { wch: 12 }, // Amount
        { wch: 40 }, // Remarks
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
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");

    // Generate Excel file and save
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Expense_Report_${Date.now()}.xlsx`);
}