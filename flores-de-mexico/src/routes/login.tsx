import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound, Mail } from "lucide-react";
import { toast } from "sonner";

import { SetGameMusicTrack } from "@/contexts/game-audio-context";
import { loginUser } from "@/lib/api/auth.functions";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión - Flores de México" },
      { name: "description", content: "Inicia sesión en Flores de México." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRemember(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Ingresa tu correo y contraseña.");
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser({ data: { email, password } });
      const authUser = JSON.stringify(response.user);
      localStorage.removeItem("authUser");
      sessionStorage.removeItem("authUser");

      if (remember) {
        localStorage.setItem("authUser", authUser);
        localStorage.setItem("username", response.user.username);
        localStorage.setItem("rememberEmail", response.user.email);
      } else {
        sessionStorage.setItem("authUser", authUser);
        sessionStorage.setItem("username", response.user.username);
        localStorage.removeItem("rememberEmail");
        localStorage.removeItem("username");
      }

      toast.success("Sesión iniciada.");
      navigate({ to: "/jugar" });
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Correo o contraseña incorrectos.");
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

          <div className="mb-6 flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 accent-teal-500"
              />
              Recordarme
            </label>
            <Link to="/forgot-password" className="font-semibold text-teal-600 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-pink-700 py-3 font-bold tracking-wider text-white shadow transition hover:bg-pink-800 disabled:opacity-50"
          >
            {loading ? "INICIANDO..." : "INICIAR SESIÓN"}
          </button>

          <p className="mt-5 text-center text-sm text-gray-700">
            ¿Aún no tienes cuenta?
          </p>
          <p className="text-center">
            <Link to="/register" className="font-extrabold tracking-wider text-pink-700 hover:underline">
              REGISTRARSE
            </Link>
          </p>
        </form>

        <Link to="/" className="mt-6 text-xs text-gray-500 hover:underline">
          Volver
        </Link>

        <p className="mt-8 text-[10px] tracking-widest text-gray-400">
          © 2026 NINI TECHNOLOGIES
        </p>
      </div>
    </>
  );
}
