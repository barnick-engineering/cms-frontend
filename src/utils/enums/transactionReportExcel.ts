import * as XLSX from "xlsx";

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

export const generateTransactionReportExcel = (
    data: TransactionReportItem[],
    shopName: string,
    dateRange?: { from: string; to: string },
    transactionType?: string
) => {
    // Calculate summary
    const summary: TransactionSummary = {
        totalTransactions: data.length,
        totalBillAmount: data.reduce((acc, item) => acc + Number(item.totalAmount), 0),
        totalPaid: data.reduce((acc, item) => acc + Number(item.paid), 0),
        totalDue: data.reduce((acc, item) => acc + Number(item.pending), 0),
    };

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Header Information
    const headerData = [
        [shopName.toUpperCase()],
        ["Transaction Report"],
        [],
        [`Transaction Type: ${transactionType || "All Types"}`],
        [
            `Report Period: ${dateRange
                ? `${new Date(dateRange.from).toLocaleDateString("en-GB")} to ${new Date(dateRange.to).toLocaleDateString("en-GB")}`
                : "All Time"
            }`,
        ],
        [`Generated On: ${new Date().toLocaleDateString("en-GB")}`],
        [],
    ];

    // Table Headers
    const tableHeaders = [
        "Date",
        "Transaction ID",
        "Type",
        "Customer/Vendor",
        "Items",
        "Bill Amount",
        "Paid",
        "Due",
        "Payment Method",
    ];

    // Table Data
    const tableData = data.map((item) => {
        const partyName = item.vendor?.name || item.customer?.name || "N/A";
        const itemsSummary = item.details
            .map((d) => `${d.inventory?.name || "N/A"} (${d.quantity})`)
            .join(", ");

        return [
            new Date(item.createdAt).toLocaleDateString("en-GB"),
            item.no,
            item.transactionType,
            partyName,
            itemsSummary,
            Number(item.totalAmount).toFixed(2),
            Number(item.paid).toFixed(2),
            Number(item.pending).toFixed(2),
            item.paymentType,
        ];
    });

    // Summary Section
    const summaryData = [
        [],
        ["Summary"],
        ["Total Transactions", summary.totalTransactions],
        ["Total Bill Amount", summary.totalBillAmount.toFixed(2)],
        ["Total Paid", summary.totalPaid.toFixed(2)],
        ["Total Due", summary.totalDue.toFixed(2)],
    ];

    // Combine all data
    const worksheetData = [
        ...headerData,
        tableHeaders,
        ...tableData,
        ...summaryData,
    ];

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    ws["!cols"] = [
        { wch: 12 },  // Date
        { wch: 18 },  // Transaction ID
        { wch: 12 },  // Type
        { wch: 20 },  // Customer/Vendor
        { wch: 40 },  // Items
        { wch: 15 },  // Bill Amount
        { wch: 12 },  // Paid
        { wch: 12 },  // Due
        { wch: 15 },  // Payment Method
    ];

    // Style the header rows
    const headerStyle = {
        font: { bold: true, sz: 14 },
        alignment: { horizontal: "center" },
    };

    // const subHeaderStyle = {
    //     font: { bold: true, sz: 11 },
    // };

    // Apply styles to header cells
    if (ws["A1"]) ws["A1"].s = headerStyle;
    if (ws["A2"]) ws["A2"].s = { font: { sz: 11 }, alignment: { horizontal: "center" } };

    // Apply bold to table header row
    const headerRowIndex = headerData.length + 1;
    tableHeaders.forEach((_, colIndex) => {
        const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex - 1, c: colIndex });
        if (ws[cellAddress]) {
            ws[cellAddress].s = {
                font: { bold: true },
                fill: { fgColor: { rgb: "334155" } },
                alignment: { horizontal: "center" },
            };
        }
    });

    // Apply bold to summary section
    const summaryStartRow = headerData.length + tableData.length + 2;
    if (ws[`A${summaryStartRow}`]) {
        ws[`A${summaryStartRow}`].s = { font: { bold: true, sz: 12 } };
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Transaction Report");

    // Generate file name
    const fileName = `Transaction_Report_${transactionType || "All"}_${Date.now()}.xlsx`;

    // Save file
    XLSX.writeFile(wb, fileName);
}