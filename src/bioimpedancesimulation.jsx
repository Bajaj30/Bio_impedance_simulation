// BioimpedanceSimulation.jsx
import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const generateImpedanceData = (fluidLevel, minFreq, maxFreq) => {
  const frequencies = Array.from({ length: maxFreq - minFreq + 1 }, (_, i) => i + minFreq);
  const R0 = 1000;
  const C0 = 1e-9;
  const fluidFactor = 1 - fluidLevel * 0.6;
  const resistance = R0 * fluidFactor;
  const capacitance = C0 * (1 + fluidLevel * 3);

  const impedanceData = frequencies.map((f) => {
    const omega = 2 * Math.PI * f * 1000;
    const denom = 1 + Math.pow(omega * resistance * capacitance, 2);
    const Z = resistance / Math.sqrt(denom);
    return Z;
  });

  return { frequencies, impedanceData };
};

export default function BioimpedanceSimulation() {
  const [fluidLevel, setFluidLevel] = useState(0.2);
  const [minFreq, setMinFreq] = useState(1);
  const [maxFreq, setMaxFreq] = useState(100);
  const [selectedFreq, setSelectedFreq] = useState(50);

  const { frequencies, impedanceData } = generateImpedanceData(fluidLevel, minFreq, maxFreq);

  const selectedIndex = frequencies.indexOf(selectedFreq);
  const selectedImpedance = selectedIndex !== -1 ? impedanceData[selectedIndex] : "N/A";

  const fluidPercentage = fluidLevel * 100;
  const lDexIndex = fluidPercentage / 10;

  const conclusion =
    lDexIndex < 3
      ? "Normal"
      : lDexIndex < 7
      ? "Elevated"
      : "Abnormal";

  const data = {
    labels: frequencies,
    datasets: [
      {
        label: "Impedance (Ohms)",
        data: impedanceData,
        borderColor: "#3b82f6",
        backgroundColor: "#93c5fd",
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Bioimpedance vs Frequency" },
    },
    scales: {
      x: { title: { display: true, text: "Frequency (kHz)" } },
      y: { title: { display: true, text: "Impedance (Ohms)" } },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex justify-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 space-y-8">
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Bioimpedance Simulation
        </h2>

        {/* Fluid Level Slider */}
        <div className="space-y-2">
          <label className="block font-medium text-gray-700">
            Lymph Fluid Level
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={fluidLevel}
            onChange={(e) => setFluidLevel(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-center font-medium text-gray-600">
            Fluid Level: {fluidPercentage.toFixed(0)}% | L-Dex Index: {lDexIndex.toFixed(1)}
          </div>
        </div>

        {/* Frequency Range Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-gray-700">Min Frequency (kHz)</label>
            <input
              type="number"
              min="1"
              max={maxFreq - 1}
              value={minFreq}
              onChange={(e) => setMinFreq(parseInt(e.target.value))}
              className="mt-1 w-full border rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700">Max Frequency (kHz)</label>
            <input
              type="number"
              min={minFreq + 1}
              max="100"
              value={maxFreq}
              onChange={(e) => setMaxFreq(parseInt(e.target.value))}
              className="mt-1 w-full border rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Selected Frequency */}
        <div className="space-y-2">
          <label className="block font-medium text-gray-700">
            Select Frequency (kHz)
          </label>
          <input
            type="range"
            min={minFreq}
            max={maxFreq}
            value={selectedFreq}
            onChange={(e) => setSelectedFreq(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-center font-medium text-gray-600">
            Impedance at <strong>{selectedFreq} kHz</strong>:{" "}
            <span className="text-blue-600 font-semibold">{selectedImpedance.toFixed(2)} Ω</span>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-gray-100 p-4 rounded-xl shadow-sm">
          <Line data={data} options={options} />
        </div>

        {/* Conclusion */}
        <div className="text-center pt-4 border-t text-lg font-semibold">
          Conclusion based on L-Dex Index:{" "}
          <span
            className={
              conclusion === "Normal"
                ? "text-green-600"
                : conclusion === "Elevated"
                ? "text-yellow-600"
                : "text-red-600"
            }
          >
            {conclusion}
          </span>
        </div>
      </div>
    </div>
  );
}