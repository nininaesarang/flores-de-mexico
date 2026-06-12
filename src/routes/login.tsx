import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Flower, KeyRound } from "lucide-react";
import logo from "@/assets/flores-logo.png.asset.json";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión — Flores de México" },
      { name: "description", content: "Inicia sesión en Flores de México." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [remember, setRemember] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f7f1ea] px-6 py-10">
      <img
        src={logo.url}
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
          <a href="#" className="font-semibold text-teal-600 hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-pink-700 py-3 font-bold tracking-wider text-white shadow transition hover:bg-pink-800"
        >
          INICIAR SESIÓN
        </button>

        <p className="mt-5 text-center text-sm text-gray-700">
          ¿Aún no tienes cuenta?
        </p>
        <p className="text-center">
          <a href="#" className="font-extrabold tracking-wider text-pink-700">
            REGISTRARSE
          </a>
        </p>
      </form>

      <Link to="/" className="mt-6 text-xs text-gray-500 hover:underline">
        ← Volver
      </Link>

      <p className="mt-8 text-[10px] tracking-widest text-gray-400">
        © 2026 NINI TECHNOLOGIES
      </p>
    </div>
  );
}
