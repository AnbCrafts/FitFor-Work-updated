import React, { useMemo } from "react";
import { Pie } from "react-chartjs-2";

const ApplicationStatusPie = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data || typeof data !== "object") return null;

    const labels = Object.keys(data);
    const values = Object.values(data);

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            "rgba(168, 85, 247, 0.6)",  // purple
            "rgba(139, 92, 246, 0.6)",  // purple-light
            "rgba(79, 70, 229, 0.6)",   // indigo-ish
            "rgba(236, 72, 153, 0.6)",  // pink accent
          ],
          borderColor: [
            "rgba(168, 85, 247, 1)",
            "rgba(139, 92, 246, 1)",
            "rgba(79, 70, 229, 1)",
            "rgba(236, 72, 153, 1)",
          ],
          borderWidth: 1.5,
        },
      ],
    };
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#444",
          font: { size: 13, weight: "500" },
          padding: 16,
        },
      },
    },
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-800 text-center mb-4">
        Application Status
      </h3>

      {chartData ? (
        <div className="h-[260px] w-full">
          <Pie data={chartData} options={options} />
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No data available to display.
        </p>
      )}
    </div>
  );
};

export default ApplicationStatusPie;
