"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Hash, Plus, Pencil } from "lucide-react";

export default function UsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // 📅 FORMAT DATE SAFE
  const formatDate = (date: any) => {
    if (!date) return "--";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "--";

    return d.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 📥 LOAD USERS
  async function loadUsers() {
    try {
      setLoading(true);

      const res = await fetch("/api/users");
      const data = await res.json();

      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("LOAD ERROR:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  // 🔎 FILTER
  const filteredUsers = useMemo(() => {
    return users.filter((u: any) => {
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;

      if (statusFilter === "ACTIVE" && !u.active) return false;
      if (statusFilter === "DISABLED" && u.active) return false;

      return true;
    });
  }, [users, roleFilter, statusFilter]);

  // 🔄 TOGGLE ACTIVE (DB)
  async function toggleUserStatus(id: string) {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    const newStatus = !user.active;
    const previous = users;

    // UI optimistic
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, active: newStatus, updatedAt: new Date().toISOString() }
          : u
      )
    );

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: newStatus }),
      });

      if (!res.ok) throw new Error("PATCH failed");

    } catch (err) {
      console.error(err);
      setUsers(previous); // rollback
    }
  }

  // ❌ DELETE USER (DB)
  async function deleteUser(id: string) {
    const confirmDelete = confirm("Supprimer cet utilisateur ?");
    if (!confirmDelete) return;

    const previous = users;

    // UI remove
    setUsers((prev) => prev.filter((u) => u.id !== id));

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("DELETE failed");

    } catch (err) {
      console.error(err);
      setUsers(previous); // rollback
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-3xl font-bold">Utilisateurs</h1>
          <p className="text-slate-400 text-sm">Gestion des comptes</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => router.push("/users/new")}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl border border-slate-700"
          >
            <Plus size={16} />
            Ajouter
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800"
          >
            <ArrowLeft size={16} />
            Dashboard
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex gap-2 mb-4">

        <select
          className="bg-slate-800 px-3 py-2 rounded-lg text-sm"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="ALL">Tous rôles</option>
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Manager</option>
          <option value="TECH">Tech</option>
         
        </select>

        <select
          className="bg-slate-800 px-3 py-2 rounded-lg text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">Tous statuts</option>
          <option value="ACTIVE">Actif</option>
          <option value="DISABLED">Désactivé</option>
        </select>

      </div>

      {/* TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 overflow-x-auto">

        {loading ? (
          <div className="text-center py-6 text-slate-400">
            Chargement...
          </div>
        ) : (
          <table className="w-full text-xs">

            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="text-left py-2 px-2">Code</th>
                <th className="text-center py-2 px-2">Rôle</th>
                <th className="text-center py-2 px-2">Statut</th>
                <th className="text-center py-2 px-2">Créé</th>
                <th className="text-center py-2 px-2">Modifié</th>
                <th className="text-center py-2 px-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((u: any) => (
                <tr key={u.id} className="border-b border-slate-800 hover:bg-slate-800/40">

                  {/* CODE */}
                  <td className="py-2 px-2 flex items-center gap-1">
                    <Hash size={12} />
                    {u.code || "--"}
                  </td>

                  {/* ROLE */}
                  <td className="py-2 px-2 text-center">{u.role}</td>

                  {/* STATUS */}
                  <td className="py-2 px-2 text-center">
                    {u.active ? (
                      <span className="text-green-400">Actif</span>
                    ) : (
                      <span className="text-red-400">Désactivé</span>
                    )}
                  </td>

                  {/* CREATED */}
                  <td className="py-2 px-2 text-center text-slate-300">
                    {formatDate(u.createdAt)}
                  </td>

                  {/* UPDATED */}
                  <td className="py-2 px-2 text-center text-slate-300">
                    {formatDate(u.updatedAt)}
                  </td>

                  {/* ACTIONS */}
                  <td className="py-2 px-2">
                    <div className="flex items-center justify-center gap-2">

                      {/* 1. ACTIVER / DÉSACTIVER */}
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className={`px-2 py-1 rounded text-[11px] border
                          ${
                            u.active
                              ? "text-red-400 border-red-500 hover:bg-red-500/10"
                              : "text-green-400 border-green-500 hover:bg-green-500/10"
                          }
                        `}
                      >
                        {u.active ? "Désactiver" : "Activer"}
                      </button>

                      {/* 2. MODIFIER */}
                      <button
                        onClick={() => router.push(`/users/edit/${u.id}`)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Pencil size={14} />
                      </button>

                      {/* 3. SUPPRIMER */}
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={14} />
                      </button>

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        )}

      </div>

    </div>
  );
}