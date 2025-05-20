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

import './App.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Original impedance data generator based on fluid level
const generateImpedanceData = (fluidLevel) => {
  const frequencies = Array.from({ length: 100 }, (_, i) => i + 1); // 1 to 100 kHz
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
  const { frequencies, impedanceData } = generateImpedanceData(fluidLevel);

  // New state for manual L-Dex input
  const [voltageAffected, setVoltageAffected] = useState("");
  const [currentAffected, setCurrentAffected] = useState("");
  const [voltageUnaffected, setVoltageUnaffected] = useState("");
  const [currentUnaffected, setCurrentUnaffected] = useState("");
  const [manualLDex, setManualLDex] = useState(null);
  const [manualMessage, setManualMessage] = useState("");

  const calculateManualLDex = () => {
    const vA = parseFloat(voltageAffected);
    const iA = parseFloat(currentAffected);
    const vU = parseFloat(voltageUnaffected);
    const iU = parseFloat(currentUnaffected);

    if (!vA || !iA || !vU || !iU) {
      setManualMessage("Please fill all voltage and current values.");
      return;
    }

    const zA = vA / iA;
    const zU = vU / iU;

    const lDexVal = Math.log10(zA / zU) * 10;
    setManualLDex(lDexVal.toFixed(2));

    let message = "";
    if (Math.abs(lDexVal) < 3) {
      message = "Normal fluid levels.";
    } else if (Math.abs(lDexVal) < 10) {
      message = "Mild to moderate fluid buildup.";
    } else {
      message = "Significant fluid buildup. Please consult a specialist.";
    }

    setManualMessage(message);
  };

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
      title: {
        display: true,
        text: "Bioimpedance vs Frequency",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Frequency (kHz)",
        },
      },
      y: {
        title: {
          display: true,
          text: "Impedance (Ohms)",
        },
      },
    },
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Bioimpedance Simulation (Vite + React)</h2>

      {/* Fluid Level Slider */}
      <div className="mb-6">
        <label className="block mb-2">Lymph Fluid Level:</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={fluidLevel}
          onChange={(e) => setFluidLevel(parseFloat(e.target.value))}
          className="w-full"
        />
        <p className="mt-2">Current Fluid Level: {(fluidLevel * 100).toFixed(0)}%</p>
      </div>

      {/* Impedance Chart */}
      <Line data={data} options={options} />

      {/* Manual L-Dex Calculation Section */}
      <div className="mt-10 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Calculate L-Dex from Measured Data</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label>Affected Limb Voltage (V)</label>
            <input
              type="number"
              value={voltageAffected}
              onChange={(e) => setVoltageAffected(e.target.value)}
              className="w-full mt-1 p-2 rounded border"
            />
          </div>
          <div>
            <label>Affected Limb Current (A)</label>
            <input
              type="number"
              value={currentAffected}
              onChange={(e) => setCurrentAffected(e.target.value)}
              className="w-full mt-1 p-2 rounded border"
            />
          </div>
          <div>
            <label>Unaffected Limb Voltage (V)</label>
            <input
              type="number"
              value={voltageUnaffected}
              onChange={(e) => setVoltageUnaffected(e.target.value)}
              className="w-full mt-1 p-2 rounded border"
            />
          </div>
          <div>
            <label>Unaffected Limb Current (A)</label>
            <input
              type="number"
              value={currentUnaffected}
              onChange={(e) => setCurrentUnaffected(e.target.value)}
              className="w-full mt-1 p-2 rounded border"
            />
          </div>
        </div>

        <button
          onClick={calculateManualLDex}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Calculate L-Dex
        </button>

        {manualLDex && (
          <div className="mt-4 p-4 bg-white dark:bg-gray-700 rounded shadow text-center">
            <p><strong>L-Dex Index:</strong> {manualLDex}</p>
            <p>{manualMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
