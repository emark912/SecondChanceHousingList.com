import { Shield, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function MoneyBackGuarantee() {
  return (
    <motion.div
      className="mb-6 p-6 rounded-xl border-2 border-green-500/50 bg-gradient-to-r from-green-500/10 to-emerald-500/10 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-40 h-40 bg-green-400/20 rounded-full blur-2xl"
          animate={{
            x: [0, 20, -20, 0],
            y: [0, -20, 20, 0],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10">
        {/* Header with badge */}
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Shield className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-green-400">
              100% Money Back Guarantee
            </h3>
            <p className="text-xs text-green-300 font-semibold">
              Risk-Free Guarantee
            </p>
          </div>
        </div>

        {/* Main guarantee text */}
        <p className="text-sm text-black mb-4 leading-relaxed">
          We are <span className="font-bold text-green-600">so confident</span> in the accuracy of our Second Chance Rentals list that we offer a <span className="font-bold text-green-600">100% Money Back Guarantee</span>. If you are not approved into a rental property within 30 days, we'll refund your entire purchase—no questions asked.
        </p>

        {/* Guarantee details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-green-500/20">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-black">Full Refund</p>
              <p className="text-xs text-black/70">100% money back if not approved</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-green-500/20">
            <Clock className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-black">30-Day Window</p>
              <p className="text-xs text-black/70">Full guarantee period</p>
            </div>
          </div>
        </div>

        {/* Confidence statement */}
        <p className="text-xs text-green-600 font-semibold mt-4 text-center">
          ✓ We stand behind our AI-powered rental matching system
        </p>
      </div>
    </motion.div>
  );
}
