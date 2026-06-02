"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, Loader2, AlertCircle, CheckCircle } from "lucide-react";

/**
 * ============================================================================
 * TYPES & CONSTANTES
 * ============================================================================
 * Définition centralisée des règles de validation et options
 */

type UserFormState = {
  code: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "" | "TECH" | "MANAGER" | "ADMIN";
};

type FieldErrors = Partial<Record<keyof UserFormState, string>>;

const VALIDATION_RULES = {
  code: {
    minLength: 2,
    maxLength: 20,
    pattern: /^[A-Z0-9\-]+$/i,
    messages: {
      required: "Le code utilisateur est obligatoire",
      minLength: "Le code doit contenir au moins 2 caractères",
      maxLength: "Le code ne doit pas dépasser 20 caractères",
      pattern: "Le code ne peut contenir que des lettres, chiffres et tirets",
    },
  },
  email: {
    minLength: 5,
    maxLength: 255,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    messages: {
      required: "L'email est obligatoire",
      minLength: "L'email doit contenir au moins 5 caractères",
      maxLength: "L'email ne doit pas dépasser 255 caractères",
      pattern: "Format d'email invalide",
    },
  },
  password: {
    minLength: 6,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
    messages: {
      required: "Le mot de passe est obligatoire",
      minLength: "Le mot de passe doit contenir au moins 6 caractères",
      maxLength: "Le mot de passe ne doit pas dépasser 128 caractères",
      pattern: "1 majuscule + 1 minuscule + 1 chiffre minimum",
    },
  },
  confirmPassword: {
    messages: {
      required: "La confirmation du mot de passe est obligatoire",
      match: "Les mots de passe ne correspondent pas",
    },
  },
};

const ROLES_OPTIONS = [
  { value: "TECH", label: "Technicien" },
  { value: "MANAGER", label: "Manager" },
  { value: "ADMIN", label: "Administrateur" },
];

/**
 * ============================================================================
 * COMPOSANT : InputField
 * ============================================================================
 * Champ input réutilisable avec validation, erreurs et accessibilité
 */

interface InputFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  maxLength?: number;
  autoComplete?: string;
  autoFocus?: boolean;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  disabled,
  maxLength,
  autoComplete,
  autoFocus,
  required,
}) => {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs font-semibold text-slate-400">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`w-full bg-slate-800 border transition-colors outline-none p-2 rounded text-white text-sm placeholder-slate-500 ${
          error
            ? "border-red-500 focus:border-red-400 bg-red-500/5"
            : "border-slate-700 focus:border-blue-500"
        } disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed`}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        required={required}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <div 
          id={`${id}-error`} 
          className="flex items-center gap-1 text-red-400 text-xs" 
          role="alert"
        >
          <AlertCircle size={12} aria-hidden="true" />
          {error}
        </div>
      )}
    </div>
  );
};

/**
 * ============================================================================
 * COMPOSANT : SelectField
 * ============================================================================
 * Sélecteur réutilisable avec validation et accessibilité
 */

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  error,
  disabled,
  required,
}) => {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs font-semibold text-slate-400">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-slate-800 border transition-colors outline-none p-2 rounded text-white text-sm ${
          error
            ? "border-red-500 focus:border-red-400 bg-red-500/5"
            : "border-slate-700 focus:border-blue-500"
        } disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed`}
        disabled={disabled}
        required={required}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        <option value="">-- Sélectionner --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <div 
          id={`${id}-error`} 
          className="flex items-center gap-1 text-red-400 text-xs" 
          role="alert"
        >
          <AlertCircle size={12} aria-hidden="true" />
          {error}
        </div>
      )}
    </div>
  );
};

/**
 * ============================================================================
 * COMPOSANT PRINCIPAL : NewUserPage
 * ============================================================================
 * Formulaire de création d'utilisateur avec validation complète
 */

