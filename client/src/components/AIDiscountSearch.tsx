import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, CheckCircle2, TrendingDown } from "lucide-react";

interface DiscountMessage {
  id: string;
  message: string;
  discount: number;
  completed: boolean;
}

const DISCOUNT_SEQUENCE: DiscountMessage[] = [
  {
    id: "first-time",
    message: "AI Searching for Discounts - First time customer discount found. Applying...",
    discount: 60,
    completed: false,
  },
  {
    id: "city-coupon",
    message: "AI Searching for Discounts - Regional discount found. Applying...",
    discount: 60,
    completed: false,
  },
  {
    id: "bulk-discount",
    message: "AI Searching for Discounts - Comprehensive search promotion found. Applying...",
    discount: 60,
    completed: false,
  },
  {
    id: "loyalty",
    message: "AI Searching for Discounts - Loyalty discount applied. Finalizing...",
    discount: 10.01,
    completed: false,
  },
];

export default function AIDiscountSearch() {
  const [discounts, setDiscounts] = useState<DiscountMessage[]>(DISCOUNT_SEQUENCE);
  const [currentDiscountIndex, setCurrentDiscountIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(250.00);
  const [totalSavings, setTotalSavings] = useState(0);

  const ORIGINAL_PRICE = 250.00;
  const FINAL_PRICE = 59.99;

  useEffect(() => {
    if (!isAnimating || currentDiscountIndex >= discounts.length) {
      setIsAnimating(false);
      return;
    }

    const timer = setTimeout(() => {
      const discount = discounts[currentDiscountIndex];
      const newPrice = Math.max(FINAL_PRICE, currentPrice - discount.discount);
      const savings = ORIGINAL_PRICE - newPrice;

      setCurrentPrice(newPrice);
      setTotalSavings(savings);
      setDiscounts((prev) =>
        prev.map((d, idx) =>
          idx === currentDiscountIndex ? { ...d, completed: true } : d
        )
      );
      setCurrentDiscountIndex((prev) => prev + 1);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAnimating, currentDiscountIndex, currentPrice, discounts]);

  return (
    <motion.div
      className="w-full p-6 md:p-8 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-lg border border-cyan-500/30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0">
          <motion.div
            className="w-12 h-12 rounded-lg bg-cyan-500 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Zap className="w-6 h-6 text-black" />
          </motion.div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-cyan-300 mb-2">
            AI Finding Best Discounts For You
          </h3>
          <p className="text-sm text-black">
            Our AI is searching for available discount codes and coupons to maximize your savings...
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {discounts.map((discount, idx) => (
          <motion.div
            key={discount.id}
            className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-500 ${
              discount.completed
                ? "bg-green-500/20 border border-green-500/50"
                : idx === currentDiscountIndex && isAnimating
                  ? "bg-yellow-500/20 border border-yellow-500/50 animate-pulse"
                  : "bg-slate-700/30 border border-slate-600/30"
            }`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="flex-shrink-0 mt-1">
              {discount.completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              ) : idx === currentDiscountIndex && isAnimating ? (
                <Zap className="w-5 h-5 text-yellow-400 animate-spin" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-slate-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-black">{discount.message}</p>
              {discount.completed && (
                <p className="text-xs text-green-400 mt-1">
                  Saved ${discount.discount.toFixed(2)}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Price Display */}
      <motion.div
        className="mt-8 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/30"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-black mb-1">Original Price:</p>
            <p className="text-lg line-through text-slate-400">${ORIGINAL_PRICE.toFixed(2)}</p>
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <TrendingDown className="w-6 h-6 text-green-400" />
          </motion.div>
        </div>

        <div className="border-t border-cyan-500/20 pt-3">
          <p className="text-sm text-black mb-1">Your Discounted Price:</p>
          <motion.p
            className="text-3xl font-bold text-cyan-300"
            key={currentPrice}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            ${currentPrice.toFixed(2)}
          </motion.p>
          <p className="text-xs text-green-400 mt-2 font-semibold">
            You save ${totalSavings.toFixed(2)} ({((totalSavings / ORIGINAL_PRICE) * 100).toFixed(0)}% off)
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
