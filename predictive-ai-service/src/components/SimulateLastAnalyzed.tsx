"use client;";
import { RootState } from "@/app/redux/store";
import React, { useState } from "react";
import { useSelector } from "react-redux";

export const SimulateLastAnalyzed = () => {
  const patientId = useSelector((state: RootState) => state.auth.patientId);
  const [status, setStatus] = useState("Patient not yet analyzed");

  const handleAnalyze = async () => {
    if (!patientId) return;

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    try {
      await fetch(`/api/analyze?patientId=${patientId}&date=${today}`, {
        method: "POST",
      });
      setStatus(`Last analyzed on ${today}`);
    } catch (err) {
      console.error("Failed to analyze patient:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">AI Insights Launch</h1>
      <p className="mb-2">Patient ID: {patientId}</p>
      <p className="mb-4">{status}</p>
      <button
        onClick={handleAnalyze}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Analyze Patient
      </button>
    </div>
  );
};
