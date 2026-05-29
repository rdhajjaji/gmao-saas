"use client";

import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/api/users").then(r => r.json()).then(setUsers);
  }, []);

  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Users</h1>

        <button className="bg-white text-black px-4 py-2 rounded-xl">
          + Create User
        </button>
      </div>

      <div className="rounded-2xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="p-3 text-left">Email</th>
              <th>Code</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} className="border-t border-zinc-800">
                <td className="p-3">{u.email}</td>
                <td>{u.code}</td>
                <td>
                  <span className="px-2 py-1 rounded bg-zinc-800">
                    {u.role}
                  </span>
                </td>
                <td>{u.active ? "Active" : "Inactive"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}