import { Brain, Zap, Target, CheckCircle, TrendingUp } from "lucide-react";
import { GlowingText } from "./AIEffects";

export function AIAlgorithmExplainer() {
  const steps = [
    {
      icon: Brain,
      title: "Profile Analysis",
      description: "AI analyzes your complete rental profile including credit, income, and rental history",
      badge: "Pattern Recognition",
    },
    {
      icon: Zap,
      title: "Pattern Matching",
      description: "Advanced algorithms identify matching properties and programs based on your unique situation",
      badge: "Machine Learning",
    },
    {
      icon: Target,
      title: "Real-time Search",
      description: "Searches 500+ properties and programs in real-time across your desired location",
      badge: "Real-time Database",
    },
    {
      icon: CheckCircle,
      title: "Approval Prediction",
      description: "AI predicts approval likelihood and ranks results by best fit for your profile",
      badge: "Predictive AI",
    },
    {
      icon: TrendingUp,
      title: "Personalized Results",
      description: "Delivers customized list of Second Chance properties and programs you'll likely approve",
      badge: "AI Optimized",
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            How Our <GlowingText>Advanced AI</GlowingText> Works
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Our proprietary machine learning algorithm analyzes your rental profile and matches you with properties and programs in real-time
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative group"
              >
                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-cyan-500 to-transparent transform -translate-y-1/2"></div>
                )}

                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/30 rounded-xl p-6 h-full hover:border-cyan-500/60 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-cyan-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-full">
                      {step.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-400">{step.description}</p>
                  <div className="mt-4 pt-4 border-t border-cyan-500/20">
                    <span className="text-xs text-cyan-400 font-semibold">Step {index + 1}/5</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mt-12 pt-12 border-t border-cyan-500/20">
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-2">98%</div>
            <p className="text-sm text-gray-400">Match Accuracy</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-2">500+</div>
            <p className="text-sm text-gray-400">Properties Analyzed</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-2">2 Weeks</div>
            <p className="text-sm text-gray-400">Avg. to Housing</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-2">95%</div>
            <p className="text-sm text-gray-400">Approval Rate</p>
          </div>
        </div>
      </div>
    </section>
  );
}
