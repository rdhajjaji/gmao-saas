import { ReactNode } from "react";

export default function Card({
  title,
  value,
  icon,
  className,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-3xl p-6 shadow-xl transition hover:scale-[1.02] ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-zinc-400">{title}</h2>
        {icon}
      </div>

      <p className="text-4xl font-bold mt-4">{value}</p>
    </div>
  );
}