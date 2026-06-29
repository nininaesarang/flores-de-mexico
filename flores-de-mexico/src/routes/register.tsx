import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Flower, KeyRound, Mail } from "lucide-react";
import { toast } from "sonner";

import { SetGameMusicTrack } from "@/contexts/game-audio-context";
import { registerUser } from "@/lib/api/auth.functions";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Registrarse - Flores de México" },
      { name: "description", content: "Regístrate en Flores de México." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanUsername = username.replace(/@/g, "").trim();
    if (!cleanUsername || !email.trim() || !password) {
      toast.error("Completa usuario, correo y contraseña.");
      return;
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const response = await registerUser({
        data: {
          username: cleanUsername,
          email,
          password,
        },
      });

      localStorage.setItem("authUser", JSON.stringify(response.user));
      localStorage.setItem("username", response.user.username);
      sessionStorage.removeItem("authUser");
      sessionStorage.removeItem("username");
      toast.success("Cuenta registrada. ¡Bienvenido!");
      navigate({ to: "/jugar" });
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "No se pudo registrar la cuenta.");
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

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-2xl border-2 border-dashed border-pink-300 bg-white p-6 shadow-sm"
        >
          <label className="mb-1 block text-xs font-bold tracking-wider text-gray-700">
            USUARIO
          </label>
          <div className="mb-4 flex items-center gap-2 rounded-xl border-2 border-teal-400 px-3 py-2">
            <Flower className="h-5 w-5 text-pink-600" />
            <input
              type="text"
              placeholder="Tu nombre de explorador"
              required
              disabled={loading}
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/@/g, ""))}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <label className="mb-1 block text-xs font-bold tracking-wider text-gray-700">
            CORREO ELECTRÓNICO
          </label>
          <div className="mb-4 flex items-center gap-2 rounded-xl border-2 border-teal-400 px-3 py-2">
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

          <label className="mb-1 block text-xs font-bold tracking-wider text-gray-700">
            CONTRASEÑA
          </label>
          <div className="mb-4 flex items-center gap-2 rounded-xl border-2 border-teal-400 px-3 py-2">
            <KeyRound className="h-5 w-5 text-pink-600" />
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              required
              disabled={loading}
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
              disabled={loading}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-pink-700 py-3 font-bold tracking-wider text-white shadow transition hover:bg-pink-800 disabled:opacity-50"
          >
            {loading ? "REGISTRANDO..." : "REGISTRARSE"}
          </button>

          <p className="mt-5 text-center text-sm text-gray-700">
            ¿Ya tienes cuenta?
          </p>
          <p className="text-center">
            <Link to="/login" className="font-extrabold tracking-wider text-pink-700 hover:underline">
              INICIAR SESIÓN
            </Link>
          </p>
        </form>

        <Link to="/login" className="mt-6 text-xs text-gray-500 hover:underline">
          Volver al login
        </Link>

        <p className="mt-8 text-[10px] tracking-widest text-gray-400">
          © 2026 NINI TECHNOLOGIES
        </p>
      </div>
    </>
  );
}
