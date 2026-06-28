import { TrendingUp, MapPin, Clock, CheckCircle2 } from "lucide-react";

export default function TrustIndicators() {
  const indicators = [
    {
      icon: TrendingUp,
      value: "95%",
      label: "Approval Rate",
      description: "Credit-challenged renters approved",
    },
    {
      icon: MapPin,
      value: "50",
      label: "States Covered",
      description: "Serving all United States",
    },
    {
      icon: Clock,
      value: "20 sec",
      label: "AI Search",
      description: "Get results instantly",
    },
    {
      icon: CheckCircle2,
      value: "100+",
      label: "Options",
      description: "Rental programs per search",
    },
  ];

  return (
    <div className="py-8 md:py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {indicators.map((indicator, idx) => {
          const Icon = indicator.icon;
          return (
            <div
              key={idx}
              className="flex flex-col items-center text-center p-4 md:p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
            >
              <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-3">
                <Icon className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                {indicator.value}
              </div>
              <div className="text-sm font-semibold text-foreground mb-1">
                {indicator.label}
              </div>
              <div className="text-xs text-muted-foreground">
                {indicator.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
