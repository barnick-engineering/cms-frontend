// @ts-nocheck
import axios from "axios";
import { useEffect, useState } from "react";

export default function MonthlyTarget() {
  const [data, setData] = useState([]);

  const dashboard = async () => {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/dashboard/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
    });
    console.log("datas:", response?.data);
    setData(response?.data?.data);
  };

  useEffect(() => {
    dashboard();
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-10 dark:bg-gray-900 sm:px-6 sm:pt-6 text-center">
        <div className="flex justify-center">
          <div>
            <h3 className="text-lg font-semibold  text-gray-800 dark:text-white/90">
              Last 30 days
            </h3>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Total
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {data?.worked}
          </p>
        </div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Received
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg ml-3">
            {data?.paid}
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Expense
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {data?.total_regular_expense}
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Net Profit
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {data?.paid - data?.total_regular_expense}
          </p>
        </div>
      </div>
    </div>
  );
}
