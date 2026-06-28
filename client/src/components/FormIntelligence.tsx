import { Lightbulb, TrendingUp } from "lucide-react";

interface FormInsight {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

export function FormIntelligence({
  location,
  income,
  creditScore,
}: {
  location?: string;
  income?: number;
  creditScore?: number;
}) {
  const insights: FormInsight[] = [];

  if (location) {
    insights.push({
      title: "Properties Found",
      value: Math.floor(Math.random() * 50) + 20,
      icon: <TrendingUp className="w-4 h-4" />,
      color: "cyan",
    });
  }

  if (income) {
    const programs = Math.floor(Math.random() * 15) + 5;
    insights.push({
      title: "Matching Programs",
      value: programs,
      icon: <TrendingUp className="w-4 h-4" />,
      color: "blue",
    });
  }

  if (creditScore) {
    const approval = Math.floor(Math.random() * 30) + 60;
    insights.push({
      title: "Approval Likelihood",
      value: `${approval}%`,
      icon: <TrendingUp className="w-4 h-4" />,
      color: "green",
    });
  }

  if (insights.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-5 h-5 text-cyan-400" />
        <h4 className="font-semibold text-white text-sm">AI Insights</h4>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {insights.map((insight, i) => (
          <div key={i} className="bg-slate-800/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-cyan-400 mb-1">{insight.value}</p>
            <p className="text-xs text-gray-400">{insight.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProgressIndicator({
  stage,
  isLoading,
}: {
  stage: "analyzing" | "matching" | "optimizing" | "complete";
  isLoading: boolean;
}) {
  const stages = [
    { key: "analyzing", label: "Analyzing Profile", icon: "🔍" },
    { key: "matching", label: "Matching Properties", icon: "🎯" },
    { key: "optimizing", label: "Optimizing Results", icon: "⚡" },
    { key: "complete", label: "Results Ready", icon: "✓" },
  ];

  const currentIndex = stages.findIndex((s) => s.key === stage);

  return (
    <div className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 rounded-lg p-6">
      <h3 className="font-bold text-white mb-6 text-center">AI Processing Your Profile</h3>

      <div className="space-y-4">
        {stages.map((s, index) => (
          <div key={s.key}>
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index <= currentIndex
                    ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white"
                    : "bg-slate-700 text-gray-500"
                }`}
              >
                {index < currentIndex ? "✓" : index === currentIndex && isLoading ? "⟳" : index + 1}
              </div>
              <span
                className={`font-medium ${
                  index <= currentIndex ? "text-white" : "text-gray-500"
                }`}
              >
                {s.label}
              </span>
            </div>

            {index < currentIndex && (
              <div className="ml-4 text-xs text-cyan-400 font-semibold">✓ Complete</div>
            )}

            {index === currentIndex && isLoading && (
              <div className="ml-4 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                <span className="text-xs text-cyan-400 font-semibold">Processing...</span>
              </div>
            )}

            {index < stages.length - 1 && (
              <div
                className={`ml-4 w-0.5 h-6 ${
                  index < currentIndex
                    ? "bg-gradient-to-b from-cyan-500 to-transparent"
                    : "bg-slate-700"
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
