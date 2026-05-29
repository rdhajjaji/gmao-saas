"use client";

import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });

  async function loadUsers() {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function createUser() {
    await fetch("/api/users", {
      method: "POST",
      body: JSON.stringify(form),
    });

    setForm({ name: "", email: "", password: "", role: "USER" });
    loadUsers();
  }

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">Utilisateurs</h1>

      {/* ADD USER */}
      <div className="bg-slate-900 p-4 rounded-xl space-y-3">
        <input
          placeholder="Nom"
          className="p-2 w-full bg-slate-800 rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Email"
          className="p-2 w-full bg-slate-800 rounded"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          placeholder="Password"
          type="password"
          className="p-2 w-full bg-slate-800 rounded"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <select
          className="p-2 w-full bg-slate-800 rounded"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="USER">USER</option>
          <option value="TECH">TECH</option>
          <option value="ADMIN">ADMIN</option>
        </select>

        <button
          onClick={createUser}
          className="bg-green-600 px-4 py-2 rounded"
        >
          Ajouter utilisateur
        </button>
      </div>

      {/* LIST */}
      <div className="bg-slate-900 p-4 rounded-xl">
        <h2 className="text-xl mb-3">Liste des utilisateurs</h2>

        <div className="space-y-2">
          {users.map((u: any) => (
            <div
              key={u.id}
              className="p-3 bg-slate-800 rounded flex justify-between"
            >
              <div>
                <p className="font-bold">{u.name}</p>
                <p className="text-sm text-gray-400">{u.email}</p>
              </div>

              <span className="text-sm text-cyan-400">
                {u.role}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}