import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-slate-950 p-4">
      <h2 className="text-xl font-bold mb-6">GMAO</h2>

      <div className="flex flex-col gap-3">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/machines">Machines</Link>
        <Link href="/tickets">Tickets</Link>
        <Link href="/users">Users</Link>
      </div>
    </div>
  );
}