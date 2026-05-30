"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, Trash2 } from "lucide-react";

export default function UsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });

  async function loadUsers() {
    try {
      setLoading(true);

      const res = await fetch("/api/users");
      const data = await res.json();

      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function createUser() {
    await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setForm({ name: "", email: "", password: "", role: "USER" });
    loadUsers();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <h1 className="text-3xl font-bold">
          👥 Gestion des utilisateurs
        </h1>

        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl"
        >
          <ArrowLeft size={18} />
          Retour Dashboard
        </button>

      </div>

      {/* CREATE USER CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">

        <h2 className="text-xl font-semibold">
          ➕ Créer un utilisateur
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <input
            placeholder="Nom"
            className="p-3 bg-slate-800 rounded-xl outline-none"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            placeholder="Email"
            className="p-3 bg-slate-800 rounded-xl outline-none"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            placeholder="Mot de passe"
            type="password"
            className="p-3 bg-slate-800 rounded-xl outline-none"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <select
            className="p-3 bg-slate-800 rounded-xl"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="USER">Utilisateur</option>
            <option value="TECH">Technicien</option>
            <option value="ADMIN">Administrateur</option>
          </select>

        </div>

        <button
          onClick={createUser}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-5 py-3 rounded-xl"
        >
          <UserPlus size={18} />
          Créer utilisateur
        </button>

      </div>

      {/* LIST */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

        <h2 className="text-xl font-semibold mb-4">
          📋 Liste des utilisateurs
        </h2>

        {loading ? (
          <p className="text-slate-400">Chargement...</p>
        ) : users.length === 0 ? (
          <p className="text-slate-400">Aucun utilisateur trouvé</p>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="p-3">Nom</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Rôle</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u: any) => (
                  <tr
                    key={u.id}
                    className="border-b border-slate-800 hover:bg-slate-800 transition"
                  >
                    <td className="p-3 font-semibold">{u.name}</td>
                    <td className="p-3 text-slate-300">{u.email}</td>

                    <td className="p-3">
                      <span className={`
                        px-3 py-1 rounded-full text-sm
                        ${u.role === "ADMIN" ? "bg-red-600" : ""}
                        ${u.role === "TECH" ? "bg-yellow-600" : ""}
                        ${u.role === "USER" ? "bg-blue-600" : ""}
                      `}>
                        {u.role}
                      </span>
                    </td>

                    <td className="p-3">
                      <button className="text-red-400 hover:text-red-300">
                        <Trash2 size={18} />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}