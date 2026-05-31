"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

export default function NewUserPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    code: "",
    email: "",
    password: "",
    role: "TECH",
  });

  async function createUser(e: any) {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Erreur création");
      }

      router.push("/users");

    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">

        <div>
          <h1 className="text-3xl font-bold">
            Ajouter utilisateur
          </h1>

          <p className="text-slate-400 text-sm">
            Création d’un nouveau compte
          </p>
        </div>

        <button
          onClick={() => router.push("/users")}
          className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl hover:bg-slate-800"
        >
          <ArrowLeft size={16} />
          Retour
        </button>

      </div>

      {/* FORM */}
      <form
        onSubmit={createUser}
        className="max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5"
      >

        {/* CODE */}
        <div>
          <label className="text-sm text-slate-300 mb-1 block">
            Code utilisateur
          </label>

          <input
            type="text"
            required
            value={form.code}
            onChange={(e) =>
              setForm({ ...form, code: e.target.value })
            }
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
            placeholder="TECH001"
          />
        </div>

        {/* EMAIL */}
        <div>
          <label className="text-sm text-slate-300 mb-1 block">
            Email
          </label>

          <input
            type="email"
            required
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
            placeholder="user@email.com"
          />
        </div>

        {/* PASSWORD */}
        <div>
          <label className="text-sm text-slate-300 mb-1 block">
            Mot de passe
          </label>

          <input
            type="password"
            required
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
            placeholder="********"
          />
        </div>

        {/* ROLE */}
        <div>
          <label className="text-sm text-slate-300 mb-1 block">
            Rôle
          </label>

          <select
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value })
            }
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="TECH">Technicien</option>
          </select>
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 transition rounded-xl py-3 font-medium"
        >
          <Save size={18} />

          {loading ? "Création..." : "Créer utilisateur"}
        </button>

      </form>

    </div>
  );
}

