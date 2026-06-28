import { CheckCircle2, Users, Award, Shield } from "lucide-react";

export default function SocialProofBadges() {
  const badges = [
    {
      icon: Users,
      text: "Trusted by 10,000+ Renters",
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30",
    },
    {
      icon: CheckCircle2,
      text: "95% Approval Success Rate",
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
    },
    {
      icon: Award,
      text: "Industry-Leading Results",
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
    },
    {
      icon: Shield,
      text: "Secure & Confidential Process",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
    },
  ];

  return (
    <div className="py-6 md:py-8">
      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        {badges.map((badge, idx) => {
          const Icon = badge.icon;
          return (
            <div
              key={idx}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-300 hover:shadow-lg ${badge.bgColor} ${badge.borderColor} hover:border-opacity-60 group`}
            >
              <Icon className={`w-4 h-4 ${badge.color} group-hover:scale-110 transition-transform`} />
              <span className="text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap">
                {badge.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
