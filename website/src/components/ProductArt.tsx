import { motion } from "framer-motion";
import type { Product } from "../data/products";

export default function ProductArt({
  product,
  size = 220,
  float = true,
}: {
  product: Product;
  size?: number;
  float?: boolean;
}) {
  return (
    <motion.div
      className="relative"
      style={{ width: size, height: size }}
      animate={float ? { y: [0, -8, 0] } : undefined}
      transition={float ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        className="h-full w-full rounded-3xl object-cover shadow-md ring-1 ring-white/60"
      />
    </motion.div>
  );
}
