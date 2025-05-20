// BioimpedanceSimulation.jsx
import React, { useState, useRef } from "react";
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
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";

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
  const [darkMode, setDarkMode] = useState(false);
  const [leftFluid, setLeftFluid] = useState(0.2);
  const [rightFluid, setRightFluid] = useState(0.2);
  const [minFreq, setMinFreq] = useState(1);
  const [maxFreq, setMaxFreq] = useState(100);
  const chartRef = useRef();

  const left = generateImpedanceData(leftFluid, minFreq, maxFreq);
  const right = generateImpedanceData(rightFluid, minFreq, maxFreq);
  const lDexLeft = (leftFluid * 100) / 10;
  const lDexRight = (rightFluid * 100) / 10;
  const lDexDiff = Math.abs(lDexLeft - lDexRight);

  const conclusion =
    lDexDiff < 2 ? "Normal" : lDexDiff < 4 ? "Slight Asymmetry" : "Significant Asymmetry";

  const chartData = {
    labels: left.frequencies,
    datasets: [
      {
        label: "Left Limb",
        data: left.impedanceData,
        borderColor: "#3b82f6",
        backgroundColor: "#93c5fd",
        fill: false,
      },
      {
        label: "Right Limb",
        data: right.impedanceData,
        borderColor: "#f97316",
        backgroundColor: "#fdba74",
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Bioimpedance Comparison (Left vs Right Limb)" },
    },
    scales: {
      x: { title: { display: true, text: "Frequency (kHz)" } },
      y: { title: { display: true, text: "Impedance (Ohms)" } },
    },
  };

  const exportToPNG = async () => {
    const canvas = await html2canvas(chartRef.current);
    canvas.toBlob((blob) => saveAs(blob, "impedance_chart.png"));
  };

  const exportToCSV = () => {
    const rows = ["Frequency,Left Impedance,Right Impedance"];
    left.frequencies.forEach((f, i) => {
      rows.push(`${f},${left.impedanceData[i]},${right.impedanceData[i]}`);
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    saveAs(blob, "impedance_data.csv");
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"} min-h-screen p-6`}>      
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Bioimpedance Simulation</h2>
          <button
            className="bg-gray-200 dark:bg-gray-800 px-4 py-2 rounded"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: "Left Limb", fluid: leftFluid, setFluid: setLeftFluid },
            { label: "Right Limb", fluid: rightFluid, setFluid: setRightFluid },
          ].map(({ label, fluid, setFluid }) => (
            <div key={label} className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow">
              <h3 className="font-semibold mb-2">{label} Fluid Level</h3>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={fluid}
                onChange={(e) => setFluid(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="mt-2">
                Fluid Level: {(fluid * 100).toFixed(0)}% | L-Dex Index: {(fluid * 100 / 10).toFixed(1)}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Min Frequency (kHz)</label>
            <input
              type="number"
              value={minFreq}
              min="1"
              max={maxFreq - 1}
              onChange={(e) => setMinFreq(parseInt(e.target.value))}
              className="w-full px-2 py-1 border rounded"
            />
          </div>
          <div>
            <label>Max Frequency (kHz)</label>
            <input
              type="number"
              value={maxFreq}
              min={minFreq + 1}
              max="100"
              onChange={(e) => setMaxFreq(parseInt(e.target.value))}
              className="w-full px-2 py-1 border rounded"
            />
          </div>
        </div>

        <div ref={chartRef} className="bg-white dark:bg-gray-800 p-4 rounded-xl">
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className="flex gap-4">
          <button onClick={exportToPNG} className="bg-blue-600 text-white px-4 py-2 rounded">Export PNG</button>
          <button onClick={exportToCSV} className="bg-green-600 text-white px-4 py-2 rounded">Export CSV</button>
        </div>

        <div className="mt-4 text-xl font-semibold text-center">
          L-Dex Difference: {lDexDiff.toFixed(2)} —
          <span
            className={
              conclusion === "Normal"
                ? "text-green-600"
                : conclusion === "Slight Asymmetry"
                ? "text-yellow-500"
                : "text-red-600"
            }
          >
            {" "}{conclusion}
          </span>
        </div>
      </div>
    </div>
  );
}