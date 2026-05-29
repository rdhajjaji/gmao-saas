"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  // 🔐 si déjà connecté → dashboard
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      router.replace("/dashboard");
    } else {
      setChecked(true);
    }
  }, []);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // 💾 save token
      localStorage.setItem("token", data.token);

      router.push("/dashboard");
    } catch (err) {
      setError("Server error");
    }

    setLoading(false);
  };

  if (!checked) return null;

  return (
    <div className="flex items-center justify-center h-screen bg-slate-950 text-white">
      <div className="bg-slate-900 p-8 rounded-2xl w-96 shadow-xl">

        <h1 className="text-xl font-bold mb-4">
          Connexion GMAO
        </h1>

        <input
          className="w-full p-2 mb-3 bg-slate-800 rounded"
          placeholder="Code utilisateur"
          onChange={(e) => setCode(e.target.value)}
        />

        <input
          className="w-full p-2 mb-3 bg-slate-800 rounded"
          type="password"
          placeholder="Mot de passe"
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-red-500 text-sm mb-2">
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 py-2 rounded-xl hover:bg-blue-700"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </div>
    </div>
  );
}