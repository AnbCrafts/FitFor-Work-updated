import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";

const LocationHorizontalBar = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return null;

    return {
      labels: data.map((item) => item.location || "Unknown"),
      datasets: [
        {
          label: "Applications",
          data: data.map((item) => item.count || 0),
          backgroundColor: "rgba(139,92,246,0.6)", // purple-500 soft
          borderColor: "rgba(139,92,246,1)",       // purple-500 solid
          borderWidth: 1.5,
          borderRadius: 6,
        },
      ],
    };
  }, [data]);

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: "#555", font: { size: 12 } },
        grid: { color: "rgba(0,0,0,0.06)" },
      },
      y: {
        ticks: { color: "#444", font: { size: 13, weight: "500" } },
        grid: { color: "rgba(0,0,0,0.06)" },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-800 text-center mb-4">
        Applications by Location
      </h3>

      {chartData ? (
        <div className="h-[260px] w-full">
          <Bar data={chartData} options={options} />
        </div>
      ) : (
        <p className="text-center text-gray-500">No data available to display.</p>
      )}
    </div>
  );
};

export default LocationHorizontalBar;
