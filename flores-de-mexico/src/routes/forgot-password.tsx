import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";

import { SetGameMusicTrack } from "@/contexts/game-audio-context";
import { sendPasswordResetEmail } from "@/lib/api/auth.functions";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Recuperar contraseña — Flores de México" },
      { name: "description", content: "Recupera tu contraseña de Flores de México." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await sendPasswordResetEmail({ data: { email } });
      setSubmitted(true);
      toast.success("Enlace de recuperación enviado.");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Ocurrió un error al enviar el correo. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
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
        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <h2 className="mb-4 text-center text-lg font-bold text-pink-700">
              ¿Olvidaste tu contraseña?
            </h2>
            <p className="mb-6 text-center text-sm text-gray-600">
              Introduce tu correo electrónico para enviarte las instrucciones de recuperación.
            </p>

            <label className="mb-1 block text-xs font-bold tracking-wider text-gray-700">
              CORREO ELECTRÓNICO
            </label>
            <div className="mb-6 flex items-center gap-2 rounded-xl border-2 border-teal-400 px-3 py-2">
              <Mail className="h-5 w-5 text-pink-600" />
              <input
                type="email"
                placeholder="tu@correo.com"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-pink-700 py-3 font-bold tracking-wider text-white shadow transition hover:bg-pink-800 disabled:opacity-50"
            >
              {loading ? "ENVIANDO CORREO..." : "ENVIAR CORREO"}
            </button>
          </form>
        ) : (
          <div className="text-center py-4">
            <Mail className="mx-auto mb-4 h-12 w-12 animate-bounce text-pink-600" />
            <h2 className="mb-2 text-lg font-bold text-teal-700">¡Correo enviado!</h2>
            <p className="mb-6 text-sm text-gray-600">
              Hemos enviado un enlace de recuperación a <strong className="text-gray-800">{email}</strong>. Por favor, revisa tu bandeja de entrada.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="rounded-full border-2 border-teal-500 px-6 py-2 text-sm font-bold text-teal-600 hover:bg-teal-50"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        <div className="mt-6 border-t border-gray-150 pt-4">
          <p className="text-center text-sm text-gray-700">
            ¿Recordaste tu contraseña?
          </p>
          <p className="text-center mt-1">
            <Link to="/login" className="font-extrabold tracking-wider text-pink-700 hover:underline">
              INICIAR SESIÓN
            </Link>
          </p>
        </div>
      </div>

      <Link to="/login" className="mt-6 text-xs text-gray-500 hover:underline">
        ← Volver al login
      </Link>

      <p className="mt-8 text-[10px] tracking-widest text-gray-400">
        © 2026 NINI TECHNOLOGIES
      </p>
    </div>
    </>
  );
}
