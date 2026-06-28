import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Users, Home, TrendingUp, Zap } from "lucide-react";

interface AnimatedCounterProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  suffix?: string;
  color: "cyan" | "green" | "amber" | "blue";
}

function AnimatedCounter({ value, label, icon, suffix = "", color }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    let currentValue = 0;
    const increment = Math.max(1, Math.floor(value / 30));
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      currentValue = Math.floor(progress * value);
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value]);

  const colorClasses = {
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    green: "text-green-400 bg-green-500/10 border-green-500/30",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  };

  return (
    <div className={`flex flex-col items-center p-6 rounded-lg border ${colorClasses[color]} transition-all duration-300 hover:shadow-lg hover:shadow-${color}-500/20`}>
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color].split(" ")[1]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
        {displayValue.toLocaleString()}{suffix}
      </div>
      <div className="text-sm font-semibold text-muted-foreground text-center">{label}</div>
    </div>
  );
}

export default function SuccessMetricsDashboard() {
  const { data: metrics, isLoading } = trpc.metrics.getSuccessMetrics.useQuery();

  if (isLoading || !metrics) {
    return (
      <div className="py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12">
      <div className="mb-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Our Success Metrics
        </h2>
        <p className="text-muted-foreground">
          Real-time stats showing the impact of our AI-powered housing search
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <AnimatedCounter
          value={metrics.rentersApprovedThisMonth}
          label="Renters Approved This Month"
          icon={<Users className="w-6 h-6 text-cyan-400" />}
          color="cyan"
        />
        <AnimatedCounter
          value={metrics.totalRentersApproved}
          label="Total Renters Approved"
          icon={<TrendingUp className="w-6 h-6 text-green-400" />}
          color="green"
        />
        <AnimatedCounter
          value={metrics.totalRentalOptions}
          label="Total Rental Options"
          icon={<Home className="w-6 h-6 text-amber-400" />}
          color="amber"
        />
        <AnimatedCounter
          value={metrics.uniqueCustomersThisMonth}
          label="New Customers This Month"
          icon={<Zap className="w-6 h-6 text-blue-400" />}
          color="blue"
        />
      </div>

      <div className="mt-8 p-6 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
        <p className="text-center text-sm text-muted-foreground">
          These metrics update in real-time as more renters find their perfect second chance home
        </p>
      </div>
    </div>
  );
}
