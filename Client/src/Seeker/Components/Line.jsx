import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";

const ApplicationsLineChart = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return null;

    return {
      labels: data.map((item) => item.date),
      datasets: [
        {
          label: "Applications",
          data: data.map((item) => item.count),
          borderColor: "rgba(168, 85, 247, 1)",      // purple-500
          backgroundColor: "rgba(168, 85, 247, 0.15)", // purple soft fill
          fill: true,
          tension: 0.35,
          pointBackgroundColor: "rgba(168, 85, 247, 1)",
          pointBorderColor: "#fff",
          pointRadius: 4,
          borderWidth: 2,
        },
      ],
    };
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          color: "#555",
          font: { size: 12 },
        },
        grid: {
          color: "rgba(0,0,0,0.06)",
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#444",
          font: { size: 13, weight: "500" },
        },
        grid: {
          color: "rgba(0,0,0,0.06)",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-800 text-center mb-4">
        Applications Over Time
      </h3>

      {chartData ? (
        <div className="h-[260px] w-full">
          <Line data={chartData} options={options} />
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No data available to display.
        </p>
      )}
    </div>
  );
};

export default ApplicationsLineChart;
