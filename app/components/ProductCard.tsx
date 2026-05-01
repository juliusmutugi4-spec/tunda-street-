"use client";

import React, { memo, useMemo } from "react";
import { Camera, BadgeCheck, ShieldCheck, Video, Zap, Radar, Phone } from "lucide-react";

// --- TYPES & CONSTANTS ---
export type CurrencyCode = "KES" | "USD" | "GBP";

export interface Product {
  id: number | string;
  type: string;
  name: string;
  price: number;
  location: string;
  isVerified: boolean;
  seller: string;
  image: string;
  mode: 'RETAIL' | 'CLASSIFIED' | 'WHOLESALE';
  lat: number;
  lon: number;
  desc: string;
  email: string;
  phone: string;
  sales: number;
}

const EXCHANGE_RATES = {
  KES: { rate: 1, symbol: "Ksh" },
  USD: { rate: 0.0077, symbol: "$" },
  GBP: { rate: 0.0057, symbol: "£" }
} as const;

// --- UTILS ---
const getDist = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const getETA = (dist: string) => {
  const km = parseFloat(dist);
  if (km < 1) return "15 min";
  if (km < 5) return "30 min";
  if (km < 10) return "1 hr";
  return "Same Day";
};

// --- COMPONENT ---
const ProductCard = memo(({ p, userLoc, onClick, currency, currentUserName = "You" }: {
  p: Product,
  userLoc: { lat: number; lon: number } | null,
  onClick: (p: Product) => void,
  currency: CurrencyCode,
  currentUserName?: string
}) => {

  const dist = useMemo(() => {
    if (!userLoc) return null;
    return getDist(userLoc.lat, userLoc.lon, p.lat, p.lon);
  }, [userLoc, p.lat, p.lon]);

  const isOwnListing = p.seller === currentUserName || p.seller === "You" || p.seller === "Me";
  const isNearby = dist!== null && dist < 10 && dist > 0.1 &&!isOwnListing;
  const { rate, symbol } = EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES] || EXCHANGE_RATES.KES;

  const hasValidImage = p.image && (
    p.image.startsWith('data:image') ||
    p.image.startsWith('http') ||
    p.image.startsWith('blob:')
  );

  const handleVideoRequest = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert(`Live video request sent to ${p.seller}. They'll notify you when ready.`);
  };

  return (
    <div onClick={() => onClick(p)} className="bg-white/5 rounded-[2.5rem] p-3 border border-white/10 group cursor-pointer relative active:scale-95 transition-all">

      {/* BADGES */}
      <div className="absolute top-1 left-4 right-4 z-20 flex justify-between pointer-events-none">
        {isOwnListing? (
          <div className="bg-yellow-500 text-black text-[9px] font-black px-3 py-1 rounded-full shadow-lg border-2 border-black uppercase tracking-tighter">
            Your Listing
          </div>
        ) : isNearby? (
          <div className="bg-[#10B981] text-black text-[9px] font-black px-3 py-1 rounded-full flex items-center gap-1 animate-bounce shadow-lg border-2 border-black uppercase tracking-tighter">
            <Zap size={10} fill="black" /> Nearby
          </div>
        ) : <div />}

        {p.isVerified && (
          <div className="bg-blue-500 p-1.5 rounded-full shadow-lg border-2 border-black">
            <BadgeCheck size={14} className="text-white"/>
          </div>
        )}
      </div>

      {/* IMAGE */}
      <div className="relative h-64 w-full rounded-[1.8rem] overflow-hidden bg-gray-900 border border-white/5">
        {hasValidImage? (
          <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 opacity-20 text-white">
            <Camera size={40} />
            <span className="text-xs font-bold uppercase tracking-widest">No Media</span>
          </div>
        )}

        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#10B981]/30 flex items-center gap-1.5">
          <span className="text-[9px] font-black text-[#10B981] uppercase tracking-widest flex items-center gap-1">
             <ShieldCheck size={12} className="text-[#10B981]" /> Protected
          </span>
        </div>
      </div>

      {/* TEXT CONTENT */}
      <div className="px-2 pt-4 pb-2 space-y-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1 overflow-hidden">
            <h3 className="font-bold text-white text-lg leading-none truncate">{p.name}</h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
              {isOwnListing? 'Active Listing' : dist? `${dist.toFixed(1)} km away` : 'Locating...'}
            </p>
          </div>
          <div className="text-right">
             <p className="text-[#10B981] font-black text-xl tracking-tighter whitespace-nowrap">
                {symbol}{(p.price * rate).toLocaleString()}
             </p>
          </div>
        </div>

        {/* WHATSAPP BUY BUTTON - THIS IS BLOCK #16 */}
        {!isOwnListing && (
          <a
            href={`https://wa.me/${p.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${p.seller}, I'm interested in your ${p.name} for ${symbol}${(p.price * rate).toLocaleString()}. Is it still available?`)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-green-500 text-white p-3.5 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-green-600 transition-all uppercase tracking-tighter"
          >
            <Phone size={16} />
            Buy via WhatsApp
          </a>
        )}

        {!isOwnListing && (
          <button
            onClick={handleVideoRequest}
            className="w-full bg-blue-500/10 border border-blue-500/20 text-blue-400 p-3.5 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-500/20 transition-all uppercase tracking-tighter"
          >
            <Video size={16} /> Request Live View
          </button>
        )}
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
export default ProductCard;
