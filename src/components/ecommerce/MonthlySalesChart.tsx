import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { MoreDotIcon } from "../../icons";
import { useEffect, useState } from "react";
import axios from "axios";

export default function MonthlySalesChart() {
  const [monthlySales, setMonthlySales] = useState<any[]>([]);
  const [monthLabels, setMonthLabels] = useState<string[]>([]);

  // Generate the last 12 month labels (Mar 2024 - Mar 2025)
  useEffect(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const labels = [];

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0-11
    const currentYear = currentDate.getFullYear();

    // Generate 12 month labels going backwards from the current month
    for (let i = 11; i >= 0; i--) {
      let month = (currentMonth - i + 12) % 12; // Ensures we wrap around properly
      let year = currentYear;

      // If we've wrapped around to a previous year
      if (currentMonth - i < 0) {
        year = currentYear - 1;
      }

      // Create label with month abbreviation and year
      const label = `${months[month]} ${year.toString().substr(2)}`;
      labels.push(label);
    }

    setMonthLabels(labels);
  }, []);

  // Update options with our dynamic month labels
  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: monthLabels,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
  };

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/dashboard/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      const monthlyData = response?.data?.data?.monthly_sales;
      console.log("monthly sales:", monthlyData);

      setMonthlySales([
        {
          name: "Sales",
          data: monthlyData,
        },
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Monthly Sales
        </h3>
        <div className="relative inline-block">
          <button
            className="dropdown-toggle"
            onClick={() => setIsOpen(!isOpen)}
          >
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <Chart
            options={options}
            series={monthlySales}
            type="bar"
            height={180}
          />
        </div>
      </div>
    </div>
  );
}
