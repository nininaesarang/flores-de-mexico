import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

import { SetGameMusicTrack } from "@/contexts/game-audio-context";
import { verifyResetToken, resetPassword } from "@/lib/api/auth.functions";

const searchSchema = z.object({
  email: z.string().catch(""),
  token: z.string().catch(""),
});

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Restablecer contraseña — Flores de México" },
      { name: "description", content: "Elige una nueva contraseña para Flores de México." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { email, token } = Route.useSearch();

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [verifyError, setVerifyError] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function checkToken() {
      if (!email || !token) {
        setTokenValid(false);
        setVerifyError("Enlace incompleto. Falta correo o token de recuperación.");
        setVerifying(false);
        return;
      }

      try {
        const res = await verifyResetToken({ data: { email, token } });
        if (res.valid) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setVerifyError(res.message || "Enlace de recuperación inválido o expirado.");
        }
      } catch (err) {
        console.error(err);
        setTokenValid(false);
        setVerifyError("Error al verificar el enlace de recuperación.");
      } finally {
        setVerifying(false);
      }
    }

    checkToken();
  }, [email, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await resetPassword({
        data: {
          email,
          token,
          password,
        },
      });
      localStorage.setItem("authUser", JSON.stringify(response.user));
      localStorage.setItem("username", response.user.username);
      sessionStorage.removeItem("authUser");
      sessionStorage.removeItem("username");
      setSuccess(true);
      toast.success("Contraseña restablecida exitosamente.");
      navigate({ to: "/jugar" });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Ocurrió un error al restablecer la contraseña.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SetGameMusicTrack track="menu" />
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f7f1ea] px-6 py-10">
        <img
          src="/logo-flores.png"
          alt="Flores de México"
          className="mb-8 w-56 max-w-[70%] animate-float drop-shadow-xl"
        />

        <div className="w-full max-w-md rounded-2xl border-2 border-dashed border-pink-300 bg-white p-6 shadow-sm">
          {verifying ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-pink-600" />
              <p className="mt-4 text-sm text-gray-600">Verificando enlace de recuperación...</p>
            </div>
          ) : !tokenValid ? (
            <div className="text-center py-4">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-pink-600 animate-pulse" />
              <h2 className="mb-2 text-lg font-bold text-pink-700">Enlace no válido</h2>
              <p className="mb-6 text-sm text-gray-600">{verifyError}</p>
              <Link
                to="/forgot-password"
                className="inline-block w-full rounded-full bg-pink-700 py-3 font-bold tracking-wider text-white shadow transition hover:bg-pink-800 text-center"
              >
                SOLICITAR NUEVO CORREO
              </Link>
            </div>
          ) : success ? (
            <div className="text-center py-4">
              <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-teal-600 animate-bounce" />
              <h2 className="mb-2 text-lg font-bold text-teal-700">¡Contraseña restablecida!</h2>
              <p className="mb-6 text-sm text-gray-600">
                Tu contraseña ha sido actualizada con éxito. Ya puedes iniciar sesión con tus nuevas credenciales.
              </p>
              <Link
                to="/login"
                className="inline-block w-full rounded-full bg-pink-700 py-3 font-bold tracking-wider text-white shadow transition hover:bg-pink-800 text-center"
              >
                INICIAR SESIÓN
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="mb-2 text-center text-lg font-bold text-pink-700">
                Restablecer contraseña
              </h2>
              <p className="mb-6 text-center text-xs text-gray-500">
                Para la cuenta: <strong className="text-gray-700">{email}</strong>
              </p>

              <label className="mb-1 block text-xs font-bold tracking-wider text-gray-700">
                NUEVA CONTRASEÑA
              </label>
              <div className="mb-4 flex items-center gap-2 rounded-xl border-2 border-teal-400 px-3 py-2">
                <KeyRound className="h-5 w-5 text-pink-600" />
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  required
                  disabled={submitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>

              <label className="mb-1 block text-xs font-bold tracking-wider text-gray-700">
                CONFIRMAR CONTRASEÑA
              </label>
              <div className="mb-6 flex items-center gap-2 rounded-xl border-2 border-teal-400 px-3 py-2">
                <KeyRound className="h-5 w-5 text-pink-600" />
                <input
                  type="password"
                  placeholder="Repite tu contraseña"
                  required
                  disabled={submitting}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-pink-700 py-3 font-bold tracking-wider text-white shadow transition hover:bg-pink-800 disabled:opacity-50"
              >
                {submitting ? "ACTUALIZANDO..." : "CAMBIAR CONTRASEÑA"}
              </button>
            </form>
          )}

          <div className="mt-6 border-t border-gray-150 pt-4 text-center">
            <Link to="/login" className="text-xs text-gray-500 hover:underline">
              ← Volver al login
            </Link>
          </div>
        </div>

        <p className="mt-8 text-[10px] tracking-widest text-gray-400">
          © 2026 NINI TECHNOLOGIES
        </p>
      </div>
    </>
  );
}
