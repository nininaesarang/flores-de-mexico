import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Play, Settings, Info } from "lucide-react";
import homeBg from "@/assets/home-bg.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Flores de México" },
      { name: "description", content: "Celebrando la flora mexicana." },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-end bg-cover bg-center pb-16"
      style={{ backgroundImage: `url(${homeBg.url})` }}
    >
      <button
        onClick={() => navigate({ to: "/login" })}
        className="flex items-center gap-3 rounded-2xl bg-pink-600 px-16 py-4 text-xl font-semibold text-white shadow-lg transition hover:bg-pink-700 active:scale-95"
      >
        Viajar <Play className="h-5 w-5 fill-white" />
      </button>

      <div className="mt-6 flex gap-4">
        <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-pink-600 shadow">
          <Settings className="h-5 w-5" />
        </button>
        <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-pink-600 shadow">
          <Info className="h-5 w-5" />
        </button>
      </div>

      <p className="mt-6 text-sm font-bold tracking-widest text-white drop-shadow">
        CELEBRANDO LA FLORA MEXICANA
      </p>
    </div>
  );
}
