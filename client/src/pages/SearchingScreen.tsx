import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { CheckCircle2, Loader2, Zap, Radar, Database, Building2, HomeIcon, Briefcase, Scale } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchData {
  location: string;
  creditChallenges: string[];
  housingTypes: string[];
  bedrooms: number;
  criminalHistory: string;
  evictions: string;
  income: string;
  monthlyBudget: string;
  monthlyIncome: string;
}

const SEARCH_STEPS = [
  { title: "Second Chance Programs", icon: "📋" },
  { title: "Second Chance Apartments", icon: "🏢" },
  { title: "Private Landlords", icon: "🏠" },
  { title: "Local Laws & Regulations", icon: "⚖️" },
];

export default function SearchingScreen() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const [progress, setProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [scanLines, setScanLines] = useState<number[]>([0, 1, 2]);

  useEffect(() => {
    const stored = sessionStorage.getItem("searchFormData");
    if (!stored) {
      navigate("/");
      return;
    }
    setSearchData(JSON.parse(stored));
  }, [navigate]);

  // Animate scan lines
  useEffect(() => {
    const scanInterval = setInterval(() => {
      setScanLines((prev) => prev.map((line) => (line + 1) % 100));
    }, 50);
    return () => clearInterval(scanInterval);
  }, []);

  useEffect(() => {
    if (!searchData) return;

    const totalDuration = 30000; // 30 seconds total
    const stepDuration = totalDuration / SEARCH_STEPS.length; // 6 seconds per step

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + (100 / (totalDuration / 100));
      });
    }, 100);

    // Step completion animation
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next <= SEARCH_STEPS.length) {
          setCompletedSteps((steps) => [...steps, next - 1]);
        }
        return next;
      });
    }, stepDuration);

    // Navigate to results after 30 seconds
    const navigationTimeout = setTimeout(() => {
      navigate("/results");
    }, totalDuration);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearTimeout(navigationTimeout);
    };
  }, [searchData, navigate]);

  if (!searchData) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden">
      <Navbar />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-3 py-6 md:py-12 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient orbs - subtle blue tones */}
          <motion.div
            className="absolute top-20 left-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"
            animate={{
              x: [0, 30, -30, 0],
              y: [0, -30, 30, 0],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"
            animate={{
              x: [0, -30, 30, 0],
              y: [0, 30, -30, 0],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />

          {/* Scan lines */}
          {scanLines.map((line, idx) => (
            <motion.div
              key={idx}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-300 to-transparent opacity-30"
              style={{
                top: `${(line * 100) / 100}%`,
              }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          ))}

          {/* Grid pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" className="text-blue-400" />
          </svg>
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-2xl px-2">
          {/* Header */}
          <motion.div
            className="text-center mb-6 md:mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 border border-blue-300 mb-3 md:mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Radar className="w-3 h-3 text-blue-700" />
              </motion.div>
              <span className="text-xs md:text-sm font-semibold text-blue-900">AI SCANNING IN PROGRESS</span>
            </div>

            <h1 className="text-2xl md:text-4xl font-bold text-slate-900 mb-2 md:mb-4">
              Searching for Your <span className="text-blue-600 font-extrabold">Second Chance</span>
            </h1>

            <p className="text-slate-700 text-sm md:text-base font-medium leading-snug">
              Our AI is scanning 100M+ records across the internet and private databases to find rental properties that will approve you.
            </p>

            {/* Location Display */}
            <motion.div
              className="mt-3 md:mt-6 inline-block px-3 py-1.5 rounded-lg bg-blue-100 border border-blue-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-xs md:text-sm text-slate-700 font-medium">
                Searching in <span className="text-blue-900 font-semibold">{searchData.location}</span>
              </p>
            </motion.div>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            className="mb-6 md:mb-12 space-y-2 md:space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm font-semibold text-slate-700">SCANNING PROGRESS</span>
              <span className="text-xs md:text-sm font-mono text-slate-700">{Math.round(progress)}%</span>
            </div>

            <div className="relative h-2 bg-blue-100 rounded-full overflow-hidden border-2 border-blue-400 shadow-md">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "linear" }}
              />

              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                animate={{ x: ["0%", "500%"] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>

          {/* Search Steps Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 mb-6 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {SEARCH_STEPS.map((step, idx) => (
              <motion.div
                key={idx}
                className={`relative p-3 md:p-6 rounded-lg md:rounded-xl border transition-all duration-300 ${
                  completedSteps.includes(idx)
                    ? "bg-blue-600 border-blue-700 shadow-lg shadow-blue-500/30"
                    : idx === currentStep
                    ? "bg-white border-blue-500 shadow-lg shadow-blue-400/40"
                    : "bg-blue-50 border-blue-200"
                }`}
                animate={
                  idx === currentStep
                    ? {
                        boxShadow: [
                          "0 0 20px rgba(59, 130, 246, 0.3)",
                          "0 0 40px rgba(59, 130, 246, 0.5)",
                          "0 0 20px rgba(59, 130, 246, 0.3)",
                        ],
                      }
                    : {}
                }
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {/* Scanning animation for current step */}
                {idx === currentStep && (
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 to-transparent"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}

                <div className="relative z-10 flex items-start gap-4">
                  <motion.div
                    className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-xl ${
                      completedSteps.includes(idx)
                        ? "bg-white/20"
                        : idx === currentStep
                        ? "bg-blue-200/40"
                        : "bg-blue-100/50"
                    }`}
                    animate={
                      idx === currentStep
                        ? {
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0],
                          }
                        : {}
                    }
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {step.icon}
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold mb-1 ${completedSteps.includes(idx) ? "text-white" : "text-slate-900"}`}>
                      {step.title}
                    </h3>

                    {completedSteps.includes(idx) && (
                      <motion.div
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <CheckCircle2 className="w-4 h-4 text-blue-200" />
                        <span className="text-xs text-blue-100 font-medium">Scan Complete</span>
                      </motion.div>
                    )}

                    {idx === currentStep && (
                      <motion.div
                        className="flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div
                          className="flex gap-1"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        </motion.div>
                        <span className="text-xs text-blue-600 font-medium">Scanning...</span>
                      </motion.div>
                    )}

                    {!completedSteps.includes(idx) && idx !== currentStep && (
                      <div className="text-xs text-slate-600">Waiting...</div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats Display */}
          <motion.div
            className="grid grid-cols-3 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {[
              { label: "Records Scanned", value: Math.round((progress / 100) * 100000000) },
              { label: "Matches Found", value: Math.round((progress / 100) * 250) },
              { label: "Time Remaining", value: `${Math.max(0, 20 - Math.round(progress / 5))}s` },
            ].map((stat, idx) => (
              <div key={idx} className="bg-blue-100 border border-blue-300 rounded-lg p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-blue-700">
                  {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                </div>
                <div className="text-xs text-slate-700 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Bottom Message */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-sm text-slate-700">
              Scanning {SEARCH_STEPS[currentStep]?.title || "databases"}...
            </p>
            <p className="text-xs text-slate-600 mt-2">
              This typically takes 20 seconds. Do not close this window.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
