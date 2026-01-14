import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { TransactionLedgerDetailItem } from "@/interface/reportInterface";

export const generateLedgerExcel = (
    shopName: string,
    entityName: string,
    data: TransactionLedgerDetailItem[],
    dateRange?: { from: string; to: string }
) => {
    /* ---------------- Header Info ---------------- */
    const headerInfo = [
        [shopName.toUpperCase()],
        [entityName.toUpperCase()],
        ["Ledger Report"],
        [],
        ["Report Period:", dateRange ? `${dateRange.from} to ${dateRange.to}` : "All Time"],
        ["Generated On:", new Date().toLocaleDateString()],
        [],
    ];

    /* ---------------- Rows ---------------- */
    const rows = data.map((item) => ({
        Date: new Date(item.createdAt).toLocaleDateString(),
        TransactionNo: item.transactionNo,
        Item: item.inventoryName,
        UOM: item.unitOfMeasurement?.name || "N/A",
        Type: item.transactionType,
        Quantity: Number(item.quantity),
        Price: Number(item.price),
        Total: Number(item.total),
        PaymentType: item.paymentType,
        Customer: item.entityName,
    }));

    /* ---------------- Totals ---------------- */
    const totalQuantity = rows.reduce((acc, r) => acc + r.Quantity, 0);
    const totalAmount = rows.reduce((acc, r) => acc + r.Total, 0);

    /* ---------------- Convert to AOA ---------------- */
    const dataRows = rows.map((row) => [
        row.Date,
        row.TransactionNo,
        row.Item,
        row.Type,
        row.Quantity,
        row.Price,
        row.Total,
        row.PaymentType,
        row.Customer,
    ]);

    const worksheetData = [
        ...headerInfo,
        [
            "Date",
            "Transaction No",
            "Item",
            "Type",
            "Quantity",
            "Price",
            "Total",
            "Payment Type",
            "Customer",
        ],
        ...dataRows,
        [],
        ["Summary"],
        ["Total Transactions:", data.length],
        ["Total Quantity:", totalQuantity],
        ["Total Amount:", totalAmount],
    ];

    /* ---------------- Worksheet ---------------- */
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    ws["!cols"] = [
        { wch: 12 }, // Date
        { wch: 18 }, // Transaction No
        { wch: 25 }, // Item
        { wch: 12 }, // Type
        { wch: 12 }, // Quantity
        { wch: 12 }, // Price
        { wch: 14 }, // Total
        { wch: 16 }, // Payment Type
        { wch: 22 }, // Customer
    ];

    /* ---------------- Bold Header Rows ---------------- */
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
    for (let R = 0; R < 2; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
            const cell = XLSX.utils.encode_cell({ r: R, c: C });
            if (!ws[cell]) continue;
            ws[cell].s = ws[cell].s || {};
            ws[cell].s.font = { bold: true };
        }
    }

    /* ---------------- Workbook ---------------- */
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ledger");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(
        blob,
        `Ledger_${entityName.replace(/\s+/g, "_")}_${Date.now()}.xlsx`
    )
}