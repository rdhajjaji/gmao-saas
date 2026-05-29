export default function Card({
  title,
  value,
  icon,
}: any) {
  return (
    <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 hover:border-zinc-700 transition">
      <div className="flex justify-between items-center text-zinc-400">
        <span>{title}</span>
        {icon}
      </div>

      <div className="text-4xl font-bold mt-4">
        {value}
      </div>
    </div>
  );
}