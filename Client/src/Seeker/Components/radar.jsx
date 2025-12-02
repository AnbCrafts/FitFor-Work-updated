import React, { useMemo } from "react";
import { Radar } from "react-chartjs-2";

const ResumeScoreRadar = ({ data }) => {
  const chartData = useMemo(() => {
    if (
      !data ||
      typeof data !== "object" ||
      !data.brief ||
      typeof data.brief !== "object"
    )
      return null;

    const labels = Object.keys(data.brief).map((key) =>
      key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())
    );

    const values = Object.values(data.brief);

    return {
      labels,
      datasets: [
        {
          label: "Resume Strength",
          data: values,
          backgroundColor: "rgba(168, 85, 247, 0.20)", // purple-400
          borderColor: "rgba(168, 85, 247, 1)",        // purple-500
          pointBackgroundColor: "rgba(168, 85, 247, 1)",
          pointBorderColor: "#fff",
          borderWidth: 2,
          pointRadius: 3
        },
      ],
    };
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        grid: { color: "rgba(0,0,0,0.1)" },
        angleLines: { color: "rgba(0,0,0,0.1)" },
        pointLabels: {
          color: "#333",
          font: { size: 13, weight: "500" },
        },
        ticks: {
          display: false,
        },
        suggestedMin: 0,
        suggestedMax: 10,
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
        Resume Score Breakdown
      </h3>

      {chartData ? (
        <div className="h-[260px]">
          <Radar data={chartData} options={options} />
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No data available to display.
        </p>
      )}
    </div>
  );
};

export default ResumeScoreRadar;
