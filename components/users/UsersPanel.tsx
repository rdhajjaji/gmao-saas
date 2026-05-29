"use client";

import { useState } from "react";
import { Users, X } from "lucide-react";

export default function UsersPanel() {
  const [open, setOpen] = useState(false);

  const users = [
    { email: "admin@gmao.com", role: "ADMIN", active: true },
    { email: "tech@gmao.com", role: "USER", active: true },
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-end">

      <div className="w-[420px] h-full bg-zinc-950 border-l border-zinc-800 p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users size={18} />
            Users
          </h2>

          <button onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>

        {/* LIST */}
        <div className="space-y-3">
          {users.map((u, i) => (
            <div
              key={i}
              className="p-3 bg-zinc-900 rounded-xl border border-zinc-800"
            >
              <p className="text-sm">{u.email}</p>

              <div className="flex justify-between mt-2 text-xs text-zinc-400">
                <span>{u.role}</span>
                <span className={u.active ? "text-green-400" : "text-red-400"}>
                  {u.active ? "Active" : "Disabled"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CREATE BUTTON */}
        <button className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded-xl">
          + Create User
        </button>
      </div>
    </div>
  );
}

/* Trigger button */
UsersPanel.Trigger = function Trigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-zinc-300 hover:text-white"
      >
        <Users size={16} />
        Users
      </button>

      {open && <UsersPanel />}
    </>
  );
};