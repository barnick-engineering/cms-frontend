import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableCell,
  TableRow,
  TableBody,
  TableHeader,
} from "../ui/table";

export default function Report() {
  const getThirtyDaysFormatted = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    return thirtyDaysAgo.toISOString().split("T")[0];
  };

  const getTodayFormatted = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [startDate, setStartDate] = useState(getThirtyDaysFormatted());
  const [endDate, setEndDate] = useState(getTodayFormatted());
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // clear form fields
  const clearFormFields = () => {
    setStartDate("");
    setEndDate("");
    setReportData(null);
  };

  useEffect(() => {}, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/dashboard/reports/?start_date=${startDate}&end_date=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      setReportData(response.data.data);
      console.log(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch report data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">
        Balance Sheet Report
      </h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-row gap-4 mb-4">
          <div className="flex flex-col">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 rounded border border-gray-500 shadow dark:bg-dark-900 text-black dark:text-white dark:border-gray-700"
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              className="p-2 rounded border border-gray-500 shadow dark:bg-dark-900 text-black dark:text-white dark:border-gray-700"
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={loading}
            >
              {loading ? "Loading..." : "Generate Report"}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {reportData && (
        <div className="space-y-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded shadow">
              <h3 className="text-lg font-semibold mb-2 dark:text-white">
                Total Received
              </h3>
              <p className="text-2xl font-bold dark:text-white">
                {reportData.total_paid.toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-red-100 dark:bg-red-900 rounded shadow">
              <h3 className="text-lg font-semibold mb-2 dark:text-white">
                Total Expenses
              </h3>
              <p className="text-2xl font-bold dark:text-white">
                {reportData.total_expense.toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-green-100 dark:bg-green-900 rounded shadow">
              <h3 className="text-lg font-semibold mb-2 dark:text-white">
                Net Profit
              </h3>
              <p className="text-2xl font-bold dark:text-white">
                {reportData.total_net_profit.toFixed(2)}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              Daily Breakdown
            </h2>

            {reportData.date_wise_data &&
            Object.keys(reportData.date_wise_data).length > 0 ? (
              <div className="overflow-x-auto">
                <Table className="border-white">
                  <TableHeader className="">
                    <TableRow className="text-left">
                      <TableCell isHeader className="font-bold dark:text-white">
                        Date
                      </TableCell>
                      <TableCell isHeader className="font-bold dark:text-white">
                        Workorders
                      </TableCell>
                      <TableCell isHeader className="font-bold dark:text-white">
                        Workorder Total
                      </TableCell>
                      <TableCell isHeader className="font-bold dark:text-white">
                        Expenses
                      </TableCell>
                      <TableCell isHeader className="font-bold dark:text-white">
                        Expense Total
                      </TableCell>
                      <TableCell isHeader className="font-bold dark:text-white">
                        Daily Net
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(reportData.date_wise_data).map(
                      ([date, data]: [string, any]) => {
                        const workorderTotal = data.workorders.reduce(
                          (sum: number, wo: any) => sum + (wo.total_paid || 0),
                          0
                        );
                        const expenseTotal = data.expenses.reduce(
                          (sum: number, exp: any) => sum + (exp.amount || 0),
                          0
                        );
                        const dailyNet = workorderTotal - expenseTotal;

                        return (
                          <TableRow key={date}>
                            <TableCell className="dark:text-white">
                              {new Date(date).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="dark:text-white">
                              {data.workorders.length}
                            </TableCell>
                            <TableCell className="dark:text-white">
                              {workorderTotal.toFixed(2)}
                            </TableCell>
                            <TableCell className="dark:text-white">
                              {data.expenses.length}
                            </TableCell>
                            <TableCell className="dark:text-white">
                              {expenseTotal.toFixed(2)}
                            </TableCell>
                            <TableCell
                              className={
                                dailyNet >= 0
                                  ? "text-green-600 font-semibold"
                                  : "text-red-600 font-semibold"
                              }
                            >
                              {dailyNet.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      }
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="dark:text-white">
                No daily data available for the selected date range.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
