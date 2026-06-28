import { ArrowRight, TrendingUp } from "lucide-react";

interface CaseStudy {
  title: string;
  before: {
    credit: string;
    history: string;
    challenge: string;
  };
  after: {
    result: string;
    timeline: string;
    properties: number;
  };
  confidence: number;
  location: string;
}

export function CaseStudyCards() {
  const caseStudies: CaseStudy[] = [
    {
      title: "Eviction + Low Credit",
      before: {
        credit: "580 Credit Score",
        history: "Recent Eviction",
        challenge: "Denied by 5 landlords",
      },
      after: {
        result: "Approved for Apartment",
        timeline: "10 Days",
        properties: 47,
      },
      confidence: 94,
      location: "Austin, TX",
    },
    {
      title: "Bankruptcy Recovery",
      before: {
        credit: "520 Credit Score",
        history: "Chapter 7 Bankruptcy",
        challenge: "No rental history",
      },
      after: {
        result: "Approved for House",
        timeline: "14 Days",
        properties: 32,
      },
      confidence: 89,
      location: "Denver, CO",
    },
    {
      title: "Broken Lease",
      before: {
        credit: "610 Credit Score",
        history: "Broken Lease",
        challenge: "Bad rental reference",
      },
      after: {
        result: "Approved for Townhome",
        timeline: "8 Days",
        properties: 56,
      },
      confidence: 96,
      location: "Phoenix, AZ",
    },
  ];

  return (
    <section className="py-16 bg-slate-900">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Real Success Stories
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            See how our AI-powered matching has helped credit-challenged renters find housing
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {caseStudies.map((study, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/30 rounded-xl overflow-hidden hover:border-cyan-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-b border-cyan-500/30 p-6">
                <h3 className="font-bold text-white text-lg mb-2">{study.title}</h3>
                <p className="text-sm text-cyan-400">{study.location}</p>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Before */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <span className="text-red-400">●</span> Before
                  </h4>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>Credit: <span className="text-red-400 font-semibold">{study.before.credit}</span></p>
                    <p>History: <span className="text-red-400 font-semibold">{study.before.history}</span></p>
                    <p>Challenge: <span className="text-red-400 font-semibold">{study.before.challenge}</span></p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center mb-6">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <ArrowRight className="w-4 h-4" />
                    <span className="text-xs font-semibold">AI MATCHED</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* After */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <span className="text-green-400">●</span> After
                  </h4>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>Result: <span className="text-green-400 font-semibold">{study.after.result}</span></p>
                    <p>Timeline: <span className="text-green-400 font-semibold">{study.after.timeline}</span></p>
                    <p>Options: <span className="text-green-400 font-semibold">{study.after.properties} Properties</span></p>
                  </div>
                </div>

                {/* Confidence Score */}
                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-300">AI Confidence Score</span>
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${study.confidence}%` }}
                    ></div>
                  </div>
                  <p className="text-right text-sm text-cyan-400 font-bold mt-2">{study.confidence}% Match</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
