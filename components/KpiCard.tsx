export default function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col p-4 bg-white rounded shadow">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-2xl font-semibold">{value}</span>
    </div>
  );
}
