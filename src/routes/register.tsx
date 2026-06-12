import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Flower, KeyRound, Mail } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Registrarse — Flores de México" },
      { name: "description", content: "Regístrate en Flores de México." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f7f1ea] px-6 py-10">
      <img
        src="/logo-flores.png"
        alt="Flores de México"
        className="mb-8 w-56 max-w-[70%] animate-float drop-shadow-xl"
      />

      <form
        onSubmit={(e) => e.preventDefault()}
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
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            placeholder="••••••••"
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
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-pink-700 py-3 font-bold tracking-wider text-white shadow transition hover:bg-pink-800"
        >
          REGISTRARSE
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
        ← Volver al login
      </Link>

      <p className="mt-8 text-[10px] tracking-widest text-gray-400">
        © 2026 NINI TECHNOLOGIES
      </p>
    </div>
  );
}