export default function NewUserPage() {
  // Router & Refs
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  // States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [touched, setTouched] = useState<
    Partial<Record<keyof UserFormState, boolean>>
  >({});

  const [form, setForm] = useState<UserFormState>({
    code: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  // ========================================================================
  // VALIDATION FUNCTIONS
  // ========================================================================

  /**
   * Valide un champ individuel selon ses règles
   */
  const validateField = useCallback(
    (field: keyof UserFormState, value: string): string | null => {
      const trimmedValue = value.trim();

      switch (field) {
        case "code":
          if (!trimmedValue) return VALIDATION_RULES.code.messages.required;
          if (trimmedValue.length < VALIDATION_RULES.code.minLength)
            return VALIDATION_RULES.code.messages.minLength;
          if (trimmedValue.length > VALIDATION_RULES.code.maxLength)
            return VALIDATION_RULES.code.messages.maxLength;
          if (!VALIDATION_RULES.code.pattern.test(trimmedValue))
            return VALIDATION_RULES.code.messages.pattern;
          return null;

        case "email":
          if (!trimmedValue) return VALIDATION_RULES.email.messages.required;
          if (trimmedValue.length < VALIDATION_RULES.email.minLength)
            return VALIDATION_RULES.email.messages.minLength;
          if (trimmedValue.length > VALIDATION_RULES.email.maxLength)
            return VALIDATION_RULES.email.messages.maxLength;
          if (!VALIDATION_RULES.email.pattern.test(trimmedValue))
            return VALIDATION_RULES.email.messages.pattern;
          return null;

        case "password":
          if (!trimmedValue) return VALIDATION_RULES.password.messages.required;
          if (trimmedValue.length < VALIDATION_RULES.password.minLength)
            return VALIDATION_RULES.password.messages.minLength;
          if (trimmedValue.length > VALIDATION_RULES.password.maxLength)
            return VALIDATION_RULES.password.messages.maxLength;
          if (!VALIDATION_RULES.password.pattern.test(trimmedValue))
            return VALIDATION_RULES.password.messages.pattern;
          return null;

        case "confirmPassword":
          if (!trimmedValue)
            return VALIDATION_RULES.confirmPassword.messages.required;
          if (trimmedValue !== form.password)
            return VALIDATION_RULES.confirmPassword.messages.match;
          return null;

        case "role":
          if (!trimmedValue) return "Le rôle est obligatoire";
          return null;

        default:
          return null;
      }
    },
    [form.password]
  );

  /**
   * Valide tous les champs du formulaire
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: FieldErrors = {};

    (Object.keys(form) as Array<keyof UserFormState>).forEach((field) => {
      const error = validateField(field, form[field]);
      if (error) newErrors[field] = error;
    });

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, validateField]);

  // ========================================================================
  // INPUT HANDLERS
  // ========================================================================

  /**
   * Gère le changement de valeur d'un champ
   */
  const handleInputChange = (field: keyof UserFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setGeneralError(null);

    // Valider en temps réel si le champ a été touché
    if (touched[field]) {
      const error = validateField(field, value);
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[field] = error;
        } else {
          delete newErrors[field];
        }
        return newErrors;
      });
    }
  };

  /**
   * Gère la perte de focus d'un champ
   */
  const handleFieldBlur = (field: keyof UserFormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, form[field]);
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
  };

  // ========================================================================
  // FORM SUBMISSION
  // ========================================================================

  /**
   * Gère la soumission du formulaire
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError(null);
    setSuccess(false);

    // Marquer tous les champs comme touchés
    const allFields = Object.keys(form) as Array<keyof UserFormState>;
    setTouched(
      allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
    );

    // Valider le formulaire
    if (!validateForm()) {
      setGeneralError("Veuillez corriger les erreurs ci-dessus");
      // Focus sur le premier champ en erreur
      const firstErrorField = Object.keys(fieldErrors)[0] as keyof UserFormState;
      document.getElementById(firstErrorField)?.focus();
      return;
    }

    setLoading(true);

    try {
      // Préparer les données
      const dataToSend = {
        code: form.code.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      };

      // Envoyer la requête
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
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
          setGeneralError("Ce code ou email existe déjà");
        } else if (res.status === 400) {
          setGeneralError(data?.error || "Données invalides");
        } else if (res.status === 401 || res.status === 403) {
          setGeneralError("Vous n'avez pas la permission");
        } else if (res.status >= 500) {
          setGeneralError("Erreur serveur. Réessayez plus tard");
        } else {
          setGeneralError(data?.error || "Erreur lors de la création");
        }
        return;
      }

      // Succès
      setSuccess(true);
      setForm({
        code: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
      });

      // Redirection après 1s
      setTimeout(() => {
        router.push("/users");
        router.refresh();
      }, 1000);

    } catch (err: unknown) {
      console.error("Erreur réseau:", err);
      // Meilleur message d'erreur
      const isNetworkError = err instanceof TypeError;
      setGeneralError(
        isNetworkError
          ? "Connexion perdue. Vérifiez votre internet."
          : "Erreur serveur. Réessayez dans quelques secondes."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-lg">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Créer un utilisateur</h1>
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
        <form 
          ref={formRef} 
          onSubmit={handleSubmit} 
          className="bg-slate-900 p-4 rounded-lg space-y-3"
          noValidate
        >
          
          {/* SUCCESS MESSAGE */}
          {success && (
            <div 
              className="bg-green-500/10 border border-green-500 text-green-400 p-2 rounded text-xs flex items-center gap-2" 
              role="status"
              aria-live="polite"
            >
              <CheckCircle size={14} className="flex-shrink-0" aria-hidden="true" />
              <span>Utilisateur créé ! Redirection...</span>
            </div>
          )}

          {/* GENERAL ERROR MESSAGE */}
          {generalError && (
            <div 
              className="bg-red-500/10 border border-red-500 text-red-400 p-2 rounded text-xs flex items-start gap-2" 
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle 
                size={14} 
                className="mt-0.5 flex-shrink-0" 
                aria-hidden="true" 
              />
              <span>{generalError}</span>
            </div>
          )}

          {/* CODE FIELD */}
          <InputField
            id="code"
            label="Code utilisateur"
            value={form.code}
            onChange={(value) => handleInputChange("code", value)}
            onBlur={() => handleFieldBlur("code")}
            placeholder="Ex: T-001"
            error={touched.code ? fieldErrors.code : undefined}
            disabled={loading}
            maxLength={20}
            autoComplete="off"
            autoFocus={true}
            required={true}
          />

          {/* EMAIL FIELD */}
          <InputField
            id="email"
            label="Adresse email"
            type="email"
            value={form.email}
            onChange={(value) => handleInputChange("email", value)}
            onBlur={() => handleFieldBlur("email")}
            placeholder="user@example.com"
            error={touched.email ? fieldErrors.email : undefined}
            disabled={loading}
            maxLength={255}
            autoComplete="email"
            required={true}
          />

          {/* PASSWORD FIELD */}
          <InputField
            id="password"
            label="Mot de passe"
            type="password"
            value={form.password}
            onChange={(value) => handleInputChange("password", value)}
            onBlur={() => handleFieldBlur("password")}
            placeholder="Min 6 caractères"
            error={touched.password ? fieldErrors.password : undefined}
            disabled={loading}
            maxLength={128}
            autoComplete="new-password"
            required={true}
          />

          {/* CONFIRM PASSWORD FIELD */}
          <InputField
            id="confirmPassword"
            label="Confirmer mot de passe"
            type="password"
            value={form.confirmPassword}
            onChange={(value) => handleInputChange("confirmPassword", value)}
            onBlur={() => handleFieldBlur("confirmPassword")}
            placeholder="Répéter le mot de passe"
            error={touched.confirmPassword ? fieldErrors.confirmPassword : undefined}
            disabled={loading}
            required={true}
          />

          {/* ROLE FIELD */}
          <SelectField
            id="role"
            label="Rôle"
            value={form.role}
            onChange={(value) => handleInputChange("role", value as UserFormState["role"])}
            options={ROLES_OPTIONS}
            error={touched.role ? fieldErrors.role : undefined}
            disabled={loading}
            required={true}
          />

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 text-white font-semibold py-2 rounded text-sm flex justify-center items-center gap-2 transition-all mt-4"
            aria-busy={loading}
          >
            {loading ? (
              <>
                <Loader2 
                  className="animate-spin" 
                  size={16} 
                  aria-hidden="true" 
                />
                <span>Création...</span>
              </>
            ) : success ? (
              <>
                <CheckCircle size={16} aria-hidden="true" />
                <span>Créé !</span>
              </>
            ) : (
              <>
                <UserPlus size={16} aria-hidden="true" />
                <span>Créer</span>
              </>
            )}
          </button>

          {/* FOOTER */}
          <p className="text-xs text-slate-500 text-center">
            Les champs marqués d'un <span className="text-red-500">*</span> sont obligatoires
          </p>

        </form>
      </div>
    </div>
  );
}
