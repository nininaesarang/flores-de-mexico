import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
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
  Camera,
  Pencil,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { SetGameMusicTrack, useGameAudio } from "@/contexts/game-audio-context";

export const Route = createFileRoute("/jugar")({
  head: () => ({
    meta: [
      { title: "Explora México — Flores de México" },
      { name: "description", content: "Explora la flora y fauna de los estados de México." },
    ],
  }),
  component: JugarPage,
});

// Municipios de Coahuila para el mapa interactivo
const STATES_DATA = [
  {
    id: "san-pedro",
    name: "San Pedro, Coahuila",
    region: "Comarca Lagunera",
    regionIcon: "🌵",
    discoveries: "10 / 100",
    coords: { x: 30, y: 71 },
    fact: "¿Sabías que hay un pan muy exquisito, barato y exclusivo que solo existe en la Región Lagunera? ¡Ese es el Pan Francés! 🥖",
  },
  {
    id: "francisco-madero",
    name: "Fco. I. Madero, Coahuila",
    region: "Comarca Lagunera",
    regionIcon: "🌵",
    discoveries: "8 / 100",
    coords: { x: 17, y: 73 },
    fact: "Francisco I. Madero es conocido como el alma de la laguna. Su suelo ferruginoso produce las uvas más dulces de la región. 🍑",
  },
  {
    id: "torreon",
    name: "Torreón, Coahuila",
    region: "Comarca Lagunera",
    regionIcon: "🌵",
    discoveries: "15 / 100",
    coords: { x: 16, y: 92 },
    fact: "Torreón es la ciudad más grande de la región lagunera y alberga el famoso Museo Arocena, uno de los mejores de México. 🏛️",
  },
  {
    id: "saltillo",
    name: "Saltillo, Coahuila",
    region: "Sierras",
    regionIcon: "🌵",
    discoveries: "12 / 100",
    coords: { x: 62, y: 89 },
    fact: "En Saltillo se tejen los sarapes más famosos del país. Hilo a hilo, cada pieza es una obra de arte única y colorida. 🧵",
  },
  {
    id: "acuna",
    name: "Acuña, Coahuila",
    region: "Frontera Norte",
    regionIcon: "🌵",
    discoveries: "6 / 100",
    coords: { x: 42, y: 9 },
    fact: "Ciudad Acuña comparte el Río Bravo con Del Río, Texas, y es famosa por su vibrante cultura norteña y sus puentes internacionales. 🌊",
  },
  {
    id: "monclova",
    name: "Monclova, Coahuila",
    region: "Centro Industrial",
    regionIcon: "🌵",
    discoveries: "9 / 100",
    coords: { x: 62, y: 57 },
    fact: "Monclova es la capital siderúrgica de México. La planta AHMSA produce más del 40% del acero nacional. ⚙️",
  },
  {
    id: "piedras-negras",
    name: "Piedras Negras, Coahuila",
    region: "Frontera Norte",
    regionIcon: "🌵",
    discoveries: "7 / 100",
    coords: { x: 76, y: 30 },
    fact: "Piedras Negras es la cuna de los nachos. En 1943, Ignacio 'Nacho' Anaya los inventó aquí para unas clientas hambrientas. 🧀",
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

export interface Sticker {
  id: string;
  name: string;
  scientific: string;
  description: string;
  unlocked: boolean;
  image: string;
  rarity?: string;
  price?: number;
}

export interface Category {
  id: string;
  title: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  badge: string;
  percent: number;
  borderColor: string;
  textColor: string;
  progressBg: string;
  items: Sticker[];
}

// Mock Stickers & Categories Data
const CATEGORIES_DATA: Category[] = [
  {
    id: "estados",
    title: "Estados",
    icon: Map,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    badge: "0 / 38",
    percent: 0,
    borderColor: "border-pink-200",
    textColor: "text-[#70003c]",
    progressBg: "bg-pink-600",
    items: [
      { id: "coahuila", name: "Coahuila", scientific: "Saltillo & Torreón", description: "Estado de desiertos y rica historia industrial. Región norte de México.", unlocked: false, image: "🌵", rarity: "Estado" },
      { id: "yucatan", name: "Yucatán", scientific: "Mérida", description: "Cuna de la cultura maya, selvas y cenotes turquesas.", unlocked: false, image: "🌴", rarity: "Estado" },
      { id: "jalisco", name: "Jalisco", scientific: "Guadalajara", description: "Tierra del mariachi y el tequila, con hermosos valles.", unlocked: false, image: "🎸", rarity: "Estado" },
      { id: "oaxaca", name: "Oaxaca", scientific: "Oaxaca de Juárez", description: "Corazón cultural y megadiverso con sierras y tradiciones únicas.", unlocked: false, image: "🏺", rarity: "Estado" },
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
      { id: "oso", name: "El Oso Negro", scientific: "Ursus americanus eremicus", description: "El oso negro es el carnívoro más grande de México. Es habitante de la Sierra del Carmen en Coahuila y es un símbolo emblemático de conservación en la región norte.", unlocked: false, image: "/sticker-oso-negro.png", rarity: "Raro", price: 150 },
      { id: "ajolote", name: "Ajolote", scientific: "Ambystoma mexicanum", description: "Anfibio endémico de Xochimilco, maestro de la regeneración.", unlocked: false, image: "🦎", rarity: "Común" },
      { id: "aguila", name: "Águila Real", scientific: "Aquila chrysaetos", description: "Símbolo patrio de México, habita en zonas montañosas.", unlocked: false, image: "🦅", rarity: "Común" },
      { id: "monarca", name: "Mariposa Monarca", scientific: "Danaus plexippus", description: "Viaja miles de kilómetros cada año hasta los bosques de Michoacán.", unlocked: false, image: "🦋", rarity: "Común" },
      { id: "jaguar", name: "Jaguar", scientific: "Panthera onca", description: "El felino más grande de América, sagrado para los mayas.", unlocked: false, image: "🐆", rarity: "Épico" },
      { id: "guajolote", name: "El Guajolote", scientific: "Meleagris gallopavo", description: "El pavo o guajolote es un ave nativa de México, domesticada desde la época prehispánica por los aztecas y mayas. Símbolo culinario y festivo del país.", unlocked: false, image: "/el-guajolote.png", rarity: "Común", price: 120 },
    ]
  },
  {
    id: "flores",
    title: "Flora",
    icon: Flower,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-700",
    badge: "20 / 40",
    percent: 50,
    borderColor: "border-yellow-200",
    textColor: "text-amber-800",
    progressBg: "bg-yellow-600",
    items: [
      { id: "gobernadora", name: "Gobernadora", scientific: "Larrea tridentata", description: "Arbusto perenne emblemático del desierto mexicano, conocido por su característico aroma a tierra mojada tras las lluvias y su resistencia legendaria.", unlocked: false, image: "/sticker-gobernadora.png", rarity: "Desértico", price: 100 },
      { id: "tunas", name: "Tunas", scientific: "Opuntia ficus-indica", description: "Símbolo nacional de México, sus pencas y tunas dulces y jugosas maduran bajo el sol del desierto, siendo parte de nuestra bandera y base esencial de la gastronomía mexicana.", unlocked: false, image: "/sticker-tunas.png", rarity: "Común", price: 80 },
      { id: "dalia", name: "Dalia", scientific: "Dahlia coccinea", description: "Flor nacional de México desde 1963, símbolo de la biodiversidad mexicana.", unlocked: false, image: "🌸", rarity: "Nacional" },
      { id: "cempasuchil", name: "Cempasúchil", scientific: "Tagetes erecta", description: "La flor de los muertos, ilumina el camino de las almas en noviembre.", unlocked: false, image: "🌼", rarity: "Común" },
      { id: "nochebuena", name: "Nochebuena", scientific: "Euphorbia pulcherrima", description: "Originaria de Guerrero, embellece la navidad en todo el mundo.", unlocked: false, image: "🌺", rarity: "Común" },
      { id: "jacaranda", name: "Jacaranda", scientific: "Jacaranda mimosifolia", description: "Pinta de morado la CDMX cada primavera, símbolo de amistad internacional.", unlocked: false, image: "💜", rarity: "Común" },
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
      { id: "reliquia", name: "La Reliquia", scientific: "Comida Típica Lagunera", description: "La reliquia es una comida típica en la región lagunera, sobretodo, después de reuniones catolicas donde se benera y reza a imagenes de la religión, se les hace danzas y regalan la comida a las personas que fueron al \"Rosario\".", unlocked: false, image: "/sticker-reliquia.png", rarity: "Tradicional", price: 200 },
      { id: "lonche", name: "Lonche", scientific: "Pan Francés Preparado", description: "El tradicional emparedado de pan francés lagunero, relleno de jamón, carnitas o aguacate, todo un clásico de la región.", unlocked: false, image: "/sticker-lonche.png", rarity: "Regional", price: 120 },
      { id: "pan_frances", name: "Pan Francés", scientific: "Comarca Lagunera", description: "El clásico pan crujiente y barato exclusivo de Torreón y la Laguna.", unlocked: false, image: "🍞", rarity: "Común" },
      { id: "mole", name: "Mole Poblano", scientific: "Puebla", description: "Exquisita salsa tradicional hecha de chocolate, chiles y especias.", unlocked: false, image: "🍛", rarity: "Común" },
      { id: "tacos", name: "Tacos al Pastor", scientific: "Ciudad de México", description: "Delicioso trompo de carne con adobo, piña, cebolla y cilantro.", unlocked: false, image: "🌮", rarity: "Común" },
      { id: "cochinita", name: "Cochinita Pibil", scientific: "Yucatán", description: "Cerdo adobado en achiote cocido bajo tierra en hojas de plátano.", unlocked: false, image: "🥩", rarity: "Común" },
    ]
  }
];

export interface MexicanState {
  id: string;
  name: string;
  unlocked: boolean;
  logo: string;
  color: string;
  spineColor: string;
}

const MEXICAN_STATES: MexicanState[] = [
  { id: "coahuila", name: "Coahuila", unlocked: true, logo: "🌵", color: "from-amber-400 to-orange-500", spineColor: "border-l-amber-700" },
  { id: "aguascalientes", name: "Aguascalientes", unlocked: false, logo: "🍇", color: "from-pink-400 to-rose-500", spineColor: "border-l-pink-700" },
  { id: "bajacalifornia", name: "Baja California", unlocked: false, logo: "🌊", color: "from-blue-400 to-cyan-500", spineColor: "border-l-blue-700" },
  { id: "bajacaliforniasur", name: "Baja California Sur", unlocked: false, logo: "🐋", color: "from-teal-400 to-emerald-500", spineColor: "border-l-teal-700" },
  { id: "campeche", name: "Campeche", unlocked: false, logo: "🏰", color: "from-indigo-400 to-purple-500", spineColor: "border-l-indigo-700" },
  { id: "chiapas", name: "Chiapas", unlocked: false, logo: "🐆", color: "from-green-500 to-emerald-600", spineColor: "border-l-green-700" },
  { id: "chihuahua", name: "Chihuahua", unlocked: false, logo: "🐕", color: "from-yellow-500 to-amber-600", spineColor: "border-l-yellow-700" },
  { id: "colima", name: "Colima", unlocked: false, logo: "🌋", color: "from-orange-400 to-red-500", spineColor: "border-l-orange-700" },
  { id: "durango", name: "Durango", unlocked: false, logo: "🦂", color: "from-amber-600 to-yellow-700", spineColor: "border-l-amber-800" },
  { id: "guanajuato", name: "Guanajuato", unlocked: false, logo: "🐸", color: "from-lime-400 to-green-500", spineColor: "border-l-lime-700" },
  { id: "guerrero", name: "Guerrero", unlocked: false, logo: "🌅", color: "from-rose-400 to-red-500", spineColor: "border-l-rose-700" },
  { id: "hidalgo", name: "Hidalgo", unlocked: false, logo: "⛰️", color: "from-emerald-400 to-teal-600", spineColor: "border-l-emerald-700" },
  { id: "jalisco", name: "Jalisco", unlocked: false, logo: "🎸", color: "from-sky-400 to-blue-600", spineColor: "border-l-sky-700" },
  { id: "mexico", name: "Edo. de México", unlocked: false, logo: "🌲", color: "from-green-400 to-emerald-600", spineColor: "border-l-green-700" },
  { id: "michoacan", name: "Michoacán", unlocked: false, logo: "🦋", color: "from-purple-400 to-pink-500", spineColor: "border-l-purple-700" },
  { id: "morelos", name: "Morelos", unlocked: false, logo: "⛲", color: "from-cyan-400 to-teal-500", spineColor: "border-l-cyan-700" },
  { id: "nayarit", name: "Nayarit", unlocked: false, logo: "🌴", color: "from-teal-300 to-emerald-500", spineColor: "border-l-teal-600" },
  { id: "nuevoleon", name: "Nuevo León", unlocked: false, logo: "🦁", color: "from-blue-500 to-indigo-600", spineColor: "border-l-blue-700" },
  { id: "oaxaca", name: "Oaxaca", unlocked: false, logo: "🏺", color: "from-amber-500 to-orange-700", spineColor: "border-l-amber-700" },
  { id: "puebla", name: "Puebla", unlocked: false, logo: "🎨", color: "from-violet-400 to-purple-600", spineColor: "border-l-violet-700" },
  { id: "queretaro", name: "Querétaro", unlocked: false, logo: "⛪", color: "from-rose-300 to-pink-500", spineColor: "border-l-rose-600" },
  { id: "quintanaroo", name: "Quintana Roo", unlocked: false, logo: "🏖️", color: "from-cyan-300 to-blue-500", spineColor: "border-l-cyan-600" },
  { id: "sanluispotosi", name: "San Luis Potosí", unlocked: false, logo: "🏰", color: "from-orange-300 to-amber-500", spineColor: "border-l-orange-500" },
  { id: "sinaloa", name: "Sinaloa", unlocked: false, logo: "🍅", color: "from-red-400 to-rose-500", spineColor: "border-l-red-600" },
  { id: "sonora", name: "Sonora", unlocked: false, logo: "☀️", color: "from-yellow-400 to-orange-500", spineColor: "border-l-yellow-600" },
  { id: "tabasco", name: "Tabasco", unlocked: false, logo: "🍌", color: "from-green-400 to-lime-500", spineColor: "border-l-green-600" },
  { id: "tamaulipas", name: "Tamaulipas", unlocked: false, logo: "🤠", color: "from-amber-600 to-yellow-700", spineColor: "border-l-amber-800" },
  { id: "tlaxcala", name: "Tlaxcala", unlocked: false, logo: "🌽", color: "from-rose-500 to-red-600", spineColor: "border-l-rose-700" },
  { id: "veracruz", name: "Veracruz", unlocked: false, logo: "☕", color: "from-blue-600 to-indigo-700", spineColor: "border-l-blue-800" },
  { id: "yucatan", name: "Yucatán", unlocked: false, logo: "🌴", color: "from-teal-400 to-green-500", spineColor: "border-l-teal-650" },
  { id: "zacatecas", name: "Zacatecas", unlocked: false, logo: "⛰️", color: "from-stone-400 to-gray-500", spineColor: "border-l-stone-600" },
  { id: "cdmx", name: "CDMX", unlocked: false, logo: "🦎", color: "from-pink-500 to-fuchsia-600", spineColor: "border-l-pink-700" },
];
// ── Tienda Banner Carousel ──────────────────────────────────────────────────
const BANNER_SLIDES = [
  {
    id: 0,
    bg: "linear-gradient(135deg, #e8006a 0%, #ff4fa3 60%, #c20059 100%)",
    content: (
      <div className="flex flex-col items-center justify-center h-full py-5 px-4 gap-2">
        <img src="/logo-flores.png" alt="Flores de México" className="h-20 w-auto drop-shadow-xl" />
        <p className="text-white/80 text-xs font-bold tracking-wide">¡Bienvenid@ a la Tienda!</p>
      </div>
    ),
  },
  {
    id: 1,
    bg: "linear-gradient(135deg, #7c3aed 0%, #a855f7 60%, #6d28d9 100%)",
    content: (
      <div className="flex flex-col items-center justify-center h-full py-5 px-6 gap-2 text-center">
        <span className="text-4xl">🎟️</span>
        <p className="text-white font-black text-base leading-tight">¡Boleto Dorado!</p>
        <p className="text-purple-100 text-xs font-semibold">Viaja sin límites por 24 horas por solo $4.99</p>
      </div>
    ),
  },
  {
    id: 2,
    bg: "linear-gradient(135deg, #0d9488 0%, #14b8a6 60%, #0f766e 100%)",
    content: (
      <div className="flex flex-col items-center justify-center h-full py-5 px-6 gap-2 text-center">
        <span className="text-4xl">✨</span>
        <p className="text-white font-black text-base leading-tight">Nuevos trajes disponibles</p>
        <p className="text-teal-100 text-xs font-semibold">Nuevo Outfit vibrante para Coahuila disponible</p>
      </div>
    ),
  },
];

const TOTAL_MEXICAN_STATES = 32;
const CURRENT_MUNICIPALITY_ID = "san-pedro";

function getStoredVisitedMunicipalityIds() {
  if (typeof window === "undefined") return [];

  try {
    const stored = JSON.parse(localStorage.getItem("visitedMunicipalityIds") || "[]");
    const visitedIds = Array.isArray(stored) ? stored.filter((id): id is string => typeof id === "string") : [];
    if (visitedIds.length > 0) return visitedIds;
    return localStorage.getItem("isMuseoMaderoUnlocked") === "true" ? [CURRENT_MUNICIPALITY_ID] : [];
  } catch {
    return localStorage.getItem("isMuseoMaderoUnlocked") === "true" ? [CURRENT_MUNICIPALITY_ID] : [];
  }
}

function TiendaBanner() {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoPlay = () => {
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 3500);
  };

  const stopAutoPlay = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, []);

  const goTo = (idx: number) => {
    stopAutoPlay();
    setCurrent(idx);
    startAutoPlay();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    stopAutoPlay();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      setCurrent((prev) =>
        delta < 0
          ? (prev + 1) % BANNER_SLIDES.length
          : (prev - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length
      );
    }
    touchStartX.current = null;
    startAutoPlay();
  };

  const slide = BANNER_SLIDES[current];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden mb-5 select-none" style={{ minHeight: 130 }}>
      {/* Slide background with smooth transition */}
      <div
        className="absolute inset-0 transition-all duration-500 ease-in-out"
        style={{ background: slide.bg }}
      />
      {/* Dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "22px 22px" }}
      />
      {/* Slide content */}
      <div
        className="relative z-10 h-full"
        style={{ minHeight: 130 }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {slide.content}
      </div>
      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {BANNER_SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current ? "w-5 h-1.5 bg-white opacity-95" : "w-1.5 h-1.5 bg-white opacity-40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
// ────────────────────────────────────────────────────────────────────────────

// ── Outfits / Ropa de Personajes Data ──────────────────────────────────────
interface Outfit {
  id: string;
  name: string;
  state: string;
  price: number;
  image: string;
  badge?: string;
  description: string;
  funFact: string;
  rarity: string;
}

const OUTFITS_DATA: Outfit[] = [
  {
    id: "coahuila-vaquera",
    name: "Coahuila Vaquera",
    state: "Coahuila",
    price: 450,
    image: "/coahuila-vaquera.png",
    badge: "Nuevo",
    rarity: "Raro",
    description: "Coahuila se viste a la moda vaquera: Sombrero de ala ancha, botas de piel, chaqueta con print de vaca y falda con lentejuelas.",
    funFact: "¿Sabías que la cultura vaquera es una de las más importantes del norte de México? En Coahuila es muy común ver personas montando a caballo y portando ropa vaquera en su vida diaria.",
  },
  {
    id: "coahuila-santos",
    name: "Coahuila Santos Laguna",
    state: "Coahuila",
    price: 600,
    image: "/coahuila-santos.png",
    badge: undefined,
    rarity: "Épico",
    description: "¡Apoya al equipo Santos Laguna con este outfit oficial! Camiseta verde y blanca del equipo lagunero, shorts deportivos y calcetas del club.",
    funFact: "¿Sabías que Santos Laguna es el equipo de fútbol más popular de la Comarca Lagunera? Fue fundado en 1983 y representa tanto a Torreón, Coahuila como a Gómez Palacio, Durango.",
  },
];
// ────────────────────────────────────────────────────────────────────────────

const DEFAULT_COAHUILA_OUTFIT_IMAGE = "/coahuila-default.png";

interface UserCosmetics {
  purchasedOutfits: string[];
  equippedOutfit: string | null;
}

function getCoahuilaOutfitImage(outfitId: string | null) {
  if (!outfitId) return DEFAULT_COAHUILA_OUTFIT_IMAGE;
  return OUTFITS_DATA.find((outfit) => outfit.id === outfitId)?.image || DEFAULT_COAHUILA_OUTFIT_IMAGE;
}

function getStoredUserCosmetics(): UserCosmetics {
  if (typeof window === "undefined") {
    return { purchasedOutfits: [], equippedOutfit: null };
  }

  const storedAuthUser = localStorage.getItem("authUser") || sessionStorage.getItem("authUser");
  if (!storedAuthUser) {
    return { purchasedOutfits: [], equippedOutfit: null };
  }

  try {
    const user = JSON.parse(storedAuthUser) as Partial<UserCosmetics>;
    return {
      purchasedOutfits: Array.isArray(user.purchasedOutfits) ? user.purchasedOutfits : [],
      equippedOutfit: typeof user.equippedOutfit === "string" ? user.equippedOutfit : null,
    };
  } catch {
    return { purchasedOutfits: [], equippedOutfit: null };
  }
}

function saveStoredUserCosmetics(cosmetics: UserCosmetics) {
  if (typeof window === "undefined") return;

  const storage =
    sessionStorage.getItem("authUser") && !localStorage.getItem("authUser")
      ? sessionStorage
      : localStorage.getItem("authUser")
        ? localStorage
        : null;

  if (!storage) return;

  const storedAuthUser = storage.getItem("authUser");
  if (!storedAuthUser) return;

  try {
    const user = JSON.parse(storedAuthUser);
    storage.setItem("authUser", JSON.stringify({ ...user, ...cosmetics }));
  } catch {
    // Ignore malformed legacy sessions; in-memory state still works for this visit.
  }
}

function JugarPage() {


  const navigate = useNavigate();
  const { musicEnabled, setMusicEnabled, sfxEnabled, setSfxEnabled, playSfx } = useGameAudio();
  const [activeTab, setActiveTab] = useState<"jugar" | "coleccion" | "tienda" | "perfil">("jugar");
  const [selectedState, setSelectedState] = useState(STATES_DATA[0]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES_DATA);
  const [selectedShopCategory, setSelectedShopCategory] = useState<string | null>(null);
  const [purchasedOutfits, setPurchasedOutfits] = useState<string[]>(() => getStoredUserCosmetics().purchasedOutfits);
  const [equippedOutfit, setEquippedOutfit] = useState<string | null>(() => getStoredUserCosmetics().equippedOutfit);
  const coahuilaSprite = getCoahuilaOutfitImage(equippedOutfit);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const authUser = localStorage.getItem("authUser") || sessionStorage.getItem("authUser");
    if (!authUser) {
      toast.error("Inicia sesión para jugar.");
      navigate({ to: "/login" });
    }
  }, [navigate]);

  const updateCosmetics = (nextPurchasedOutfits: string[], nextEquippedOutfit: string | null) => {
    setPurchasedOutfits(nextPurchasedOutfits);
    setEquippedOutfit(nextEquippedOutfit);
    saveStoredUserCosmetics({
      purchasedOutfits: nextPurchasedOutfits,
      equippedOutfit: nextEquippedOutfit,
    });
  };

  const handleBuyOutfit = (outfit: Outfit) => {
    if (purchasedOutfits.includes(outfit.id)) return;

    if (coins < outfit.price) {
      toast.error("Saldo insuficiente", {
        description: "No tienes suficientes monedas MXN para comprar este outfit.",
      });
      return;
    }

    const nextPurchasedOutfits = [...purchasedOutfits, outfit.id];
    setCoins((prev) => prev - outfit.price);
    updateCosmetics(nextPurchasedOutfits, equippedOutfit);
    toast.success(`¡Compraste ${outfit.name}!`, {
      description: "Ahora puedes equiparlo desde la tienda.",
    });
  };

  const handleEquipOutfit = (outfit: Outfit) => {
    if (!purchasedOutfits.includes(outfit.id)) return;

    updateCosmetics(purchasedOutfits, outfit.id);
    toast.success(`${outfit.name} equipado`, {
      description: "COAHUILA usará este outfit en el diálogo.",
    });
  };

  const handleUnequipOutfit = (outfit: Outfit) => {
    updateCosmetics(purchasedOutfits, null);
    toast.success(`${outfit.name} desequipado`, {
      description: "COAHUILA volvió a su traje tradicional.",
    });
  };

  const renderOutfitActionButton = (outfit: Outfit, size: "compact" | "full" = "full") => {
    const isPurchased = purchasedOutfits.includes(outfit.id);
    const isEquipped = equippedOutfit === outfit.id;
    const compactClasses = "h-8 rounded-full px-3 text-[10px]";
    const fullClasses = "w-full rounded-full py-2.5 text-xs";
    const className = `${
      size === "compact" ? compactClasses : fullClasses
    } font-black text-white shadow transition active:scale-95 cursor-pointer`;

    if (!isPurchased) {
      return (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleBuyOutfit(outfit);
          }}
          className={`${className} bg-[#d80073] hover:bg-[#b5005e]`}
        >
          Comprar
        </button>
      );
    }

    if (!isEquipped) {
      return (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleEquipOutfit(outfit);
          }}
          className={`${className} bg-teal-600 hover:bg-teal-700`}
        >
          Equipar
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          handleUnequipOutfit(outfit);
        }}
        className={`${className} bg-gray-700 hover:bg-gray-800`}
      >
        Desequipar
      </button>
    );
  };

  const renderNavButton = (tab: "jugar" | "coleccion" | "tienda" | "perfil", Icon: any, label: string) => {
    const isActive = activeTab === tab;
    return (
      <button
        onClick={() => {
          if (tab === "coleccion") {
            setSelectedCategory(null);
          }
          if (tab !== "tienda") {
            setSelectedShopCategory(null);
          }
          if (tab !== "jugar") {
            setIsGameActive(false);
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

  // Tutorial Dialog State
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialPage, setTutorialPage] = useState(0);

  // Share Dialog State
  const [shareOpen, setShareOpen] = useState(false);

  // Selected State Album State
  const [selectedStateAlbum, setSelectedStateAlbum] = useState<string | null>(null);

  // Selected Sticker Modal State
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [ropaViewOpen, setRopaViewOpen] = useState(false);

  // User profile states
  const [usernameState, setUsernameState] = useState(() => {
    if (typeof window !== "undefined") {
      const hasTemporarySession = sessionStorage.getItem("authUser") && !localStorage.getItem("authUser");
      const saved = hasTemporarySession
        ? sessionStorage.getItem("username")
        : localStorage.getItem("username") || sessionStorage.getItem("username");
      return saved ? saved.replace(/@/g, "") : "explorador_botanico";
    }
    return "explorador_botanico";
  });
  const [avatarState, setAvatarState] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("avatar") || "";
    }
    return "";
  });

  // Edit profile states
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [tempUsername, setTempUsername] = useState(usernameState);
  const [tempAvatar, setTempAvatar] = useState(avatarState);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenEditProfile = () => {
    setTempUsername(usernameState);
    setTempAvatar(avatarState);
    setProfileEditOpen(true);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("La imagen es demasiado grande", {
          description: "Por favor selecciona una imagen menor a 2MB."
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    const cleaned = tempUsername.replace(/@/g, "").trim();
    if (!cleaned) {
      toast.error("El nombre de explorador no puede estar vacío");
      return;
    }
    setUsernameState(cleaned);
    setAvatarState(tempAvatar);
    if (sessionStorage.getItem("authUser") && !localStorage.getItem("authUser")) {
      sessionStorage.setItem("username", cleaned);
    } else {
      localStorage.setItem("username", cleaned);
    }
    localStorage.setItem("avatar", tempAvatar);
    setProfileEditOpen(false);
  };

  // Visual Novel gameplay states
  const [isGameActive, setIsGameActive] = useState(false);
  const [visualNovelStep, setVisualNovelStep] = useState(0);
  const [guidebookOpen, setGuidebookOpen] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // New progression and level states
  const [isMuseoMaderoUnlocked, setIsMuseoMaderoUnlocked] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("isMuseoMaderoUnlocked") === "true";
    }
    return false;
  });
  const [levelBackground, setLevelBackground] = useState("/museo-madero.jpg");
  const [userHungryChoice, setUserHungryChoice] = useState<boolean | null>(null);
  const [showHungryChoices, setShowHungryChoices] = useState(false);
  const [levelCompletedOverlayOpen, setLevelCompletedOverlayOpen] = useState(false);
  const [showLoncheImage, setShowLoncheImage] = useState(false);
  const [, setVisitedMunicipalityIds] = useState<string[]>(() => getStoredVisitedMunicipalityIds());
  const [municipiosDescubiertos, setMunicipiosDescubiertos] = useState(() => {
    if (typeof window !== "undefined") {
      return getStoredVisitedMunicipalityIds().length;
    }
    return 0;
  });

  const visualNovelDialogue = [
    "¡Hola explorador! Te doy la bienvenida a San Pedro, Coahuila. Aquí se encuentra el histórico Museo Madero. 🌸",
    "Francisco I. Madero vivió aquí y escribió gran parte de su célebre libro 'La Sucesión Presidencial'. ¡San Pedro es el origen y cuna de la Revolución! 🍇",
    "Antes de continuar, recuerda que puedes presionar el botón de la Cámara (📸) para tomarnos una foto, o el Librito (📖) para consultar información sobre la flora y fauna.",
    "Por cierto... ¿no tienes un poco de hambre? Viajar por Coahuila siempre abre el apetito. 😋",
    userHungryChoice === true
      ? "¡Excelente! Vamos al Mercado Benito Juárez. Aquí visitaremos la lonchería súper popular 'Los Súper Sabios' para pedir un lonche de puerco riquísimo. ¡Toda una tradición!"
      : "¡Pues yo sí! Jeje. Acompáñame de todos modos al Mercado Benito Juárez. Iremos a la lonchería súper popular 'Los Súper Sabios' para comer un lonche de puerco. ¡Te va a encantar!",
    "¡Estuvo riquísimo! Ahora que tenemos energía, debemos ir a la central de autobuses para tomar un camión Ejidales directo al siguiente municipio: Francisco I. Madero, conocido como el alma de la laguna. 🚌",
    "¡Aquí termina este tramo de nuestro viaje! ¡Buen viaje al siguiente municipio, explorador! 🎒"
  ];

  // Auto-trigger choices menu when step is 3
  useEffect(() => {
    if (isGameActive && visualNovelStep === 3) {
      setShowHungryChoices(true);
    } else {
      setShowHungryChoices(false);
    }
  }, [visualNovelStep, isGameActive]);

  // Typewriter effect logic
  const playSfxRef = useRef(playSfx);
  useEffect(() => { playSfxRef.current = playSfx; });
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isGameActive) {
      setTypedText("");
      setIsTyping(false);
      return;
    }

    const dialogue = visualNovelDialogue[visualNovelStep] || "";
    setTypedText("");
    setIsTyping(true);

    let currentIndex = 0;
    let delay = 30; // Normal
    if (textSpeed === "Lento") delay = 60;
    if (textSpeed === "Rápido") delay = 12;

    const intervalId = setInterval(() => {
      if (currentIndex < dialogue.length) {
        const nextChar = dialogue[currentIndex];
        setTypedText((prev) => prev + nextChar);

        // Play text typing SFX (only for non-whitespace characters)
        if (nextChar.trim()) {
          playSfxRef.current("text");
        }

        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(intervalId);
        typewriterRef.current = null;
      }
    }, delay);

    typewriterRef.current = intervalId;

    return () => {
      clearInterval(intervalId);
      typewriterRef.current = null;
    };
  }, [visualNovelStep, isGameActive, textSpeed]);

  const handleDownloadBackground = () => {
    const link = document.createElement("a");
    link.href = levelBackground;
    const filename = levelBackground.split("/").pop() || "background.jpg";
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("¡Foto guardada!", {
      description: `La imagen se ha guardado en tu galería de descargas.`,
    });
  };

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
      setVisualNovelStep(0);
      setLevelBackground("/museo-madero.jpg");
      setUserHungryChoice(null);
      setShowHungryChoices(false);
      setShowLoncheImage(false);
      setIsGameActive(true);
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
    const textToCopy = `¡Estoy en ${selectedState.name}! ${selectedState.fact} Descubre más en ${appLink}`;
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
    <>
      <SetGameMusicTrack track={isGameActive ? "visual-novel" : "hub"} />
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
          isGameActive ? (
            /* Visual Novel Screen */
            <div className="relative w-full h-[520px] rounded-3xl overflow-hidden border-2 border-pink-300 bg-[#f7f1ea] shadow-lg animate-fade-in">
              {/* Blurred background image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-500 scale-110 filter blur-[4px] opacity-90"
                style={{ backgroundImage: `url('${levelBackground}')` }}
              />
              <div className="absolute inset-0 bg-black/15 z-0" />

              {/* Back Button */}
              <button
                onClick={() => setIsGameActive(false)}
                aria-label="Volver al mapa"
                className="absolute top-4 left-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-pink-700 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="h-5 w-5 stroke-[3]" />
              </button>

              {/* Character Coahuila */}
              <img
                src={coahuilaSprite}
                alt={equippedOutfit ? `Coahuila con outfit ${equippedOutfit}` : "Coahuila con traje tradicional"}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[82%] object-contain select-none z-10 pointer-events-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)] animate-fade-in-slide-up"
              />

              {/* Floating Action Buttons: Camera and Book */}
              <div className="absolute right-4 bottom-28 z-20 flex flex-col gap-3">
                {/* Book / Diary Button */}
                <button
                  onClick={() => setGuidebookOpen(true)}
                  aria-label="Diario de viaje de Coahuila"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fdfaf6] border-2 border-pink-200 shadow-lg text-pink-600 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                >
                  <BookOpen className="h-5.5 w-5.5" />
                </button>

                {/* Camera / Save photo Button */}
                <button
                  onClick={handleDownloadBackground}
                  aria-label="Guardar foto de fondo"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fdfaf6] border-2 border-pink-200 shadow-lg text-pink-600 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                >
                  <Camera className="h-5.5 w-5.5" />
                </button>
              </div>

              {/* Lonche Image Fullscreen Overlay */}
              {showLoncheImage && (
                <div
                  onClick={() => {
                    playSfx("little");
                    setShowLoncheImage(false);
                    setVisualNovelStep(5);
                  }}
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 cursor-pointer animate-fade-in"
                >
                  <img
                    src="/lonche-puerco.png"
                    alt="Lonche de puerco de Los Súper Sabios"
                    className="max-h-[65%] max-w-[85%] object-contain rounded-2xl shadow-2xl drop-shadow-[0_8px_32px_rgba(0,0,0,0.6)] animate-fade-in-slide-up"
                  />
                  <p className="mt-4 text-white text-xs font-black tracking-wide bg-black/50 rounded-full px-4 py-1.5 animate-bounce">
                    Toca para continuar ▶
                  </p>
                </div>
              )}

              {/* Dialogue Box */}
              <div 
                onClick={() => {
                  if (showHungryChoices) return;
                  playSfx("little");
                  if (isTyping) {
                    // Cancel the running interval immediately before setting full text
                    if (typewriterRef.current) {
                      clearInterval(typewriterRef.current);
                      typewriterRef.current = null;
                    }
                    setTypedText(visualNovelDialogue[visualNovelStep]);
                    setIsTyping(false);
                  } else {
                    if (visualNovelStep === 4) {
                      setShowLoncheImage(true);
                      try {
                        const dripAudio = new Audio("/audio/sfx.wav");
                        dripAudio.volume = 1.0;
                        dripAudio.load();
                        dripAudio.play().catch((err) => console.error("sfx.wav error:", err));
                      } catch (e) {
                        console.error("sfx.wav excepción:", e);
                      }
                      return;
                    }
                    if (visualNovelStep < visualNovelDialogue.length - 1) {
                      setVisualNovelStep(prev => prev + 1);
                    } else {
                      setVisualNovelStep(0);
                      setIsGameActive(false);

                      // Unlock Museo Madero
                      setIsMuseoMaderoUnlocked(true);
                      localStorage.setItem("isMuseoMaderoUnlocked", "true");

                      // Track unique municipalities visited so replays do not inflate the counter.
                      setVisitedMunicipalityIds(prev => {
                        if (prev.includes(CURRENT_MUNICIPALITY_ID)) {
                          localStorage.setItem("municipiosDescubiertos", String(prev.length));
                          setMunicipiosDescubiertos(prev.length);
                          return prev;
                        }

                        const nextVisited = [...prev, CURRENT_MUNICIPALITY_ID];
                        localStorage.setItem("visitedMunicipalityIds", JSON.stringify(nextVisited));
                        localStorage.setItem("municipiosDescubiertos", String(nextVisited.length));
                        setMunicipiosDescubiertos(nextVisited.length);
                        return nextVisited;
                      });

                      // Unlock Lonche Lagunero in categories state
                      setCategories(prevCategories =>
                        prevCategories.map(c => {
                          if (c.id === "comidas") {
                            return {
                              ...c,
                              items: c.items.map(i =>
                                i.id === "lonche" ? { ...i, unlocked: true } : i
                              )
                            };
                          }
                          return c;
                        })
                      );

                      // Award coins
                      setCoins(prev => prev + 100);

                      // Trigger Completed Overlay
                      setLevelCompletedOverlayOpen(true);
                    }
                  }
                }}
                data-no-jump-sfx="true"
                className="absolute bottom-4 left-4 right-4 z-20 p-4 rounded-2xl bg-[#f7f1ea]/95 border-2 border-pink-300 shadow-md cursor-pointer select-none transition-all hover:bg-[#f7f1ea]"
              >
                {/* Speaker Tag */}
                <span className="absolute -top-3 left-4 rounded-full bg-pink-700 px-3 py-0.5 text-[9px] font-black text-white uppercase tracking-wider shadow-sm">
                  COAHUILA
                </span>

                <p className="text-xs md:text-sm font-extrabold text-gray-800 leading-relaxed min-h-[50px] flex items-center pr-4">
                  "{typedText}"
                </p>

                {showHungryChoices ? (
                  <div className="mt-3 flex gap-2 z-30">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playSfx("little");
                        setUserHungryChoice(true);
                        setLevelBackground("/mercado-benito-juarez.jpg");
                        setVisualNovelStep(4);
                        setShowHungryChoices(false);
                      }}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-[11px] font-black shadow-md transition active:scale-95 cursor-pointer text-center"
                    >
                      Sí, ¡tengo mucha hambre! 🌮
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playSfx("little");
                        setUserHungryChoice(false);
                        setLevelBackground("/mercado-benito-juarez.jpg");
                        setVisualNovelStep(4);
                        setShowHungryChoices(false);
                      }}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-gray-500 hover:bg-gray-600 text-white text-[11px] font-black shadow-md transition active:scale-95 cursor-pointer text-center"
                    >
                      No, pero te acompaño 🎒
                    </button>
                  </div>
                ) : (
                  /* Continue indicator */
                  <div className="absolute right-3 bottom-2.5 animate-bounce">
                    <span className="text-[10px] text-pink-600 font-black">▶</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
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

                {/* Interactive Map with image */}
                <div className="relative w-full rounded-2xl overflow-hidden shadow-inner border border-rose-800" style={{aspectRatio: '4/5'}}>
                  {/* Mapa de Coahuila */}
                  <img
                    src="/mapa-coahuila.jpg"
                    alt="Mapa de municipios de Coahuila"
                    className="absolute inset-0 w-full h-full object-cover select-none"
                    draggable={false}
                  />

                  {/* Overlay oscuro sutil para que los pines resalten */}
                  <div className="absolute inset-0 bg-black/10 pointer-events-none" />

                  {/* Interactive Hotspots - coordenadas en % sobre la imagen */}
                  {STATES_DATA.map((state) => {
                    const isSelected = selectedState.id === state.id;
                    return (
                      <button
                        key={state.id}
                        onClick={() => setSelectedState(state)}
                        style={{
                          left: `${state.coords.x}%`,
                          top: `${state.coords.y}%`,
                        }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 group z-10"
                        title={state.name}
                      >
                        {/* Tooltip on hover */}
                        <span className="absolute bottom-7 left-1/2 -translate-x-1/2 scale-0 rounded-lg bg-white px-2 py-0.5 text-[10px] font-black text-rose-950 shadow-lg transition-all group-hover:scale-100 whitespace-nowrap border border-pink-200">
                          {state.name.split(",")[0]}
                        </span>

                        {/* Pulsing ring on selected */}
                        {isSelected && (
                          <span className="absolute -inset-2 rounded-full border border-pink-400 bg-pink-500/40 animate-ping duration-1000" />
                        )}

                        {/* Pin marker */}
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-full shadow-md border-2 transition-transform duration-300 ${
                            isSelected
                              ? "bg-pink-500 border-white scale-125 text-base"
                              : "bg-white/95 border-pink-500 text-xs hover:scale-110"
                          }`}
                        >
                          {state.regionIcon}
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
                  <div className="text-[10px] font-black tracking-wider text-gray-400">MUNICIPIOS</div>
                  <div className="text-sm font-extrabold text-pink-700">{municipiosDescubiertos} / 38</div>
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
        )
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
                  {categories.map((cat) => {
                    const IconComponent = cat.icon;
                    const unlockedCount = cat.items.filter((i) => i.unlocked).length;
                    const totalCount = cat.items.length;
                    const estadosUnlocked = MEXICAN_STATES.filter(s => s.unlocked).length;
                    const displayBadge =
                      cat.id === "estados"
                        ? `${estadosUnlocked} / ${TOTAL_MEXICAN_STATES}`
                        : `${unlockedCount} / ${totalCount}`;
                    const displayPercent =
                      cat.id === "estados"
                        ? (estadosUnlocked / TOTAL_MEXICAN_STATES) * 100
                        : totalCount > 0
                          ? (unlockedCount / totalCount) * 100
                          : 0;

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
                            {displayBadge}
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
                              style={{ width: `${displayPercent}%` }}
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
                        const daliaSticker = categories.find(c => c.id === "flores")?.items.find(i => i.id === "dalia");
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
                      {MEXICAN_STATES.filter((state) => state.unlocked).length} / {TOTAL_MEXICAN_STATES}
                    </span>
                  </div>

                  {/* Horizontal scrolling grid in two rows */}
                  <div className="grid grid-rows-2 grid-flow-col gap-4 overflow-x-auto pb-4 scrollbar-none snap-x w-full select-none touch-pan-x scroll-smooth">
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
                          className={`relative h-32 w-24 rounded-r-xl rounded-l-md border-y border-r-2 shadow-md transition-all duration-300 hover:scale-105 active:scale-95 flex flex-col items-center justify-center ${
                            state.unlocked
                              ? `bg-gradient-to-br ${state.color} border-pink-300 border-l-[8px] ${state.spineColor} cursor-pointer`
                              : "bg-gray-100 border-gray-300 border-l-[8px] border-l-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {/* Spine shading */}
                          <div className="absolute inset-y-0 left-0 w-0.5 bg-black/15" />
                          
                          {/* Page edges representation on the right side */}
                          <div className="absolute top-1 bottom-1 right-0 w-1 bg-amber-50 rounded-r-md border-l border-amber-200/40 shadow-[inset_1px_0_1px_rgba(0,0,0,0.08)]" />

                          {state.unlocked && (
                            <div className="absolute inset-1.5 border border-amber-400/20 rounded pointer-events-none" />
                          )}

                          {/* Logo on cover - styled like a sticker stuck to the cover */}
                          <div className={`relative flex h-13 w-13 items-center justify-center rounded-full bg-white shadow-md border-2 border-white transform transition-transform duration-300 ${state.unlocked ? 'hover:scale-110 rotate-3' : 'opacity-70 -rotate-3 filter grayscale-[40%]'}`}>
                            <span className="text-2xl filter drop-shadow-sm select-none">{state.logo}</span>
                          </div>

                          {state.unlocked && (
                            <span className="mt-2 text-[7px] font-black tracking-wider text-white bg-black/25 px-1.5 py-0.5 rounded uppercase">
                              ABRIR
                            </span>
                          )}

                          {/* Lock Overlay */}
                          {!state.unlocked && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-r-xl rounded-l-md">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black/30 backdrop-blur-[1px] text-white">
                                <Lock className="h-3 w-3" />
                              </div>
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
                      <span className="text-[10px]">⭐</span> {isMuseoMaderoUnlocked ? 1 : 0} / 6
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
                        <div 
                          className="h-full bg-pink-600 rounded-full transition-all duration-500" 
                          style={{ width: isMuseoMaderoUnlocked ? "16.6%" : "0%" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sticker Album Grid */}
                  <div className="grid grid-cols-2 gap-3.5 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                    {/* Card 01: Museo Madero Dynamic */}
                    {isMuseoMaderoUnlocked ? (
                      <button
                        onClick={() => {
                          setSelectedSticker({
                            id: "coahuila_01",
                            name: "Museo Madero",
                            scientific: "San Pedro, Coahuila",
                            description: "Cuna de la Revolución Mexicana. El histórico edificio donde Francisco I. Madero escribió gran parte de su libro 'La Sucesión Presidencial'.",
                            unlocked: true,
                            image: "/museo-madero.png?v=2026",
                            rarity: "Histórico"
                          });
                        }}
                        className="flex flex-col items-center bg-white border border-pink-200 rounded-2xl p-2 relative shadow-sm hover:scale-[1.03] transition-all"
                      >
                        <div className="absolute top-2 left-2 flex h-5 w-6 items-center justify-center rounded-br-lg rounded-tl-xl text-[9px] font-black text-white bg-[#d80073]">
                          01
                        </div>
                        <div className="aspect-square w-full rounded-xl flex items-center justify-center bg-[#b3f3ed]/25 p-1 overflow-hidden">
                          <img src="/museo-madero.png?v=2026" className="w-full h-full object-contain hover:scale-105 transition-transform" />
                        </div>
                        <span className="text-[10px] font-black text-gray-700 mt-2 truncate max-w-full text-center">
                          Museo Madero (San Pedro)
                        </span>
                      </button>
                    ) : (
                      <div
                        className="flex flex-col items-center justify-center bg-white border border-gray-250 rounded-2xl p-2.5 aspect-square relative shadow-xs animate-pulse"
                      >
                        <div className="absolute top-2 left-2 flex h-5 w-6 items-center justify-center rounded-br-lg rounded-tl-xl text-[9px] font-bold text-gray-400 bg-gray-50 border border-gray-100">
                          01
                        </div>
                        <div className="flex flex-col items-center justify-center gap-1.5 mt-2">
                          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 border border-gray-100/80 text-gray-300">
                            <Lock className="h-4 w-4 text-gray-300" />
                          </div>
                          <span className="text-[9px] font-bold text-gray-400 text-center uppercase tracking-wide">
                            Bloqueado
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Cards 02 to 06: Locked, blank albums with a lock icon */}
                    {[2, 3, 4, 5, 6].map((num) => (
                      <div
                        key={num}
                        className="flex flex-col items-center justify-center bg-white border border-gray-250 rounded-2xl p-2.5 aspect-square relative shadow-xs"
                      >
                        <div className="absolute top-2 left-2 flex h-5 w-6 items-center justify-center rounded-br-lg rounded-tl-xl text-[9px] font-bold text-gray-400 bg-gray-50 border border-gray-100">
                          0{num}
                        </div>
                        
                        {/* Blank slot with lock icon */}
                        <div className="flex flex-col items-center justify-center gap-1.5 mt-2">
                          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 border border-gray-100/80 text-gray-300">
                            <Lock className="h-4 w-4 text-gray-300" />
                          </div>
                          <span className="text-[9px] font-black text-gray-400 tracking-wider">
                            BLOQUEADO
                          </span>
                        </div>
                      </div>
                    ))}
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
              /* 3. Fauna/Flora/Comidas Sticker Albums */
              (() => {
                const currentCat = categories.find((c) => c.id === selectedCategory);
                if (!currentCat) return null;

                const unlockedCount = currentCat.items.filter((i) => i.unlocked).length;
                const totalCount = currentCat.items.length;
                const progressPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

                return (
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
                        {currentCat.title}
                      </h3>
                      <div className="flex items-center gap-1 rounded-full bg-[#d80073] px-3 py-1 text-xs font-extrabold text-white shadow-sm">
                        <span className="text-[10px]">⭐</span> {unlockedCount} / {totalCount}
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
                        {selectedCategory === "fauna"
                          ? "Fauna de la Sierra y Desierto"
                          : selectedCategory === "flores"
                          ? "Flora y Cactáceas"
                          : "Gastronomía Mexicana"}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedCategory === "fauna"
                          ? "Colecciona las especies más icónicas del gran ecosistema nacional y del desierto coahuilense."
                          : selectedCategory === "flores"
                          ? "Descubre la flora nacional de México y de sus desiertos y valles templados."
                          : "Explora la gastronomía regional y los sabores emblemáticos de cada estado de la república."}
                      </p>
                      {/* Progress bar */}
                      <div className="mt-3 space-y-1">
                        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                          <div
                            style={{ width: `${progressPercent}%` }}
                            className="h-full bg-pink-600 rounded-full transition-all duration-300"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Stickers Grid */}
                    <div className="grid grid-cols-2 gap-3.5 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                      {currentCat.items.map((item, index) => {
                        const isImageFile =
                          item.image.startsWith("/") || item.image.endsWith(".png");
                        const displayIndex = String(index + 1).padStart(2, "0");

                        if (item.unlocked) {
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setSelectedSticker({
                                  id: item.id,
                                  name: item.name,
                                  scientific: item.scientific,
                                  description: item.description,
                                  unlocked: true,
                                  image: item.image,
                                  rarity: item.rarity || "Común"
                                });
                              }}
                              className="flex flex-col items-center bg-white border border-pink-200 rounded-2xl p-2 relative shadow-sm hover:scale-[1.03] active:scale-95 transition-all"
                            >
                              <div className="absolute top-2 left-2 flex h-5 w-6 items-center justify-center rounded-br-lg rounded-tl-xl text-[9px] font-black text-white bg-[#d80073]">
                                {displayIndex}
                              </div>
                              <div className="aspect-square w-full rounded-xl flex items-center justify-center bg-[#b3f3ed]/25 p-1 overflow-hidden">
                                {isImageFile ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-contain hover:scale-105 transition-transform"
                                  />
                                ) : (
                                  <span className="text-4xl filter drop-shadow-sm">
                                    {item.image}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] font-black text-gray-700 mt-2 truncate max-w-full text-center">
                                {item.name}
                              </span>
                            </button>
                          );
                        } else {
                          return (
                            <div
                              key={item.id}
                              className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-2xl p-2.5 aspect-square relative shadow-xs"
                            >
                              <div className="absolute top-2 left-2 flex h-5 w-6 items-center justify-center rounded-br-lg rounded-tl-xl text-[9px] font-bold text-gray-400 bg-gray-50 border border-gray-100">
                                {displayIndex}
                              </div>

                              {/* Blank slot with lock icon */}
                              <div className="flex flex-col items-center justify-center gap-1.5 mt-2">
                                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 border border-gray-100/80 text-gray-300">
                                  <Lock className="h-4 w-4 text-gray-300" />
                                </div>
                                <span className="text-[9px] font-black text-gray-400 tracking-wider">
                                  BLOQUEADO
                                </span>
                              </div>
                            </div>
                          );
                        }
                      })}
                    </div>

                    {/* Siguiente página button */}
                    <button
                      onClick={() =>
                        toast.info("No hay más páginas", {
                          description:
                            "¡Completa más álbumes para desbloquear la siguiente página!",
                        })
                      }
                      className="flex w-full items-center justify-center gap-1.5 rounded-full bg-teal-700 py-2.5 text-xs font-black text-white transition hover:bg-teal-800"
                    >
                      Siguiente página →
                    </button>

                    {/* Tips yellow card */}
                    <div className="rounded-2xl bg-amber-50 p-4 border border-amber-100 flex items-start gap-2.5">
                      <span className="text-xl">💡</span>
                      <p className="text-[11px] font-semibold text-amber-800 leading-normal">
                        {selectedCategory === "fauna"
                          ? "¡Sigue explorando los Parques Nacionales y la Sierra del Carmen para encontrar más sobres de fauna!"
                          : selectedCategory === "flores"
                            ? "¡Busca en los desiertos y valles de Coahuila para recolectar más especies de flora!"
                            : "¡Sigue recorriendo los mercados locales y festividades de la Comarca Lagunera para descubrir más platillos!"}
                      </p>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}

        {/* Tienda Tab View */}
        {activeTab === "tienda" && (
          <div className="animate-fade-in-slide-up pb-2">

            {/* ── Vista: Comprar Stickers por Categoría ── */}
            {selectedShopCategory !== null ? (
              (() => {
                const currentCat = categories.find((c) => c.id === selectedShopCategory);
                if (!currentCat) return null;

                // Filtrar stickers que tengan precio
                const stickersForSale = currentCat.items.filter((item) => item.price !== undefined && item.id !== "lonche");

                return (
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setSelectedShopCategory(null)}
                        className="flex items-center gap-1 text-xs font-bold text-pink-700 hover:underline"
                      >
                        <ChevronLeft className="h-4 w-4" /> Volver a Tienda
                      </button>
                      <h3 className="text-base font-extrabold text-gray-800">
                        Stickers de {currentCat.title}
                      </h3>
                      <div className="flex items-center gap-1 rounded-full bg-[#d80073] px-3 py-1 text-xs font-extrabold text-white shadow-sm">
                        <span className="text-[10px]">🏷️</span> {stickersForSale.length} en venta
                      </div>
                    </div>

                    {/* Stickers Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {stickersForSale.map((item) => {
                        const isImageFile =
                          item.image.startsWith("/") || item.image.endsWith(".png");

                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              setSelectedSticker({
                                id: item.id,
                                name: item.name,
                                scientific: item.scientific,
                                description: item.description,
                                unlocked: true, // Habilitar vista completa de detalles
                                image: item.image,
                                rarity: item.rarity || "Común"
                              });
                            }}
                            className="flex flex-col rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden text-left cursor-pointer hover:scale-[1.01] hover:shadow-md active:scale-95 transition-all"
                          >
                            <div className="relative bg-[#f5f5f0] flex items-center justify-center h-40 overflow-hidden p-2">
                              <span className="absolute top-2 right-2 rounded-full bg-pink-100 px-2 py-0.5 text-[9px] font-black text-pink-700">
                                {item.rarity || "Común"}
                              </span>
                              {isImageFile ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-32 object-contain drop-shadow-md"
                                />
                              ) : (
                                <span className="text-5xl filter drop-shadow-md">
                                  {item.image}
                                </span>
                              )}
                            </div>
                            <div className="p-3 flex-1 flex flex-col justify-between">
                              <div className="mb-2">
                                <p className="text-xs font-bold text-gray-800 leading-tight mb-0.5">
                                  {item.name}
                                </p>
                                <p className="text-[9px] italic text-gray-400 font-semibold mb-1">
                                  {item.scientific}
                                </p>
                                <p className="text-[10px] text-gray-500 font-medium leading-relaxed line-clamp-2">
                                  {item.description}
                                </p>
                              </div>
                              <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                                <span className="text-xs font-black text-pink-600">
                                  {item.price} MXN
                                </span>
                                {item.unlocked ? (
                                  <span className="rounded-full bg-emerald-50 border border-emerald-250 px-2 py-1 text-[9px] font-bold text-emerald-600">
                                    Comprado ⚡
                                  </span>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (coins >= (item.price || 0)) {
                                        setCoins((prev) => prev - (item.price || 0));
                                        setCategories((prevCategories) =>
                                          prevCategories.map((c) => {
                                            if (c.id === selectedShopCategory) {
                                              return {
                                                ...c,
                                                items: c.items.map((i) =>
                                                  i.id === item.id ? { ...i, unlocked: true } : i
                                                ),
                                              };
                                            }
                                            return c;
                                          })
                                        );
                                        toast.success(`¡Compraste ${item.name}!`, {
                                          description: `Se han deducido ${item.price} MXN de tu saldo. Ya puedes ver el sticker en tu colección.`,
                                        });
                                      } else {
                                        toast.error("Saldo insuficiente", {
                                          description:
                                            "No tienes suficientes monedas MXN para comprar este sticker.",
                                        });
                                      }
                                    }}
                                    className="rounded-full bg-pink-600 hover:bg-pink-700 text-white text-[10px] font-black px-2.5 py-1 transition active:scale-95 cursor-pointer"
                                  >
                                    Comprar
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()
            ) : ropaViewOpen ? (
              <div className="space-y-4">
                {/* Header con botón Volver */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setRopaViewOpen(false)}
                    className="flex items-center gap-1 text-xs font-bold text-pink-700 hover:underline"
                  >
                    <ChevronLeft className="h-4 w-4" /> Volver a Tienda
                  </button>
                  <h3 className="text-base font-extrabold text-gray-800">Ropa de Personajes</h3>
                  <div className="flex items-center gap-1 rounded-full bg-[#d80073] px-3 py-1 text-xs font-extrabold text-white shadow-sm">
                    <span className="text-[10px]">👗</span> {OUTFITS_DATA.length}
                  </div>
                </div>

                {/* Grid de outfits */}
                <div className="grid grid-cols-2 gap-4">
                  {OUTFITS_DATA.map((outfit) => (
                    <div
                      key={outfit.id}
                      className="flex flex-col rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden text-left"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedOutfit(outfit)}
                        className="relative flex items-end justify-center bg-[#f5f5f0] h-52 overflow-hidden active:scale-95 transition-transform"
                      >
                        {outfit.badge && (
                          <span className="absolute top-2 left-2 bg-[#1aab6d] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {outfit.badge}
                          </span>
                        )}
                        <span className="absolute top-2 right-2 rounded-full bg-pink-100 px-2 py-0.5 text-[9px] font-black text-pink-700">
                          {outfit.rarity}
                        </span>
                        <img
                          src={outfit.image}
                          alt={outfit.name}
                          className="h-48 w-auto object-contain object-bottom drop-shadow-md"
                        />
                      </button>
                      <div className="p-3">
                        <p className="text-xs font-bold text-gray-800 leading-tight mb-0.5">{outfit.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium mb-2">{outfit.state}</p>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-black text-pink-600">{outfit.price} MXN</span>
                          <button
                            type="button"
                            onClick={() => setSelectedOutfit(outfit)}
                            className="text-[10px] font-bold text-pink-500 underline underline-offset-2"
                          >
                            Ver info
                          </button>
                        </div>
                        {renderOutfitActionButton(outfit)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Más próximamente */}
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 flex flex-col items-center gap-2 text-center">
                  <Lock className="h-7 w-7 text-gray-300" />
                  <p className="text-xs font-bold text-gray-400">Más outfits próximamente</p>
                  <p className="text-[10px] text-gray-300">Continúa explorando México para desbloquear más ropa</p>
                </div>
              </div>
            ) : (
              <>
            {/* ── Tablón de Anuncios (Carousel) ── */}
            <TiendaBanner />

            {/* ── Ropa de Personajes ── */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-lg font-black text-gray-900">Ropa de Personajes</h2>
                <button
                  onClick={() => setRopaViewOpen(true)}
                  className="text-xs font-bold text-pink-600 hover:text-pink-800 transition"
                >Ver Todo</button>
              </div>

              {/* Horizontal scrollable cards */}
              <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2">
                {/* Card: Coahuila Vaquera */}
                <div className="flex-shrink-0 w-40 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                  <div className="relative bg-[#f5f5f0] flex items-end justify-center h-44 overflow-hidden">
                    <span className="absolute top-2 left-2 bg-[#1aab6d] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Nuevo</span>
                    <img src="/coahuila-vaquera.png" alt="Coahuila Vaquera" className="h-40 w-auto object-contain object-bottom drop-shadow-md" />
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-bold text-gray-800 leading-tight mb-1">Coahuila Vaquera</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-pink-600">450 MXN</span>
                      <button
                        onClick={() => toast.success("¡Coahuila Vaquera añadida!", { description: "Se han deducido 450 MXN de tu saldo." })}
                        className="hidden"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                      </button>
                      {renderOutfitActionButton(OUTFITS_DATA[0], "compact")}
                    </div>
                  </div>
                </div>

                {/* Card: Coahuila Santos Laguna */}
                <div className="flex-shrink-0 w-40 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                  <div className="relative bg-[#f0f5f0] flex items-end justify-center h-44 overflow-hidden">
                    <img src="/coahuila-santos.png" alt="Coahuila Santos Laguna" className="h-40 w-auto object-contain object-bottom drop-shadow-md" />
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-bold text-gray-800 leading-tight mb-1">Coahuila Santos Laguna</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-pink-600">600 MXN</span>
                      {renderOutfitActionButton(OUTFITS_DATA[1], "compact")}
                      <button
                        onClick={() => toast.success("¡Coahuila Santos Laguna añadida!", { description: "Se han deducido 600 MXN de tu saldo." })}
                        className="hidden"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Placeholder card 3 */}
                <div className="flex-shrink-0 w-40 rounded-2xl bg-white border border-dashed border-gray-200 shadow-sm overflow-hidden flex flex-col items-center justify-center h-[13.5rem]">
                  <Lock className="h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-[10px] text-gray-400 font-bold text-center px-4">Próximamente</p>
                </div>
              </div>
            </div>

            {/* ── Stickers ── */}
            <div className="mb-5">
              <h2 className="text-lg font-black text-gray-900 mb-3 px-1">Stickers</h2>
              <div className="grid grid-cols-2 gap-3">
                {/* Flora card */}
                <div className="relative rounded-2xl overflow-hidden h-28 shadow-sm cursor-pointer group"
                  style={{ background: "linear-gradient(135deg, #6b3e26 0%, #a0522d 50%, #8b6914 100%)" }}
                  onClick={() => setSelectedShopCategory("flores")}
                >
                  <div className="absolute inset-0 flex flex-col justify-end p-3">
                    <div className="text-3xl mb-1 opacity-70 group-hover:opacity-100 transition">🌸</div>
                    <span className="text-white font-black text-base tracking-wider uppercase drop-shadow">FLORA</span>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition rounded-2xl" />
                </div>

                {/* Fauna card */}
                <div className="relative rounded-2xl overflow-hidden h-28 shadow-sm cursor-pointer group"
                  style={{ background: "linear-gradient(135deg, #1a5c4f 0%, #2d8a6e 50%, #1e6e5e 100%)" }}
                  onClick={() => setSelectedShopCategory("fauna")}
                >
                  <div className="absolute inset-0 flex flex-col justify-end p-3">
                    <div className="text-3xl mb-1 opacity-70 group-hover:opacity-100 transition">🦋</div>
                    <span className="text-white font-black text-base tracking-wider uppercase drop-shadow">FAUNA</span>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition rounded-2xl" />
                </div>

                {/* Comida — wide card */}
                <div className="relative col-span-2 rounded-2xl overflow-hidden h-20 shadow-sm cursor-pointer group"
                  style={{ background: "linear-gradient(135deg, #c8a200 0%, #e6bb00 50%, #b89500 100%)" }}
                  onClick={() => setSelectedShopCategory("comidas")}
                >
                  <div className="absolute inset-0 flex items-center justify-between px-5">
                    <div>
                      <span className="text-white font-black text-lg tracking-wider uppercase drop-shadow">COMIDA</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl opacity-80">🍳</span>
                      <span className="text-2xl opacity-80">🌮</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition rounded-2xl" />
                </div>
              </div>
            </div>

            {/* ── Recursos ── */}
            <div className="mb-2">
              <h2 className="text-lg font-black text-gray-900 mb-3 px-1">Recursos</h2>
              <div className="space-y-3">
                {/* Bolsa de Monedas */}
                <div className="flex items-center gap-3 rounded-2xl border border-teal-200 bg-white p-3.5 shadow-sm">
                  <div className="flex-shrink-0 flex items-center justify-center h-11 w-11 rounded-full bg-teal-50 border border-teal-200">
                    <Coins className="h-5 w-5 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800">Bolsa de Monedas</p>
                    <p className="text-[10px] text-gray-400 font-semibold">5,000 MXN Monedas</p>
                  </div>
                  <button
                    onClick={() => toast.success("¡Bolsa de monedas comprada!", { description: "Se han agregado 5,000 MXN a tu saldo." })}
                    className="flex-shrink-0 rounded-xl bg-[#1aab6d] px-4 py-2 text-xs font-black text-white shadow hover:bg-[#159959] transition"
                  >
                    $1.99
                  </button>
                </div>

                {/* Boleto Dorado */}
                <div className="flex items-center gap-3 rounded-2xl border border-pink-200 bg-white p-3.5 shadow-sm">
                  <div className="flex-shrink-0 flex items-center justify-center h-11 w-11 rounded-full bg-pink-50 border border-pink-200">
                    <Ticket className="h-5 w-5 text-pink-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800">Boleto Dorado</p>
                    <p className="text-[10px] text-gray-400 font-semibold">Viaja de manera ilimitada por 24hrs</p>
                  </div>
                  <button
                    onClick={() => { setEnergy(10); toast.success("¡Boleto Dorado activado!", { description: "Tienes energía ilimitada por 24 horas." }); }}
                    className="flex-shrink-0 rounded-xl bg-[#d80073] px-4 py-2 text-xs font-black text-white shadow hover:bg-[#b5005e] transition"
                  >
                    $4.99
                  </button>
                </div>
              </div>
            </div>

            </>
            )}

          </div>
        )}

        {/* Perfil Tab View */}
        {activeTab === "perfil" && (
          <div className="space-y-4 animate-fade-in-slide-up">
            <div className="rounded-3xl border-2 border-pink-100 bg-white p-5 shadow-sm text-center">
              {/* Header profile row */}
              <div className="flex items-center justify-center gap-4 mb-4 text-left">
                {/* Avatar */}
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-pink-100 border-4 border-pink-200 shadow-inner overflow-hidden">
                  {avatarState ? (
                    <img
                      src={avatarState}
                      alt={usernameState}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-pink-600" />
                  )}
                </div>
                {/* Name and Level */}
                <div className="flex flex-col items-start gap-1">
                  <span className="rounded-full bg-teal-500 text-[10px] font-black text-white px-2.5 py-0.5 shadow-sm uppercase tracking-wide">
                    NIVEL 4
                  </span>
                  <h2 className="text-base font-extrabold text-gray-800 leading-tight">
                    {usernameState}
                  </h2>
                  <p className="text-xs text-teal-600 font-extrabold uppercase tracking-wide">
                    Explorador Regional
                  </p>
                </div>
              </div>

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
                    NIVELES COMPLETADOS
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-black text-amber-600">5</div>
                  <div className="text-[9px] font-black tracking-wider text-gray-400 uppercase">
                    STICKERS
                  </div>
                </div>
              </div>

              {/* Diario de Viaje Card */}
              <div className="relative mt-5 flex items-center gap-4 rounded-3xl border border-[#e9dfd3] bg-[#fdf8f2] p-4 text-left shadow-sm overflow-hidden border-l-[6px] border-l-[#c4a000]">
                {/* Book Icon Box */}
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#c4a000] text-white">
                  <BookOpen className="h-6 w-6 stroke-[2]" />
                </div>
                {/* Text Content */}
                <div className="flex-1 min-w-0 z-10">
                  <h3 className="text-base font-extrabold text-[#2b251e] leading-tight">
                    Diario de Viaje
                  </h3>
                  <p className="text-[11px] text-gray-500 font-semibold mt-1">
                    Última parada:{" "}
                    <span className="font-extrabold text-[#705800]">
                      Saltillo, Coahuila
                    </span>
                  </p>
                </div>
                {/* Subtle Bookmark SVG Icon on top-right */}
                <div className="absolute top-0 right-4 h-12 w-8 opacity-10 text-[#2b251e] z-0">
                  <svg viewBox="0 0 24 30" className="h-full w-full fill-current">
                    <path d="M 0,0 L 24,0 L 24,30 L 12,22 L 0,30 Z" />
                  </svg>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <button
                  onClick={handleOpenEditProfile}
                  className="w-full rounded-full border border-pink-200 bg-white py-2 text-xs font-bold text-pink-700 transition hover:bg-pink-50"
                >
                  Editar avatar y nombre
                </button>

                <button
                  onClick={() => {
                    localStorage.removeItem("authUser");
                    localStorage.removeItem("username");
                    localStorage.removeItem("keepLoggedIn");
                    sessionStorage.removeItem("authUser");
                    sessionStorage.removeItem("username");
                    navigate({ to: "/login" });
                  }}
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
              <Switch id="music" checked={musicEnabled} onCheckedChange={setMusicEnabled} />
            </div>

            {/* SFX Toggle Switch */}
            <div className="flex items-center justify-between rounded-2xl border-2 border-teal-300 bg-white px-4 py-3 shadow-inner">
              <Label
                htmlFor="sfx"
                className="flex items-center gap-2.5 text-xs font-bold text-gray-700 tracking-wider"
              >
                <Volume2 className="h-4.5 w-4.5 text-pink-600" /> EFECTOS DE SONIDO
              </Label>
              <Switch id="sfx" checked={sfxEnabled} onCheckedChange={setSfxEnabled} />
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
              Estoy en {selectedState.name}. {selectedState.fact} {appLink}
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
                    `Estoy en ${selectedState.name}. ${selectedState.fact} ${appLink}`
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
                    `Estoy en ${selectedState.name}. ${selectedState.fact} ${appLink}`
                  );
                  window.open(`https://api.whatsapp.com/send?text=${wpText}`, "_blank");
                  toast.success("Abriendo WhatsApp...");
                  setShareOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 rounded-full border-2 border-slate-300 bg-white py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-green-500" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.847L0 24l6.336-1.506A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.374l-.36-.214-3.727.977.995-3.634-.235-.374A9.818 9.818 0 1112 21.818z"/></svg> WhatsApp
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
              <div className="text-7xl filter drop-shadow-md animate-float my-2 flex justify-center">
                {selectedSticker.image.startsWith("/") || selectedSticker.image.endsWith(".png") ? (
                  <img src={selectedSticker.image} alt={selectedSticker.name} className="h-32 object-contain" />
                ) : (
                  selectedSticker.image
                )}
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

      {/* Outfit Detail Dialog (Tienda → Ropa de Personajes) */}
      <Dialog
        open={selectedOutfit !== null}
        onOpenChange={(open) => !open && setSelectedOutfit(null)}
      >
        <DialogContent className="rounded-3xl border-2 border-pink-300 bg-[#f7f1ea] max-w-[90%] md:max-w-md p-6">
          {selectedOutfit && (
            <div className="text-center space-y-4">
              {/* Character image */}
              <div className="flex justify-center animate-float my-2">
                <img
                  src={selectedOutfit.image}
                  alt={selectedOutfit.name}
                  className="h-44 object-contain drop-shadow-lg"
                />
              </div>

              {/* Name + state */}
              <div>
                <DialogTitle className="text-pink-700 font-extrabold text-xl">
                  {selectedOutfit.name}
                </DialogTitle>
                <span className="text-xs italic text-gray-500 block mt-0.5">
                  {selectedOutfit.state}
                </span>
              </div>

              {/* Rarity badge */}
              <div className="flex items-center justify-center gap-2">
                <div className="inline-block rounded-full bg-pink-100 px-3.5 py-1 text-xs font-black text-pink-700 uppercase">
                  {selectedOutfit.rarity}
                </div>
                <div className="inline-block rounded-full bg-amber-100 px-3.5 py-1 text-xs font-black text-amber-700">
                  {selectedOutfit.price} MXN
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-700 bg-white p-4 rounded-2xl border border-pink-100 shadow-inner leading-relaxed text-left">
                {selectedOutfit.description}
              </p>

              {/* Fun fact */}
              <div className="flex items-start gap-2 rounded-2xl bg-amber-50 border border-amber-100 p-3.5 text-left">
                <span className="text-lg">💡</span>
                <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                  {selectedOutfit.funFact}
                </p>
              </div>

              {/* Buy + Close */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    toast.success(`¡${selectedOutfit.name} añadida!`, {
                      description: `Se han deducido ${selectedOutfit.price} MXN de tu saldo.`,
                    });
                    setSelectedOutfit(null);
                  }}
                  className="hidden"
                >
                  Comprar — {selectedOutfit.price} MXN
                </button>
                <div className="flex-1">
                  {renderOutfitActionButton(selectedOutfit)}
                </div>
                <button
                  onClick={() => setSelectedOutfit(null)}
                  className="rounded-full border-2 border-pink-200 bg-white px-4 py-3 font-bold text-pink-700 transition hover:bg-pink-50"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Profile Edit Dialog */}
      <Dialog open={profileEditOpen} onOpenChange={setProfileEditOpen}>
        <DialogContent className="rounded-3xl border-2 border-pink-300 bg-[#f7f1ea] max-w-[90%] md:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-pink-700 font-extrabold text-xl text-center">
              Editar Perfil
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-gray-500">
              Modifica tu nombre de explorador y foto de perfil
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-3 flex flex-col items-center">
            {/* Avatar upload/preview */}
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-pink-100 border-4 border-pink-200 shadow-inner overflow-hidden relative">
                {tempAvatar ? (
                  <img src={tempAvatar} alt="Vista previa del avatar" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-pink-600" />
                )}
                {/* Overlay hover effect */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-black text-white uppercase tracking-wider text-center px-1">
                    Cambiar foto
                  </span>
                </div>
              </div>
              
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            
            {/* Username Input */}
            <div className="w-full space-y-2">
              <Label htmlFor="edit-username" className="text-xs font-bold text-gray-700 tracking-wider">
                NOMBRE DE EXPLORADOR
              </Label>
              <div className="flex items-center gap-2 rounded-2xl border-2 border-teal-300 bg-white px-4 py-2.5 shadow-inner">
                <input
                  id="edit-username"
                  type="text"
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value.replace(/@/g, ""))}
                  placeholder="Escribe tu username"
                  className="w-full bg-transparent text-sm font-semibold outline-none text-gray-800"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => setProfileEditOpen(false)}
              className="rounded-full border-2 border-pink-200 bg-white py-3 font-bold text-pink-700 transition hover:bg-pink-50 text-xs tracking-wider"
            >
              CANCELAR
            </button>
            <button
              onClick={handleSaveProfile}
              className="rounded-full bg-pink-700 py-3 font-bold text-white shadow-md transition hover:bg-pink-800 text-xs tracking-wider"
            >
              GUARDAR
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Guidebook Dialog (Diario de Viaje) */}
      <Dialog open={guidebookOpen} onOpenChange={setGuidebookOpen}>
        <DialogContent className="rounded-3xl border-2 border-pink-300 bg-[#f7f1ea] max-w-[90%] md:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-pink-700 font-extrabold text-xl text-center flex items-center justify-center gap-2">
              <BookOpen className="h-6 w-6 text-pink-700" /> Diario de Viaje
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-gray-500 uppercase tracking-widest font-black">
              Coahuila de Zaragoza 🇲🇽
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3 text-xs md:text-sm text-gray-700 font-semibold leading-relaxed">
            {/* Location Section */}
            <div className="rounded-2xl bg-white p-3.5 border border-pink-100 shadow-sm space-y-1">
              <h4 className="text-[10px] font-black text-pink-600 uppercase tracking-wider">UBICACIÓN DESTACADA</h4>
              <p className="font-extrabold text-gray-800 text-sm">Museo Madero, San Pedro, Coahuila</p>
              <p className="text-gray-500">La casa donde Francisco I. Madero vivió en su adultez y escribió su célebre libro "La Sucesión Presidencial". Este histórico edificio aún conserva en su fachada izquierda un daño provocado por una bala de cañón, siendo San Pedro la cuna y origen de la Revolución Mexicana.</p>
            </div>

            {/* Biodiversity Section */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white p-3.5 border border-pink-100 shadow-sm space-y-1">
                <h4 className="text-[10px] font-black text-teal-600 uppercase tracking-wider">FLORA TÍPICA</h4>
                <ul className="list-disc pl-3.5 space-y-0.5 text-gray-600 font-bold">
                  <li>Cactáceas 🌵</li>
                  <li>Gobernadora 🌿</li>
                  <li>Candelilla 🌱</li>
                </ul>
              </div>
              <div className="rounded-2xl bg-white p-3.5 border border-pink-100 shadow-sm space-y-1">
                <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-wider">FAUNA EMBLEMÁTICA</h4>
                <ul className="list-disc pl-3.5 space-y-0.5 text-gray-600 font-bold">
                  <li>Oso Negro 🐻</li>
                  <li>Águila Real 🦅</li>
                  <li>Lagartija de Arena 🦎</li>
                </ul>
              </div>
            </div>

            {/* Culture & Gastronomy Section */}
            <div className="rounded-2xl bg-white p-3.5 border border-pink-100 shadow-sm space-y-1">
              <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-wider">GASTRONOMÍA Y CULTURA</h4>
              <p className="text-gray-600 font-bold">Famoso por su delicioso <span className="text-pink-600">Pan Francés lagunero</span>, los guisados de <span className="text-teal-600">La Reliquia</span>, y la vitivinicultura histórica en Parras, la primera bodega de vino de toda América.</p>
            </div>
          </div>

          <button
            onClick={() => setGuidebookOpen(false)}
            className="w-full mt-2 rounded-full bg-pink-700 py-3 font-bold text-white shadow-md transition hover:bg-pink-800 text-xs tracking-wider"
          >
            ENTENDIDO
          </button>
        </DialogContent>
      </Dialog>

      {/* Level Completed Overlay */}
      {levelCompletedOverlayOpen && (
        <div 
          onClick={() => setLevelCompletedOverlayOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md animate-fade-in cursor-pointer select-none"
        >
          <div className="w-full max-w-sm mx-4 bg-[#fcf9f5] border-4 border-yellow-400 rounded-3xl p-6 shadow-2xl text-center space-y-6 animate-scale-in">
            {/* Confetti emoji header */}
            <div className="text-5xl animate-bounce">🎉✨🏆</div>
            
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-pink-700 tracking-tight">
                ¡Nivel Completado!
              </h2>
              <p className="text-xs font-bold text-gray-500">
                Expedición en San Pedro, Coahuila
              </p>
            </div>

            {/* Unlocked Stickers Showcase */}
            <div className="space-y-3">
              <p className="text-xs font-extrabold text-teal-800">
                ¡Has desbloqueado 2 nuevos stickers!
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Sticker 1: Museo Madero */}
                <div className="flex flex-col items-center bg-white border-2 border-pink-200 rounded-2xl p-2.5 shadow-sm animate-pulse">
                  <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[8px] font-black text-pink-700 uppercase tracking-wide mb-1.5">
                    Histórico
                  </span>
                  <div className="aspect-square w-full rounded-xl bg-pink-50/50 p-1.5 flex items-center justify-center">
                    <img src="/museo-madero.png" alt="Museo Madero" className="h-16 w-auto object-contain" />
                  </div>
                  <span className="text-[10px] font-black text-gray-700 mt-2 truncate max-w-full text-center">
                    Museo Madero
                  </span>
                </div>

                {/* Sticker 2: Lonche Lagunero */}
                <div className="flex flex-col items-center bg-white border-2 border-pink-200 rounded-2xl p-2.5 shadow-sm animate-pulse">
                  <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[8px] font-black text-pink-700 uppercase tracking-wide mb-1.5">
                    Regional
                  </span>
                  <div className="aspect-square w-full rounded-xl bg-pink-50/50 p-1.5 flex items-center justify-center">
                    <img src="/sticker-lonche.png" alt="Lonche" className="h-16 w-auto object-contain" />
                  </div>
                  <span className="text-[10px] font-black text-gray-700 mt-2 truncate max-w-full text-center">
                    Lonche Lagunero
                  </span>
                </div>
              </div>
            </div>

            {/* Coins / Reward indicator */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border-2 border-amber-300 px-4 py-1.5">
              <Coins className="h-4 w-4 fill-amber-400 text-amber-600 animate-spin" />
              <span className="text-xs font-black text-amber-800">
                +100 MXN Monedas
              </span>
            </div>

            {/* Dismiss Hint */}
            <div className="text-[10px] font-black text-pink-600 animate-pulse pt-2">
              Toca la pantalla para continuar
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
