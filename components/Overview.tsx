"use client";
import { useEffect, useState } from "react";
import KpiCard from "./KpiCard";

interface OverviewData {
  revenue: number;
  orders: number;
  aov: number;
  roi: number;
}

export default function Overview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetch("/api/kpi/overview")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);
  
  if (error) return <p>Error loading data: {error}</p>;
  if (!data) return <p>Loading…</p>;
  
  return (
    <div className="kpi-grid grid gap-4 md:grid-cols-4">
      <KpiCard label="Revenue" value={`₱${(data.revenue || 0).toLocaleString()}`} />
      <KpiCard label="Orders" value={(data.orders || 0).toString()} />
      <KpiCard label="AOV" value={`₱${data.aov || 0}`} />
      <KpiCard label="ROI" value={`${data.roi || 0}%`} />
    </div>
  );
}
