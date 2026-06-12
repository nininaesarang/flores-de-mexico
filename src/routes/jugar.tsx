import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Settings,
  HelpCircle,
  Share2,
  User,
  ShoppingBag,
  Coins,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Music,
  Copy,
  Twitter,
  Facebook,
  MapPin,
  Lock,
  LogOut,
  BookOpen,
  Check,
  Gamepad2,
  Map,
  PawPrint,
  Utensils,
  Box,
  Flower,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/jugar")({
  head: () => ({
    meta: [
      { title: "Explora México — Flores de México" },
      { name: "description", content: "Explora la flora y fauna de los estados de México." },
    ],
  }),
  component: JugarPage,
});

// Mock States Data for Interactive Map
const STATES_DATA = [
  {
    id: "saltillo",
    name: "Saltillo, Coahuila",
    region: "Desierto",
    regionIcon: "🏜️",
    discoveries: "12 / 100",
    coords: { x: 235, y: 135 },
    fact: "aquí se tejen los sarapes más famosos del país? 🌵 Hilo a hilo, cada pieza es una obra de arte única y colorida.",
  },
  {
    id: "torreon",
    name: "Torreón, Coahuila",
    region: "Desierto",
    regionIcon: "🏜️",
    discoveries: "15 / 100",
    coords: { x: 205, y: 145 },
    fact: "en la Región Lagunera hay un pan super exclusivo y barato? 🍞 ¡El increíble y crujiente pan francés lagunero!",
  },
  {
    id: "merida",
    name: "Mérida, Yucatán",
    region: "Selva",
    regionIcon: "🌳",
    discoveries: "45 / 100",
    coords: { x: 425, y: 200 },
    fact: "la flor de Xtabentún es parte de una hermosa leyenda maya y con ella se produce un delicioso licor local?",
  },
  {
    id: "guadalajara",
    name: "Guadalajara, Jalisco",
    region: "Valles",
    regionIcon: "🌾",
    discoveries: "28 / 100",
    coords: { x: 215, y: 195 },
    fact: "la dalia, flor nacional de México, crece silvestre en nuestros valles y bosques de clima templado?",
  },
  {
    id: "cdmx",
    name: "Ciudad de México",
    region: "Bosque",
    regionIcon: "🌲",
    discoveries: "60 / 100",
    coords: { x: 275, y: 205 },
    fact: "el ahuehuete o 'viejo del agua' es el árbol nacional de México y algunos ejemplares viven más de mil años?",
  },
  {
    id: "oaxaca",
    name: "Oaxaca, Oaxaca",
    region: "Sierra",
    regionIcon: "⛰️",
    discoveries: "75 / 100",
    coords: { x: 325, y: 235 },
    fact: "se registran más de 300 especies de orquídeas silvestres en la sierra de Oaxaca, siendo un tesoro megadiverso?",
  },
];

// Mock Shop items
const SHOP_ITEMS = [
  {
    id: "ticket_refill",
    name: "Recarga de Boletos (+5)",
    description: "Restaura 5 boletos de energía para seguir viajando inmediatamente.",
    cost: 150,
    icon: "🎟️",
  },
  {
    id: "grow_potion",
    name: "Elíxir de Crecimiento",
    description: "Acelera el crecimiento de tus semillas para desbloquear stickers rápido.",
    cost: 250,
    icon: "🧪",
  },
  {
    id: "rare_seed",
    name: "Semilla Silvestre Rara",
    description: "Planta esta semilla y descubre una flor poco común de la sierra.",
    cost: 500,
    icon: "🌱",
  },
  {
    id: "talavera_theme",
    name: "Tema Talavera Azul",
    description: "Cambia el diseño estético de tu mapa con bordes de cerámica poblana.",
    cost: 800,
    icon: "🎨",
  },
];

// Mock Stickers & Categories Data
const CATEGORIES_DATA = [
  {
    id: "estados",
    title: "Estados",
    icon: Map,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    badge: "12 / 32",
    percent: 37.5,
    borderColor: "border-pink-200",
    textColor: "text-[#70003c]",
    progressBg: "bg-pink-600",
    items: [
      { id: "coahuila", name: "Coahuila", scientific: "Saltillo & Torreón", description: "Estado de desiertos y rica historia industrial. Región norte de México.", unlocked: true, image: "🌵" },
      { id: "yucatan", name: "Yucatán", scientific: "Mérida", description: "Cuna de la cultura maya, selvas y cenotes turquesas.", unlocked: true, image: "🌴" },
      { id: "jalisco", name: "Jalisco", scientific: "Guadalajara", description: "Tierra del mariachi y el tequila, con hermosos valles.", unlocked: true, image: "🎸" },
      { id: "oaxaca", name: "Oaxaca", scientific: "Oaxaca de Juárez", description: "Corazón cultural y megadiverso con sierras y tradiciones únicas.", unlocked: false, image: "🏺" },
    ]
  },
  {
    id: "fauna",
    title: "Fauna",
    icon: PawPrint,
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    badge: "8 / 25",
    percent: 32,
    borderColor: "border-cyan-200",
    textColor: "text-teal-700",
    progressBg: "bg-teal-600",
    items: [
      { id: "ajolote", name: "Ajolote", scientific: "Ambystoma mexicanum", description: "Anfibio endémico de Xochimilco, maestro de la regeneración.", unlocked: true, image: "🦎" },
      { id: "aguila", name: "Águila Real", scientific: "Aquila chrysaetos", description: "Símbolo patrio de México, habita en zonas montañosas.", unlocked: true, image: "🦅" },
      { id: "monarca", name: "Mariposa Monarca", scientific: "Danaus plexippus", description: "Viaja miles de kilómetros cada año hasta los bosques de Michoacán.", unlocked: false, image: "🦋" },
      { id: "jaguar", name: "Jaguar", scientific: "Panthera onca", description: "El felino más grande de América, sagrado para los mayas.", unlocked: false, image: "🐆" },
    ]
  },
  {
    id: "flores",
    title: "Flores",
    icon: Flower,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-700",
    badge: "20 / 40",
    percent: 50,
    borderColor: "border-yellow-200",
    textColor: "text-amber-800",
    progressBg: "bg-yellow-600",
    items: [
      { id: "dalia", name: "Dalia", scientific: "Dahlia coccinea", description: "Flor nacional de México desde 1963, símbolo de la biodiversidad mexicana.", unlocked: true, image: "🌸" },
      { id: "cempasuchil", name: "Cempasúchil", scientific: "Tagetes erecta", description: "La flor de los muertos, ilumina el camino de las almas en noviembre.", unlocked: true, image: "🌼" },
      { id: "nochebuena", name: "Nochebuena", scientific: "Euphorbia pulcherrima", description: "Originaria de Guerrero, embellece la navidad en todo el mundo.", unlocked: true, image: "🌺" },
      { id: "jacaranda", name: "Jacaranda", scientific: "Jacaranda mimosifolia", description: "Pinta de morado la CDMX cada primavera, símbolo de amistad internacional.", unlocked: false, image: "💜" },
    ]
  },
  {
    id: "comidas",
    title: "Comidas",
    icon: Utensils,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    badge: "5 / 15",
    percent: 33.3,
    borderColor: "border-pink-200",
    textColor: "text-pink-600",
    progressBg: "bg-pink-600",
    items: [
      { id: "pan_frances", name: "Pan Francés", scientific: "Comarca Lagunera", description: "El clásico pan crujiente y barato exclusivo de Torreón y la Laguna.", unlocked: true, image: "🍞" },
      { id: "mole", name: "Mole Poblano", scientific: "Puebla", description: "Exquisita salsa tradicional hecha de chocolate, chiles y especias.", unlocked: true, image: "🍛" },
      { id: "tacos", name: "Tacos al Pastor", scientific: "Ciudad de México", description: "Delicioso trompo de carne con adobo, piña, cebolla y cilantro.", unlocked: false, image: "🌮" },
      { id: "cochinita", name: "Cochinita Pibil", scientific: "Yucatán", description: "Cerdo adobado en achiote cocido bajo tierra en hojas de plátano.", unlocked: false, image: "🥩" },
    ]
  }
];

function JugarPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"jugar" | "coleccion" | "tienda" | "perfil">("jugar");
  const [selectedState, setSelectedState] = useState(STATES_DATA[0]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const renderNavButton = (tab: "jugar" | "coleccion" | "tienda" | "perfil", Icon: any, label: string) => {
    const isActive = activeTab === tab;
    return (
      <button
        onClick={() => {
          if (tab === "coleccion") {
            setSelectedCategory(null);
          }
          setActiveTab(tab);
        }}
        className={`relative h-12 rounded-full transition-all duration-300 ease-in-out ${
          isActive ? "flex-[1.6] text-white" : "flex-1 text-gray-400 hover:text-gray-600"
        }`}
      >
        {/* Background Pill */}
        <div
          className={`absolute inset-0 rounded-full bg-[#d80073] transition-all duration-300 ease-in-out ${
            isActive ? "opacity-100 scale-100 shadow-md shadow-pink-200" : "opacity-0 scale-75 pointer-events-none"
          }`}
        />

        {/* Morphing Icon */}
        <div
          className={`absolute transition-all duration-300 ease-in-out ${
            isActive
              ? "left-[28%] top-1/2 -translate-x-1/2 -translate-y-1/2 text-white"
              : "left-1/2 top-1.5 -translate-x-1/2 -translate-y-0 text-gray-400"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>

        {/* Morphing Label */}
        <span
          className={`absolute transition-all duration-300 ease-in-out whitespace-nowrap ${
            isActive
              ? "left-[64%] top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs md:text-sm font-black text-white opacity-100"
              : "left-1/2 bottom-1 -translate-x-1/2 -translate-y-0 text-[10px] font-bold text-gray-400 opacity-100"
          }`}
        >
          {label}
        </span>
      </button>
    );
  };

  // Currency & Energy State
  const [energy, setEnergy] = useState(5);
  const [coins, setCoins] = useState(1250);

  // Settings Dialog State
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [textSpeed, setTextSpeed] = useState("Normal");
  const [musicOn, setMusicOn] = useState(true);
  const [sfxOn, setSfxOn] = useState(true);

  // Tutorial Dialog State
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialPage, setTutorialPage] = useState(0);

  // Share Dialog State
  const [shareOpen, setShareOpen] = useState(false);

  // Selected Sticker Modal State
  const [selectedSticker, setSelectedSticker] = useState<typeof STICKERS_DATA[0] | null>(null);

  const appLink = "https://floresdemexico.app";

  const handleBuyItem = (item: typeof SHOP_ITEMS[0]) => {
    if (coins >= item.cost) {
      setCoins((prev) => prev - item.cost);
      toast.success(`¡Compraste ${item.name}!`, {
        description: `Se han deducido ${item.cost} MXN de tu saldo.`,
      });
      if (item.id === "ticket_refill") {
        setEnergy((prev) => Math.min(10, prev + 5));
      }
    } else {
      toast.error("Saldo insuficiente", {
        description: "No tienes suficientes monedas MXN para comprar este artículo.",
      });
    }
  };

  const handleStartGame = () => {
    if (energy > 0) {
      setEnergy((prev) => prev - 1);
      toast.success("¡Buen viaje!", {
        description: `Iniciando expedición en ${selectedState.name}...`,
      });
    } else {
      toast.error("Sin boletos", {
        description: "No te quedan boletos de viaje. Consigue más en la tienda o espera a que se recarguen.",
      });
    }
  };

  const copyShareLink = () => {
    const textToCopy = `¡Estoy en ${selectedState.name}! ¿Sabías que ${selectedState.fact} Descubre más en ${appLink}`;
    navigator.clipboard.writeText(textToCopy);
    toast.success("¡Copiado al portapapeles!", {
      description: "El enlace de invitación y tu estado han sido copiados.",
    });
  };

  const tutorialPages = [
    {
      text: "Interactúa con las guías turísticas de cada estado presionando el cuadro de texto.",
      avatar: "👩‍💼",
    },
    {
      text: "Completa los niveles para recolectar stickers de flora, fauna y comida de las distintas entidades federativas.",
      avatar: "🌮",
    },
    {
      text: "Descubre la megadiversidad de México coleccionando experiencia y aprendiendo de ella.",
      avatar: "🎒",
    },
  ];

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between bg-[#fcf9f5] font-sans antialiased">
      {/* Top Bar Indicators */}
      <header className="flex w-full max-w-md items-center justify-between px-6 pt-5">
        {/* Energy Ticket Badge */}
        <div className="flex items-center gap-2 rounded-full border border-teal-500 bg-white px-3 py-1.5 shadow-sm">
          <Ticket className="h-5 w-5 fill-teal-400 text-teal-600" />
          <span className="text-sm font-extrabold text-teal-800">{energy} / 10</span>
        </div>

        {/* Currency MXN Badge */}
        <div className="flex items-center gap-2 rounded-full border border-amber-600 bg-white px-3 py-1.5 shadow-sm">
          <Coins className="h-5 w-5 fill-amber-400 text-amber-600" />
          <span className="text-sm font-extrabold text-amber-800">
            {coins.toLocaleString()} MXN
          </span>
        </div>
      </header>

      {/* Main Content Area based on Selected Tab */}
      <main className="w-full max-w-md flex-1 px-6 py-4">
        {activeTab === "jugar" && (
          <div className="space-y-4 animate-fade-in-slide-up">
            {/* Explora México Main Container */}
            <div className="relative overflow-hidden rounded-3xl border-2 border-pink-100 bg-white shadow-md">
              {/* Colorful Top Border Bar */}
              <div className="flex h-1.5 w-full">
                <div className="flex-1 bg-pink-500" />
                <div className="flex-1 bg-teal-400" />
                <div className="flex-1 bg-yellow-400" />
                <div className="flex-1 bg-emerald-400" />
              </div>

              <div className="p-5">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-lg font-bold tracking-tight text-pink-700">Explora México</h2>
                  {/* Floating active location badge */}
                  <span className="flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 border border-teal-200 animate-pulse">
                    <MapPin className="h-3.5 w-3.5 fill-teal-200" />
                    {selectedState.name.split(",")[0]}
                  </span>
                </div>

                {/* SVG Interactive Map Area */}
                <div className="relative aspect-square w-full rounded-2xl bg-gradient-to-b from-rose-950 via-rose-900 to-pink-900 p-2 overflow-hidden shadow-inner border border-rose-800">
                  {/* Styled Map Silhouette */}
                  <svg
                    viewBox="0 0 500 350"
                    className="absolute inset-0 h-full w-full opacity-35 select-none"
                  >
                    {/* Simplified Stylized Mexico Background Map */}
                    <path
                      d="M 50,70 Q 70,100 85,150 T 80,180 Z"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="3"
                    />
                    <path
                      d="M 120,80 
                         C 170,85 230,105 270,115 
                         C 310,125 320,140 330,170 
                         C 345,200 320,220 340,240 
                         C 360,260 380,245 400,230 
                         C 420,215 440,195 460,195 
                         C 475,195 480,215 470,235 
                         C 455,255 435,260 415,265 
                         C 385,270 375,285 365,295 
                         C 340,315 310,300 280,270 
                         C 250,240 210,235 170,220 
                         C 130,205 115,170 105,130 Z"
                      fill="#ffffff"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                    />
                  </svg>

                  {/* Grid Lines for aesthetics */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />

                  {/* Interactive Hotspots */}
                  {STATES_DATA.map((state) => {
                    const isSelected = selectedState.id === state.id;
                    return (
                      <button
                        key={state.id}
                        onClick={() => setSelectedState(state)}
                        style={{
                          left: `${state.coords.x}px`,
                          top: `${state.coords.y}px`,
                        }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 group z-10"
                        title={state.name}
                      >
                        {/* Hover Badge */}
                        <span className="absolute bottom-6 left-1/2 -translate-x-1/2 scale-0 rounded bg-white px-2 py-0.5 text-[10px] font-black text-rose-950 shadow transition-all group-hover:scale-100 whitespace-nowrap border border-pink-200">
                          {state.name.split(",")[0]}
                        </span>

                        {/* Pulsing ring around active state */}
                        {isSelected && (
                          <span className="absolute -inset-2 rounded-full border border-pink-400 bg-pink-500/35 animate-ping duration-1000" />
                        )}

                        {/* Cactus / Pin marker */}
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-full shadow-md border-2 transition-transform duration-300 ${
                            isSelected
                              ? "bg-pink-500 border-white scale-125 text-base"
                              : "bg-white/90 border-pink-500 text-xs hover:scale-110"
                          }`}
                        >
                          🌵
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Statistics row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Discoveries Card */}
              <div className="flex items-center gap-3 rounded-2xl border-2 border-pink-100 bg-white p-3 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                  🌸
                </div>
                <div>
                  <div className="text-[10px] font-black tracking-wider text-gray-400">DESCUBIERTAS</div>
                  <div className="text-sm font-extrabold text-pink-700">{selectedState.discoveries}</div>
                </div>
              </div>

              {/* Region Card */}
              <div className="flex items-center gap-3 rounded-2xl border-2 border-pink-100 bg-white p-3 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 text-lg">
                  {selectedState.regionIcon}
                </div>
                <div>
                  <div className="text-[10px] font-black tracking-wider text-gray-400">REGIÓN</div>
                  <div className="text-sm font-extrabold text-teal-700">{selectedState.region}</div>
                </div>
              </div>
            </div>

            {/* Main Action Button */}
            <button
              onClick={handleStartGame}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-pink-600 py-4 text-xl font-bold tracking-wider text-white shadow-lg shadow-pink-200 transition duration-300 hover:bg-pink-700 hover:scale-[1.02] active:scale-95 animate-pulse"
            >
              COMENZAR ▷
            </button>

            {/* Control Circle Buttons Row */}
            <div className="flex justify-center gap-5 pt-1">
              {/* Settings button */}
              <button
                onClick={() => setSettingsOpen(true)}
                aria-label="Ajustes"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400 text-white shadow-md shadow-cyan-100 transition-all hover:scale-110 active:scale-95"
              >
                <Settings className="h-5 w-5" />
              </button>

              {/* Help button */}
              <button
                onClick={() => {
                  setTutorialPage(0);
                  setTutorialOpen(true);
                }}
                aria-label="Ayuda"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-400 text-white shadow-md shadow-amber-100 transition-all hover:scale-110 active:scale-95"
              >
                <HelpCircle className="h-5 w-5" />
              </button>

              {/* Share button */}
              <button
                onClick={() => setShareOpen(true)}
                aria-label="Compartir"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-600 shadow-md shadow-slate-100 transition-all hover:scale-110 active:scale-95"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Colección Tab View */}
        {activeTab === "coleccion" && (
          <div className="space-y-5 animate-fade-in-slide-up">
            {selectedCategory === null ? (
              <>
                {/* Title and Stripe */}
                <div className="text-center space-y-2.5">
                  <h1 className="text-2xl font-extrabold text-[#70003c] tracking-tight">
                    Mis Coleccionables
                  </h1>
                  {/* Underline stripes */}
                  <div className="mx-auto flex h-1.5 w-56 rounded-full overflow-hidden">
                    <div className="flex-1 bg-[#880e4f]" />
                    <div className="flex-1 bg-[#00796b]" />
                    <div className="flex-1 bg-[#fbc02d]" />
                    <div className="flex-1 bg-[#00b0ff]" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    ¡Descubre las maravillas de nuestra tierra!
                  </p>
                </div>

                {/* Category Cards List */}
                <div className="space-y-4">
                  {CATEGORIES_DATA.map((cat) => {
                    const IconComponent = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full flex flex-col justify-between rounded-3xl border-2 ${cat.borderColor} bg-white p-4 text-left shadow-sm transition-all duration-200 hover:scale-[1.01] hover:shadow-md active:scale-95`}
                      >
                        {/* Upper row: Icon box and badge counter */}
                        <div className="flex items-center justify-between w-full mb-3">
                          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${cat.iconBg} ${cat.iconColor}`}>
                            <IconComponent className="h-5 w-5 stroke-[2.5]" />
                          </div>
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-extrabold text-gray-500">
                            {cat.badge}
                          </span>
                        </div>

                        {/* Title and Progress bar */}
                        <div className="w-full space-y-2">
                          <h3 className={`text-xl font-extrabold ${cat.textColor}`}>
                            {cat.title}
                          </h3>
                          {/* Progress track */}
                          <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                            <div
                              style={{ width: `${cat.percent}%` }}
                              className={`h-full rounded-full ${cat.progressBg}`}
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* "Did you know?" Card at the bottom */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-100 to-rose-50 p-5 shadow-sm border border-pink-100 flex flex-col justify-between min-h-[140px]">
                  <div className="space-y-2 max-w-[65%]">
                    <h4 className="text-lg font-extrabold text-[#70003c]">
                      ¿Sabías que...?
                    </h4>
                    <p className="text-xs font-semibold text-[#8a2e5d] leading-relaxed">
                      La Dalia es la flor nacional de México desde 1963.
                    </p>
                  </div>

                  <div className="mt-3">
                    <button
                      onClick={() => {
                        const daliaSticker = CATEGORIES_DATA.find(c => c.id === "flores")?.items.find(i => i.id === "dalia");
                        if (daliaSticker) {
                          setSelectedSticker({
                            id: daliaSticker.id,
                            name: daliaSticker.name,
                            scientific: daliaSticker.scientific,
                            description: daliaSticker.description,
                            unlocked: daliaSticker.unlocked,
                            image: daliaSticker.image,
                            rarity: "Nacional"
                          });
                        }
                      }}
                      className="rounded-full bg-pink-700 px-5 py-1.5 text-xs font-bold text-white shadow transition hover:bg-pink-800"
                    >
                      Ver Más
                    </button>
                  </div>

                  {/* Dahlia Flower SVG Drawing on bottom right */}
                  <div className="absolute bottom-2 right-2 h-24 w-24 pointer-events-none select-none">
                    <svg viewBox="0 0 100 100" className="h-full w-full">
                      <path d="M 50,20 C 53,35 47,35 50,20 Z" fill="#e11d48" />
                      <path d="M 50,80 C 53,65 47,65 50,80 Z" fill="#e11d48" />
                      <path d="M 20,50 C 35,53 35,47 20,50 Z" fill="#e11d48" />
                      <path d="M 80,50 C 65,53 65,47 80,50 Z" fill="#e11d48" />
                      
                      <path d="M 29,29 C 41,38 38,41 29,29 Z" fill="#be123c" />
                      <path d="M 71,71 C 59,62 62,59 71,71 Z" fill="#be123c" />
                      <path d="M 29,71 C 38,59 41,62 29,71 Z" fill="#be123c" />
                      <path d="M 71,29 C 62,41 59,38 71,29 Z" fill="#be123c" />

                      <path d="M 50,30 C 55,42 45,42 50,30 Z" fill="#f43f5e" />
                      <path d="M 50,70 C 55,58 45,58 50,70 Z" fill="#f43f5e" />
                      <path d="M 30,50 C 42,55 42,45 30,50 Z" fill="#f43f5e" />
                      <path d="M 70,50 C 58,55 58,45 70,50 Z" fill="#f43f5e" />

                      <circle cx="50" cy="50" r="14" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
                      <circle cx="50" cy="50" r="8" fill="#d97706" />
                    </svg>
                  </div>
                </div>
              </>
            ) : selectedCategory === "estados" ? (
              selectedStateAlbum === null ? (
                /* 1. Closed Books Layout for States */
                <div className="rounded-3xl border-2 border-pink-100 bg-white p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-pink-50">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="flex items-center gap-1 text-xs font-bold text-pink-700 hover:underline"
                    >
                      <ChevronLeft className="h-4 w-4" /> Volver
                    </button>
                    <h3 className="text-base font-extrabold text-gray-800">Álbumes de Estados</h3>
                    <span className="rounded-full bg-pink-100 px-3 py-0.5 text-xs font-extrabold text-pink-700">
                      12 / 32
                    </span>
                  </div>

                  {/* Horizontal scrolling grid in two rows */}
                  <div className="grid grid-rows-2 grid-flow-col gap-4 overflow-x-auto pb-4 scrollbar-none snap-x w-full">
                    {MEXICAN_STATES.map((state) => (
                      <div key={state.id} className="flex flex-col items-center gap-2 snap-center w-24">
                        <button
                          onClick={() => {
                            if (state.unlocked) {
                              setSelectedStateAlbum(state.id);
                            } else {
                              toast.info("Estado Bloqueado", {
                                description: `Sigue explorando para desbloquear el álbum de ${state.name}.`,
                              });
                            }
                          }}
                          className={`relative h-32 w-24 rounded-r-xl rounded-l-md border-y-2 border-r-4 border-l-8 shadow-md transition-all duration-300 hover:scale-105 active:scale-95 ${
                            state.unlocked
                              ? `bg-gradient-to-br ${state.color} border-pink-300 border-l-[#3a001a]`
                              : "bg-gray-200 border-gray-300 border-l-gray-400 opacity-60"
                          }`}
                        >
                          {/* Spine binding effect */}
                          <div className="absolute inset-y-0 left-0 w-0.5 bg-black/10" />
                          {state.unlocked && (
                            <div className="absolute inset-1.5 border border-amber-400/30 rounded pointer-events-none" />
                          )}

                          {/* Logo on cover */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                            <span className="text-3xl filter drop-shadow">{state.logo}</span>
                            {state.unlocked && (
                              <span className="text-[8px] font-black tracking-widest text-amber-300 uppercase">
                                ABRIR
                              </span>
                            )}
                          </div>

                          {/* Lock Overlay */}
                          {!state.unlocked && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-r-xl rounded-l-md">
                              <Lock className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                        </button>
                        <span className="text-[11px] font-black text-gray-600 truncate max-w-full text-center">
                          {state.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Tips card */}
                  <div className="rounded-2xl bg-amber-50 p-4 border border-amber-100 flex items-start gap-2.5">
                    <span className="text-xl">💡</span>
                    <p className="text-[11px] font-semibold text-amber-800 leading-normal">
                      ¡Los libritos de cada estado guardan recuerdos locales! Explora el mapa de juego para abrirlos todos.
                    </p>
                  </div>
                </div>
              ) : (
                /* 2. Coahuila State Mini Album View */
                <div className="rounded-3xl border-2 border-pink-100 bg-white p-5 shadow-sm space-y-4 animate-fade-in-slide-up">
                  {/* Top Bar Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-pink-50">
                    <button
                      onClick={() => setSelectedStateAlbum(null)}
                      className="flex items-center gap-1 text-xs font-bold text-pink-700 hover:underline"
                    >
                      <ChevronLeft className="h-4 w-4" /> Volver a Estados
                    </button>
                    <h3 className="text-base font-extrabold text-[#70003c]">Coahuila</h3>
                    <div className="flex items-center gap-1 rounded-full bg-[#d80073] px-3 py-1 text-xs font-extrabold text-white shadow-sm">
                      <span className="text-[10px]">⭐</span> 1 / 6
                    </div>
                  </div>

                  {/* Album Info Card */}
                  <div className="relative overflow-hidden rounded-2xl border-2 border-pink-100 bg-[#fdfaf6] p-4 shadow-inner">
                    <div className="flex h-1.5 w-full absolute top-0 inset-x-0">
                      <div className="flex-1 bg-pink-500" />
                      <div className="flex-1 bg-teal-400" />
                      <div className="flex-1 bg-yellow-400" />
                      <div className="flex-1 bg-emerald-400" />
                    </div>
                    <h4 className="text-lg font-bold text-teal-800 mt-1">San Pedro de las Colonias</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Colecciona los stickers históricos y culturales de los municipios de Coahuila.
                    </p>
                    {/* Progress Bar */}
                    <div className="mt-3 space-y-1">
                      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full w-[16.6%] bg-pink-600 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Sticker Album Grid */}
                  <div className="grid grid-cols-2 gap-3.5 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                    {/* Card 01: Museo Madero Unlocked */}
                    <button
                      onClick={() => {
                        setSelectedSticker({
                          id: "coahuila_01",
                          name: "Museo Madero",
                          scientific: "San Pedro, Coahuila",
                          description: "Cuna de la Revolución Mexicana. El histórico edificio donde Francisco I. Madero escribió gran parte de su libro 'La Sucesión Presidencial'.",
                          unlocked: true,
                          image: "🏛️",
                          rarity: "Histórico"
                        });
                      }}
                      className="flex flex-col items-center bg-white border border-pink-200 rounded-2xl p-2 relative shadow-sm hover:scale-[1.03] transition-all"
                    >
                      <div className="absolute top-2 left-2 flex h-5 w-6 items-center justify-center rounded-br-lg rounded-tl-xl text-[9px] font-black text-white bg-[#d80073]">
                        01
                      </div>
                      <div className="aspect-square w-full rounded-xl flex items-center justify-center bg-[#b3f3ed]/25 p-1 overflow-hidden">
                        <img src="/museo-madero.png" className="w-full h-full object-contain hover:scale-105 transition-transform" />
                      </div>
                      <span className="text-[10px] font-black text-gray-700 mt-2 truncate max-w-full text-center">
                        Museo Madero (San Pedro)
                      </span>
                    </button>

                    {/* Cards 02 to 05: Locked with "?" inside */}
                    {[2, 3, 4, 5].map((num) => (
                      <div
                        key={num}
                        className="flex flex-col items-center bg-gray-50/50 border border-gray-100 rounded-2xl p-2 relative opacity-70"
                      >
                        <div className="absolute top-2 left-2 flex h-5 w-6 items-center justify-center rounded-br-lg rounded-tl-xl text-[9px] font-bold text-white bg-gray-400">
                          0{num}
                        </div>
                        <div className="aspect-square w-full rounded-xl flex items-center justify-center bg-gray-100">
                          <span className="text-xl font-bold text-gray-300">?</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 mt-2">???</span>
                      </div>
                    ))}

                    {/* Card 06: Locked with Padlock */}
                    <div className="flex flex-col items-center bg-gray-50/50 border border-gray-100 rounded-2xl p-2 relative opacity-70">
                      <div className="absolute top-2 left-2 flex h-5 w-6 items-center justify-center rounded-br-lg rounded-tl-xl text-[9px] font-bold text-white bg-gray-400">
                        06
                      </div>
                      <div className="aspect-square w-full rounded-xl flex items-center justify-center bg-gray-100">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 mt-2">???</span>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <button
                    onClick={() => toast.info("No hay más páginas", { description: "¡Descubre más municipios en Coahuila para abrir nuevos tomos!" })}
                    className="flex w-full items-center justify-center gap-1.5 rounded-full bg-teal-700 py-2.5 text-xs font-black text-white transition hover:bg-teal-800"
                  >
                    Siguiente página →
                  </button>

                  {/* Yellow tip card */}
                  <div className="rounded-2xl bg-amber-50 p-4 border border-amber-100 flex items-start gap-2.5">
                    <span className="text-xl">💡</span>
                    <p className="text-[11px] font-semibold text-amber-800 leading-normal">
                      ¡Sigue explorando los municipios de Coahuila para encontrar más stickers!
                    </p>
                  </div>
                </div>
              )
            ) : (
              /* 3. Fauna/Flores/Comidas Sticker Albums */
              <div className="rounded-3xl border-2 border-pink-100 bg-white p-5 shadow-sm space-y-4 animate-fade-in-slide-up">
                {/* Top Header */}
                <div className="flex items-center justify-between pb-2 border-b border-pink-50">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="flex items-center gap-1 text-xs font-bold text-pink-700 hover:underline"
                  >
                    <ChevronLeft className="h-4 w-4" /> Volver
                  </button>
                  <h3 className="text-base font-extrabold text-gray-800">
                    {selectedCategory === "fauna" ? "Fauna" : selectedCategory === "flores" ? "Flores" : "Comidas"}
                  </h3>
                  <div className="flex items-center gap-1 rounded-full bg-[#d80073] px-3 py-1 text-xs font-extrabold text-white shadow-sm">
                    <span className="text-[10px]">⭐</span> 1 / 6
                  </div>
                </div>

                {/* Album Header Card */}
                <div className="relative overflow-hidden rounded-2xl border-2 border-pink-100 bg-[#fdfaf6] p-4 shadow-inner">
                  <div className="flex h-1.5 w-full absolute top-0 inset-x-0">
                    <div className="flex-1 bg-pink-500" />
                    <div className="flex-1 bg-teal-400" />
                    <div className="flex-1 bg-yellow-400" />
                    <div className="flex-1 bg-emerald-400" />
                  </div>
                  <h4 className="text-lg font-bold text-teal-800 mt-1">
                    {selectedCategory === "fauna" ? "Fauna del Desierto" : selectedCategory === "flores" ? "Flores Silvestres" : "Comidas Típicas"}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedCategory === "fauna"
                      ? "Colecciona las especies más icónicas del Gran Ecosistema Coahuilense."
                      : selectedCategory === "flores"
                      ? "Descubre la flora nacional de México y de sus distintos ecosistemas."
                      : "Explora la gastronomía regional y los sabores emblemáticos de cada estado."
                    }
                  </p>
                  {/* Progress bar */}
                  <div className="mt-3 space-y-1">
                    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full w-[16.6%] bg-pink-600 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Stickers Grid */}
                <div className="grid grid-cols-2 gap-3.5 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                  {/* Card 01: Unlocked */}
                  <button
                    onClick={() => {
                      setSelectedSticker({
                        id: "01",
                        name: selectedCategory === "fauna" ? "El Guajolote" : selectedCategory === "flores" ? "Dalia" : "Pan Francés",
                        scientific: selectedCategory === "fauna" ? "Guajolote Norteño" : selectedCategory === "flores" ? "Dahlia coccinea" : "Comarca Lagunera",
                        description: selectedCategory === "fauna"
                          ? "Especie majestuosa de la Sierra Madre del Desierto Coahuilense. Un animal de gran importancia ecológica."
                          : selectedCategory === "flores"
                          ? "Flor nacional de México desde 1963, famosa por sus pétalos y colores vibrantes."
                          : "Delicioso pan tradicional y crujiente de la Laguna, ideal para comer con guisados.",
                        unlocked: true,
                        image: selectedCategory === "fauna" ? "🦃" : selectedCategory === "flores" ? "🌸" : "🍞",
                        rarity: "Común"
                      });
                    }}
                    className="flex flex-col items-center bg-white border border-pink-200 rounded-2xl p-2 relative shadow-sm hover:scale-[1.03] transition-all"
                  >
                    <div className="absolute top-2 left-2 flex h-5 w-6 items-center justify-center rounded-br-lg rounded-tl-xl text-[9px] font-black text-white bg-[#d80073]">
                      01
                    </div>
                    <div className="aspect-square w-full rounded-xl flex items-center justify-center bg-[#b3f3ed]/25 p-1 overflow-hidden">
                      {selectedCategory === "fauna" ? (
                        <img src="/el-guajolote.png" className="w-full h-full object-contain hover:scale-105 transition-transform" />
                      ) : (
                        <span className="text-4xl">{selectedCategory === "flores" ? "🌸" : "🍞"}</span>
                      )}
                    </div>
                    <span className="text-[11px] font-black text-gray-700 mt-2 truncate max-w-full text-center">
                      {selectedCategory === "fauna" ? "El Guajolote" : selectedCategory === "flores" ? "Dalia" : "Pan Francés"}
                    </span>
                  </button>

                  {/* Cards 02 to 05: Locked with "?" */}
                  {[2, 3, 4, 5].map((num) => (
                    <div
                      key={num}
                      className="flex flex-col items-center bg-gray-50/50 border border-gray-100 rounded-2xl p-2 relative opacity-70"
                    >
                      <div className="absolute top-2 left-2 flex h-5 w-6 items-center justify-center rounded-br-lg rounded-tl-xl text-[9px] font-bold text-white bg-gray-400">
                        0{num}
                      </div>
                      <div className="aspect-square w-full rounded-xl flex items-center justify-center bg-gray-100">
                        <span className="text-xl font-bold text-gray-300">?</span>
                      </div>
                      <span className="text-[11px] font-bold text-gray-400 mt-2">???</span>
                    </div>
                  ))}

                  {/* Card 06: Locked with Padlock */}
                  <div className="flex flex-col items-center bg-gray-50/50 border border-gray-100 rounded-2xl p-2 relative opacity-70">
                    <div className="absolute top-2 left-2 flex h-5 w-6 items-center justify-center rounded-br-lg rounded-tl-xl text-[9px] font-bold text-white bg-gray-400">
                      06
                    </div>
                    <div className="aspect-square w-full rounded-xl flex items-center justify-center bg-gray-100">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-400 mt-2">???</span>
                  </div>
                </div>

                {/* Siguiente página button */}
                <button
                  onClick={() => toast.info("No hay más páginas", { description: "¡Completa más álbumes para desbloquear la siguiente página!" })}
                  className="flex w-full items-center justify-center gap-1.5 rounded-full bg-teal-700 py-2.5 text-xs font-black text-white transition hover:bg-teal-800"
                >
                  Siguiente página →
                </button>

                {/* Tips yellow card */}
                <div className="rounded-2xl bg-amber-50 p-4 border border-amber-100 flex items-start gap-2.5">
                  <span className="text-xl">💡</span>
                  <p className="text-[11px] font-semibold text-amber-800 leading-normal">
                    {selectedCategory === "fauna"
                      ? "¡Sigue explorando los Parques Nacionales para encontrar más sobres!"
                      : selectedCategory === "flores"
                      ? "¡Busca en los bosques y valles templados para recolectar más flores silvestres!"
                      : "¡Sigue recorriendo los mercados locales para descubrir más platillos típicos!"
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tienda Tab View */}
        {activeTab === "tienda" && (
          <div className="space-y-4 animate-fade-in-slide-up">
            <div className="rounded-3xl border-2 border-pink-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-center text-lg font-bold text-pink-700 flex items-center justify-center gap-2">
                <ShoppingBag className="h-5 w-5 text-pink-600" /> Tienda Botánica
              </h2>

              {/* Shop Items List */}
              <div className="space-y-3">
                {SHOP_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl border border-pink-100 bg-[#fefcf9] p-3 shadow-inner"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{item.icon}</div>
                      <div>
                        <div className="text-sm font-bold text-gray-800">{item.name}</div>
                        <div className="max-w-[200px] text-[10px] text-gray-500 leading-tight">
                          {item.description}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleBuyItem(item)}
                      className="flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-extrabold text-white transition hover:bg-amber-600 shadow-sm"
                    >
                      {item.cost} MXN
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Perfil Tab View */}
        {activeTab === "perfil" && (
          <div className="space-y-4 animate-fade-in-slide-up">
            <div className="rounded-3xl border-2 border-pink-100 bg-white p-5 shadow-sm text-center">
              <div className="relative mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-pink-100 border-4 border-pink-200">
                <User className="h-10 w-10 text-pink-600" />
                <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-[10px] font-black text-white border-2 border-white">
                  Lvl 4
                </span>
              </div>

              <h2 className="text-base font-bold text-gray-800">Explorador Botánico</h2>
              <p className="text-xs text-teal-600 font-extrabold uppercase">Guardabosques Novel</p>

              {/* Progress bar */}
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-[10px] font-black text-gray-400">
                  <span>EXP DE VIAJE</span>
                  <span>450 / 1000 XP</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full w-[45%] bg-teal-500 rounded-full" />
                </div>
              </div>

              {/* Statistics grid */}
              <div className="grid grid-cols-3 gap-2 mt-5 py-3 border-y border-dashed border-pink-100">
                <div className="text-center">
                  <div className="text-lg font-black text-pink-600">32%</div>
                  <div className="text-[9px] font-black tracking-wider text-gray-400 uppercase">
                    COMPLETO
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-black text-teal-600">12</div>
                  <div className="text-[9px] font-black tracking-wider text-gray-400 uppercase">
                    FLORES
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-black text-amber-600">5</div>
                  <div className="text-[9px] font-black tracking-wider text-gray-400 uppercase">
                    STICKERS
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <button
                  onClick={() =>
                    toast.info("Configuraciones de cuenta", {
                      description: "Esta función de sincronización está en mantenimiento.",
                    })
                  }
                  className="w-full rounded-full border border-pink-200 bg-white py-2 text-xs font-bold text-pink-700 transition hover:bg-pink-50"
                >
                  Editar avatar y nombre
                </button>

                <button
                  onClick={() => navigate({ to: "/" })}
                  className="flex w-full items-center justify-center gap-1.5 rounded-full bg-rose-500 py-2.5 text-xs font-bold text-white transition hover:bg-rose-600"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="w-full max-w-md bg-white border-t border-gray-100 py-3.5 px-6 flex justify-between items-center shadow-lg rounded-t-3xl min-h-[76px]">
        {renderNavButton("coleccion", Box, "Colección")}
        {renderNavButton("jugar", Gamepad2, "Jugar")}
        {renderNavButton("tienda", ShoppingBag, "Tienda")}
        {renderNavButton("perfil", User, "Perfil")}
      </nav>

      {/* Settings Dialog (Cyan button) */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="rounded-3xl border-2 border-pink-300 bg-[#f7f1ea] max-w-[90%] md:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-pink-700 font-extrabold text-xl text-center">
              Ajustes de Juego
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-gray-500">
              Personaliza tu experiencia de exploración
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-3">
            {/* Text Speed Speed Options */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-700 tracking-wider">
                VELOCIDAD DE TEXTO
              </Label>
              <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white p-1 border-2 border-teal-300">
                {["Lento", "Normal", "Rápido"].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setTextSpeed(speed)}
                    className={`rounded-xl py-2 text-xs font-black transition-all ${
                      textSpeed === speed
                        ? "bg-pink-600 text-white shadow-sm"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {speed}
                  </button>
                ))}
              </div>
            </div>

            {/* Music Toggle Switch */}
            <div className="flex items-center justify-between rounded-2xl border-2 border-teal-300 bg-white px-4 py-3 shadow-inner">
              <Label
                htmlFor="music"
                className="flex items-center gap-2.5 text-xs font-bold text-gray-700 tracking-wider"
              >
                <Music className="h-4.5 w-4.5 text-pink-600" /> MÚSICA
              </Label>
              <Switch id="music" checked={musicOn} onCheckedChange={setMusicOn} />
            </div>

            {/* SFX Toggle Switch */}
            <div className="flex items-center justify-between rounded-2xl border-2 border-teal-300 bg-white px-4 py-3 shadow-inner">
              <Label
                htmlFor="sfx"
                className="flex items-center gap-2.5 text-xs font-bold text-gray-700 tracking-wider"
              >
                <Volume2 className="h-4.5 w-4.5 text-pink-600" /> EFECTOS DE SONIDO
              </Label>
              <Switch id="sfx" checked={sfxOn} onCheckedChange={setSfxOn} />
            </div>
          </div>

          <button
            onClick={() => {
              setSettingsOpen(false);
              toast.success("Ajustes guardados correctamente");
            }}
            className="w-full mt-2 rounded-full bg-pink-700 py-3 font-bold text-white shadow-md transition hover:bg-pink-800"
          >
            GUARDAR Y CERRAR
          </button>
        </DialogContent>
      </Dialog>

      {/* Tutorial Speech Bubble Dialog (Yellow button) */}
      <Dialog open={tutorialOpen} onOpenChange={setTutorialOpen}>
        <DialogContent className="border-none bg-transparent max-w-[90%] md:max-w-md p-0 focus:outline-none shadow-none">
          <div className="relative flex flex-col items-center gap-4">
            {/* Guide Avatar Icon with float animation */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white border-4 border-pink-400 text-3xl shadow-lg animate-float">
              {tutorialPages[tutorialPage].avatar}
            </div>

            {/* Speech bubble container (beige container with pointer) */}
            <div className="relative w-full rounded-3xl border-4 border-pink-300 bg-[#f7f1ea] p-6 text-center shadow-xl">
              {/* Triangle pointer */}
              <div className="absolute -top-[16px] left-1/2 -translate-x-1/2 h-0 w-0 border-x-[12px] border-x-transparent border-b-[16px] border-b-pink-300" />
              <div className="absolute -top-[10px] left-1/2 -translate-x-1/2 h-0 w-0 border-x-[10px] border-x-transparent border-b-[14px] border-b-[#f7f1ea]" />

              <p className="text-base md:text-lg font-bold text-gray-800 min-h-[60px] flex items-center justify-center px-2 leading-relaxed">
                "{tutorialPages[tutorialPage].text}"
              </p>

              {/* Dot Indicators */}
              <div className="flex justify-center gap-1.5 my-4">
                {tutorialPages.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-2.5 w-2.5 rounded-full transition-all ${
                      tutorialPage === idx ? "bg-pink-600 w-5" : "bg-pink-200"
                    }`}
                  />
                ))}
              </div>

              {/* Navigation controls */}
              <div className="flex items-center justify-between gap-3 mt-4">
                <button
                  disabled={tutorialPage === 0}
                  onClick={() => setTutorialPage((p) => p - 1)}
                  className="flex items-center gap-1 rounded-full border border-pink-300 bg-white px-4 py-2 text-xs font-bold text-pink-700 transition disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" /> Anterior
                </button>

                {tutorialPage < tutorialPages.length - 1 ? (
                  <button
                    onClick={() => setTutorialPage((p) => p + 1)}
                    className="flex items-center gap-1 rounded-full bg-pink-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-pink-700"
                  >
                    Siguiente <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setTutorialOpen(false);
                      toast.success("¡Tutorial completado!", {
                        description: "Ahora sabes cómo funciona el explorador turístico.",
                      });
                    }}
                    className="flex items-center gap-1 rounded-full bg-teal-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-teal-700"
                  >
                    ¡Entendido! <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog (Grey button) */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="rounded-3xl border-2 border-pink-300 bg-[#f7f1ea] max-w-[90%] md:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-pink-700 font-extrabold text-xl text-center">
              Compartir Viaje
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-gray-500">
              ¡Diles a tus amigos en qué parte de México estás explorando!
            </DialogDescription>
          </DialogHeader>

          {/* Social Post Preview Container */}
          <div className="my-4 rounded-2xl border border-pink-200 bg-white p-4 shadow-inner">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-base">
                🇲🇽
              </div>
              <div>
                <div className="text-xs font-black text-gray-800">Flores de México</div>
                <div className="text-[9px] text-gray-400">Hace un momento</div>
              </div>
            </div>

            <p className="text-xs font-medium text-gray-700 leading-relaxed bg-pink-50/50 rounded-xl p-3 border border-pink-50">
              Estoy en {selectedState.name}. ¿Sabías que {selectedState.fact} {appLink}
            </p>
          </div>

          {/* Action Row */}
          <div className="space-y-3">
            <button
              onClick={copyShareLink}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-pink-700 py-3 text-sm font-bold text-white shadow transition hover:bg-pink-800"
            >
              <Copy className="h-4 w-4" /> Copiar mensaje
            </button>

            {/* Quick Share Icons Mock */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  const xText = encodeURIComponent(
                    `Estoy en ${selectedState.name}. ¿Sabías que ${selectedState.fact} ${appLink}`
                  );
                  window.open(`https://twitter.com/intent/tweet?text=${xText}`, "_blank");
                  toast.success("Abriendo Twitter/X...");
                  setShareOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 rounded-full border-2 border-slate-300 bg-white py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <Twitter className="h-4 w-4 text-sky-500 fill-sky-500" /> Twitter / X
              </button>

              <button
                onClick={() => {
                  const wpText = encodeURIComponent(
                    `Estoy en ${selectedState.name}. ¿Sabías que ${selectedState.fact} ${appLink}`
                  );
                  window.open(`https://api.whatsapp.com/send?text=${wpText}`, "_blank");
                  toast.success("Abriendo WhatsApp...");
                  setShareOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 rounded-full border-2 border-slate-300 bg-white py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <Facebook className="h-4 w-4 text-blue-600 fill-blue-600" /> WhatsApp
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Selected Sticker Detail Dialog (Colección) */}
      <Dialog
        open={selectedSticker !== null}
        onOpenChange={(open) => !open && setSelectedSticker(null)}
      >
        <DialogContent className="rounded-3xl border-2 border-pink-300 bg-[#f7f1ea] max-w-[90%] md:max-w-md p-6">
          {selectedSticker && (
            <div className="text-center space-y-4">
              <div className="text-7xl filter drop-shadow-md animate-float my-2">
                {selectedSticker.image}
              </div>

              <div>
                <DialogTitle className="text-pink-700 font-extrabold text-xl">
                  {selectedSticker.name}
                </DialogTitle>
                <span className="text-xs italic text-gray-500 block mt-0.5">
                  {selectedSticker.scientific}
                </span>
              </div>

              <div className="inline-block rounded-full bg-pink-100 px-3.5 py-1 text-xs font-black text-pink-700 uppercase">
                {selectedSticker.rarity}
              </div>

              <p className="text-xs text-gray-700 bg-white p-4 rounded-2xl border border-pink-100 shadow-inner leading-relaxed">
                {selectedSticker.description}
              </p>

              <button
                onClick={() => setSelectedSticker(null)}
                className="w-full rounded-full bg-pink-700 py-3 font-bold text-white shadow transition hover:bg-pink-800"
              >
                CERRAR DETALLES
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
