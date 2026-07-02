import { motion } from "framer-motion";
import { confettiBurst } from "../lib/confetti";
import { toggleFavorite, useFavorites } from "../lib/favorites";

export default function HeartButton({ sku, className = "" }: { sku: string; className?: string }) {
  const favorites = useFavorites();
  const fav = favorites.has(sku);
  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const nowFav = toggleFavorite(sku);
        if (nowFav) confettiBurst(e.clientX, e.clientY, 8);
      }}
      aria-label={fav ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={fav}
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-lg shadow-md ring-1 ring-ink/10 backdrop-blur transition hover:scale-110 ${className}`}
    >
      <motion.span
        key={String(fav)}
        initial={{ scale: 0.4 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
      >
        {fav ? "💗" : "🤍"}
      </motion.span>
    </motion.button>
  );
}
