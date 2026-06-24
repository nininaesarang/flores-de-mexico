import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Play, Settings, Info, Sun, Volume2, Bell, LogIn } from "lucide-react";

import { SetGameMusicTrack, useGameAudio } from "@/contexts/game-audio-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
  const { volume, setVolume } = useGameAudio();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [brightness, setBrightness] = useState([80]);
  const [volumeSlider, setVolumeSlider] = useState([Math.round(volume * 100)]);
  const [notifications, setNotifications] = useState(true);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  return (
    <>
      <SetGameMusicTrack track="menu" />
    <div
      className="relative flex min-h-screen flex-col items-center justify-between bg-cover bg-center px-6 py-10"
      style={{
        backgroundImage: `url(/bg-index.jpg)`,
        filter: `brightness(${0.4 + (brightness[0] / 100) * 0.8})`,
      }}
    >
      <img
        src="/logo-flores.png"
        alt="Flores de México"
        className="mt-8 w-72 max-w-[80%] animate-float drop-shadow-xl"
      />

      <div className="flex flex-col items-center gap-4 pb-6">
        <button
          onClick={() => navigate({ to: "/login" })}
          className="flex items-center gap-3 rounded-2xl bg-pink-600 px-16 py-4 text-xl font-semibold text-white shadow-lg transition hover:bg-pink-700 active:scale-95"
        >
          Viajar <Play className="h-5 w-5 fill-white" />
        </button>

        <div className="flex gap-4">
          <button
            onClick={() => setSettingsOpen(true)}
            aria-label="Ajustes"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-pink-600 shadow transition hover:scale-105"
          >
            <Settings className="h-5 w-5" />
          </button>
          <button
            onClick={() => setInfoOpen(true)}
            aria-label="Información"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-pink-600 shadow transition hover:scale-105"
          >
            <Info className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm font-bold tracking-widest text-white drop-shadow">
          CELEBRANDO LA FLORA MEXICANA
        </p>
      </div>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="rounded-2xl border-2 border-pink-300 bg-[#f7f1ea]">
          <DialogHeader>
            <DialogTitle className="text-pink-700">Ajustes</DialogTitle>
            <DialogDescription>
              Personaliza tu experiencia de juego.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            <div>
              <Label className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-700">
                <Sun className="h-4 w-4 text-pink-600" /> Brillo
                <span className="ml-auto text-xs text-gray-500">{brightness[0]}%</span>
              </Label>
              <Slider value={brightness} onValueChange={setBrightness} max={100} step={1} />
            </div>

            <div>
              <Label className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-700">
                <Volume2 className="h-4 w-4 text-pink-600" /> Volumen
                <span className="ml-auto text-xs text-gray-500">{volumeSlider[0]}%</span>
              </Label>
              <Slider
                value={volumeSlider}
                onValueChange={(value) => {
                  setVolumeSlider(value);
                  setVolume(value[0] / 100);
                }}
                max={100}
                step={1}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-teal-300 bg-white px-4 py-3">
              <Label htmlFor="notif" className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <Bell className="h-4 w-4 text-pink-600" /> Notificaciones
              </Label>
              <Switch id="notif" checked={notifications} onCheckedChange={setNotifications} />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-teal-300 bg-white px-4 py-3">
              <Label htmlFor="keep" className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <LogIn className="h-4 w-4 text-pink-600" /> Mantener sesión iniciada
              </Label>
              <Switch id="keep" checked={keepLoggedIn} onCheckedChange={setKeepLoggedIn} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className="rounded-2xl border-2 border-pink-300 bg-[#f7f1ea]">
          <DialogHeader>
            <DialogTitle className="text-pink-700">Información</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-center text-base font-semibold text-gray-700">
            Inicia sesión para jugar
          </p>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}
