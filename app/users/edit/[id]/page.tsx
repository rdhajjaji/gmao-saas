"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

/**
 * ============================================================================
 * TYPES
 * ============================================================================
 */

type UserForm = {
  code: string;
  email: string;
  password: string;
  role: "ADMIN" | "MANAGER" | "TECH";
};

type FieldErrors = Partial<Record<keyof UserForm, string>>;

const ROLES_OPTIONS = [
  { value: "TECH", label: "Technicien" },
  { value: "MANAGER", label: "Manager" },
  { value: "ADMIN", label: "Administrateur" },
];

/**
 * ============================================================================
 * COMPOSANT : EditUserPage
 * ============================================================================
 */

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  // States
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof UserForm, boolean>>>({});

  const [form, setForm] = useState<UserForm>({
    code: "",
    email: "",
    password: "",
    role: "TECH",
  });

  // ========================================================================
  // LOAD USER DATA
  // ========================================================================

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        setFetching(true);

        const res = await fetch(`/api/users/${id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Utilisateur introuvable");
        }

        setForm({
          code: data.code ?? "",
          email: data.email ?? "",
          password: "",
          role: data.role ?? "TECH",
        });
      } catch (err) {
        console.error("Erreur chargement utilisateur:", err);
        setError("Utilisateur introuvable. Redirection...");
        
        // Rediriger après 2s
        setTimeout(() => {
          router.push("/users");
        }, 2000);
      } finally {
        setFetching(false);
      }
    };

    fetchUser();
  }, [id, router]);

  // ========================================================================
  // VALIDATION
  // ========================================================================

  const validateField = (field: keyof UserForm, value: string): string | null => {
    const trimmedValue = value.trim();

    switch (field) {
      case "code":
        if (!trimmedValue) return "Le code utilisateur est obligatoire";
        if (trimmedValue.length < 2) return "Minimum 2 caractères";
        if (trimmedValue.length > 20) return "Maximum 20 caractères";
        if (!/^[A-Z0-9\-]+$/i.test(trimmedValue)) return "Caractères invalides";
        return null;

      case "email":
        if (!trimmedValue) return "L'email est obligatoire";
        if (trimmedValue.length < 5) return "Email trop court";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) return "Email invalide";
        return null;

      case "password":
        // Password optionnel (à moins que non vide)
        if (trimmedValue && trimmedValue.length < 6) {
          return "Minimum 6 caractères";
        }
        if (trimmedValue && trimmedValue.length > 128) {
          return "Maximum 128 caractères";
        }
        return null;

      case "role":
        if (!trimmedValue) return "Le rôle est obligatoire";
        return null;

      default:
        return null;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {};

    (Object.keys(form) as Array<keyof UserForm>).forEach((field) => {
      const error = validateField(field, form[field]);
      if (error) newErrors[field] = error;
    });

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========================================================================
  // INPUT HANDLERS
  // ========================================================================

  const handleInputChange = (field: keyof UserForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);

    // Valider en temps réel si champ touché
    if (touched[field]) {
      const fieldError = validateField(field, value);
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        if (fieldError) {
          newErrors[field] = fieldError;
        } else {
          delete newErrors[field];
        }
        return newErrors;
      });
    }
  };

  const handleFieldBlur = (field: keyof UserForm) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const fieldError = validateField(field, form[field]);
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      if (fieldError) {
        newErrors[field] = fieldError;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
  };

  // ========================================================================
  // UPDATE USER
  // ========================================================================

  const updateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Marquer tous les champs comme touchés
    const allFields = Object.keys(form) as Array<keyof UserForm>;
    setTouched(allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));

    // Valider
    if (!validateForm()) {
      setError("Veuillez corriger les erreurs ci-dessus");
      return;
    }

    setLoading(true);

    try {
      // Construire le payload
      const payload: Partial<UserForm> = {
        code: form.code.trim(),
        email: form.email.trim(),
        role: form.role,
      };

      // Ajouter password seulement s'il est rempli
      if (form.password.trim().length > 0) {
        payload.password = form.password;
      }

      // Envoyer la requête
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Parser la réponse
      let data;
      try {
        data = await res.json();
      } catch {
        data = { error: "Réponse serveur invalide" };
      }

      // Gérer les erreurs
      if (!res.ok) {
        if (res.status === 409) {
          setError("Ce code ou email existe déjà");
        } else if (res.status === 400) {
          setError(data?.error || "Données invalides");
        } else if (res.status === 401 || res.status === 403) {
          setError("Vous n'avez pas la permission de modifier cet utilisateur");
        } else if (res.status >= 500) {
          setError("Erreur serveur. Réessayez plus tard");
        } else {
          setError(data?.error || "Erreur lors de la modification");
        }
        return;
      }

      // Succès
      setSuccess(true);
      
      // Redirection après 1.5s
      setTimeout(() => {
        router.push("/users");
        router.refresh();
      }, 1500);

    } catch (err: unknown) {
      console.error("Erreur réseau:", err);
      const isNetworkError = err instanceof TypeError;
      setError(
        isNetworkError
          ? "Connexion perdue. Vérifiez votre internet."
          : "Erreur serveur. Réessayez dans quelques secondes."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // LOADING STATE
  // ========================================================================

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-500" size={36} />
          <p className="text-slate-400">Chargement de l'utilisateur...</p>
        </div>
      </div>
    );
  }

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-lg">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">Modifier utilisateur</h1>
            <p className="text-slate-400 text-xs mt-1">Mise à jour des informations</p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/users")}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded text-xs font-medium transition-colors"
            aria-label="Retourner à la liste des utilisateurs"
          >
            <ArrowLeft size={14} aria-hidden="true" /> Retour
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={updateUser} className="bg-slate-900 p-4 rounded-lg space-y-3" noValidate>
          
          {/* SUCCESS MESSAGE */}
          {success && (
            <div 
              className="bg-green-500/10 border border-green-500 text-green-400 p-2 rounded text-xs flex items-center gap-2"
              role="status"
              aria-live="polite"
            >
              <CheckCircle size={14} className="flex-shrink-0" aria-hidden="true" />
              <span>Utilisateur modifié avec succès!</span>
            </div>
          )}

          {/* ERROR MESSAGE */}
          {error && (
            <div 
              className="bg-red-500/10 border border-red-500 text-red-400 p-2 rounded text-xs flex items-start gap-2"
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {/* CODE FIELD */}
          <div className="space-y-1">
            <label htmlFor="code" className="text-xs font-semibold text-slate-400">
              Code utilisateur
            </label>
            <input
              id="code"
              type="text"
              value={form.code}
              onChange={(e) => handleInputChange("code", e.target.value)}
              onBlur={() => handleFieldBlur("code")}
              disabled={loading}
              maxLength={20}
              className={`w-full bg-slate-800 border transition-colors outline-none p-2 rounded text-white text-sm ${
                touched.code && fieldErrors.code
                  ? "border-red-500 focus:border-red-400 bg-red-500/5"
                  : "border-slate-700 focus:border-blue-500"
              } disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-required="true"
              aria-invalid={!!fieldErrors.code}
              aria-describedby={fieldErrors.code ? "code-error" : undefined}
            />
            {touched.code && fieldErrors.code && (
              <div id="code-error" className="flex items-center gap-1 text-red-400 text-xs" role="alert">
                <AlertCircle size={12} aria-hidden="true" />
                {fieldErrors.code}
              </div>
            )}
          </div>

          {/* EMAIL FIELD */}
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-semibold text-slate-400">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              onBlur={() => handleFieldBlur("email")}
              disabled={loading}
              maxLength={255}
              className={`w-full bg-slate-800 border transition-colors outline-none p-2 rounded text-white text-sm ${
                touched.email && fieldErrors.email
                  ? "border-red-500 focus:border-red-400 bg-red-500/5"
                  : "border-slate-700 focus:border-blue-500"
              } disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-required="true"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
            />
            {touched.email && fieldErrors.email && (
              <div id="email-error" className="flex items-center gap-1 text-red-400 text-xs" role="alert">
                <AlertCircle size={12} aria-hidden="true" />
                {fieldErrors.email}
              </div>
            )}
          </div>

          {/* PASSWORD FIELD */}
          <div className="space-y-1">
            <label htmlFor="password" className="text-xs font-semibold text-slate-400">
              Nouveau mot de passe <span className="text-slate-500 font-normal">(optionnel)</span>
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              onBlur={() => handleFieldBlur("password")}
              disabled={loading}
              maxLength={128}
              placeholder="Laisser vide si inchangé"
              className={`w-full bg-slate-800 border transition-colors outline-none p-2 rounded text-white text-sm ${
                touched.password && fieldErrors.password
                  ? "border-red-500 focus:border-red-400 bg-red-500/5"
                  : "border-slate-700 focus:border-blue-500"
              } disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed`}
              autoComplete="new-password"
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
            />
            {touched.password && fieldErrors.password && (
              <div id="password-error" className="flex items-center gap-1 text-red-400 text-xs" role="alert">
                <AlertCircle size={12} aria-hidden="true" />
                {fieldErrors.password}
              </div>
            )}
          </div>

          {/* ROLE FIELD */}
          <div className="space-y-1">
            <label htmlFor="role" className="text-xs font-semibold text-slate-400">
              Rôle
            </label>
            <select
              id="role"
              value={form.role}
              onChange={(e) => handleInputChange("role", e.target.value as UserForm["role"])}
              onBlur={() => handleFieldBlur("role")}
              disabled={loading}
              className={`w-full bg-slate-800 border transition-colors outline-none p-2 rounded text-white text-sm ${
                touched.role && fieldErrors.role
                  ? "border-red-500 focus:border-red-400 bg-red-500/5"
                  : "border-slate-700 focus:border-blue-500"
              } disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-required="true"
              aria-invalid={!!fieldErrors.role}
              aria-describedby={fieldErrors.role ? "role-error" : undefined}
            >
              {ROLES_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {touched.role && fieldErrors.role && (
              <div id="role-error" className="flex items-center gap-1 text-red-400 text-xs" role="alert">
                <AlertCircle size={12} aria-hidden="true" />
                {fieldErrors.role}
              </div>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 text-white font-semibold py-2 rounded text-sm transition-all mt-4"
            aria-busy={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} aria-hidden="true" />
                <span>Enregistrement...</span>
              </>
            ) : success ? (
              <>
                <CheckCircle size={16} aria-hidden="true" />
                <span>Modifié !</span>
              </>
            ) : (
              <>
                <Save size={16} aria-hidden="true" />
                <span>Enregistrer</span>
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
