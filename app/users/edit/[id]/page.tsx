"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

type UserForm = {
  code: string;
  email: string;
  password: string;
  role: "ADMIN" | "MANAGER" | "TECH";
};

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState<UserForm>({
    code: "",
    email: "",
    password: "",
    role: "TECH",
  });

  // =========================
  // LOAD USER
  // =========================
  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        setFetching(true);

        const res = await fetch(`/api/users/${id}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data?.error || "User not found");

        setForm({
          code: data.code,
          email: data.email,
          password: "",
          role: data.role,
        });

      } catch (err) {
        alert("Utilisateur introuvable");
        router.push("/users");
      } finally {
        setFetching(false);
      }
    };

    fetchUser();
  }, [id]);

  // =========================
  // UPDATE USER
  // =========================
  const updateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      const code = form.code.trim();
      const email = form.email.trim();

      // 🔐 FRONT VALIDATION
      if (code.length < 3) {
        alert("Code trop court");
        return;
      }

      if (!email.includes("@")) {
        alert("Email invalide");
        return;
      }

      const payload: any = {
        code,
        email,
        role: form.role,
      };

      // password only if filled
      if (form.password.trim().length >= 6) {
        payload.password = form.password.trim();
      }

      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Update failed");
      }

      router.push("/users");

    } catch (err: any) {
      alert(err.message || "Erreur modification utilisateur");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOADING
  // =========================
  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="animate-pulse">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">

      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Modifier utilisateur</h1>

        <button
          onClick={() => router.push("/users")}
          className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-xl"
        >
          <ArrowLeft size={16} />
          Retour
        </button>
      </div>

      <form
        onSubmit={updateUser}
        className="max-w-xl bg-slate-900 p-6 rounded-2xl space-y-5"
      >

        {/* CODE */}
        <input
          value={form.code}
          onChange={(e) =>
            setForm({ ...form, code: e.target.value })
          }
          className="w-full bg-slate-800 p-3 rounded-xl"
          placeholder="Code utilisateur"
        />

        {/* EMAIL */}
        <input
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          className="w-full bg-slate-800 p-3 rounded-xl"
          placeholder="Email"
        />

        {/* PASSWORD */}
        <input
          type="password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          className="w-full bg-slate-800 p-3 rounded-xl"
          placeholder="Nouveau mot de passe (optionnel)"
        />

        {/* ROLE */}
        <select
          value={form.role}
          onChange={(e) =>
            setForm({ ...form, role: e.target.value as any })
          }
          className="w-full bg-slate-800 p-3 rounded-xl"
        >
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Manager</option>
          <option value="TECH">Technicien</option>
        </select>

        {/* BUTTON */}
        <button
          disabled={loading}
          className="w-full bg-blue-600 py-3 rounded-xl flex justify-center items-center gap-2"
        >
          <Save size={18} />
          {loading ? "Sauvegarde..." : "Enregistrer"}
        </button>

      </form>
    </div>
  );
}