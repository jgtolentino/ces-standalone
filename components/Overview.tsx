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
  useEffect(() => {
    fetch("/api/kpi/overview")
      .then((r) => r.json())
      .then(setData);
  }, []);
  if (!data) return <p>Loading…</p>;
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <KpiCard label="Revenue" value={`₱${data.revenue.toLocaleString()}`} />
      <KpiCard label="Orders" value={data.orders.toString()} />
      <KpiCard label="AOV" value={`₱${data.aov}`} />
      <KpiCard label="ROI" value={`${data.roi}%`} />
    </div>
  );
}
