import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "what-included",
    question: "What exactly is included in my donation?",
    answer:
      "Your donation supports our mission and includes a personalized PDF report with 100+ verified rental listings specifically matched to your credit profile, complete contact information for all properties, AI-powered matching analysis, instant digital delivery, and access to our support team. The average donation is $25.00, but you can donate whatever amount you feel is right for you (minimum $10.00).",
  },
  {
    id: "corporate-leasing",
    question: "What is the In-House Corporate Leasing Program?",
    answer:
      "Our In-House Corporate Leasing Program is a premium service where we use our company\'s excellent business credit, corporate name, and financials to submit rental applications on your behalf. Your social security number stays private throughout the process - property managers screen our corporation\'s business credit instead of your personal credit. You\'re placed on the lease as the official occupant. The program costs $1,000.00 down payment + $250.00 after property selection (total $1,250.00). It includes a Renters ID number, corporate tradelines to build excellent rental credit history, and guaranteed approval within 30 days or your money back.",
  },
  {
    id: "corporate-leasing-services",
    question: "What services are included in the Corporate Leasing Program?",
    answer:
      "The $1,000.00 down payment includes: (1) Generation of your unique Renters ID number, (2) Registration of your Renters ID with rental-related credit bureaus, (3) Addition of our excellent corporate tradelines to your Renters ID to build rental credit history, and (4) Professional management of your file. The $250.00 after property selection includes: (1) Addition of positive rental history to your Renters ID, (2) Landlord and property manager verification services, and (3) Consultation and ongoing support.",
  },
  {
    id: "case-manager",
    question: "What is the Second Chance Housing Consultant service?",
    answer:
      "For just $125.00 (regularly $350.00 - limited time discount!), you can add a dedicated Second Chance Housing Consultant who will work with you until you\'re approved into a rental property. They\'ll help with applications, set tour appointments, negotiate with landlords, assist with getting loans for moving expenses, and waive application fees with select second chance programs. You\'ll also get access to credit challenge loan programs (borrow $1,500-$5,000) and coupons to save $50-$300 on application fees.",
  },
  {
    id: "approval-timeline",
    question: "How long does it take to get approved for a rental?",
    answer:
      "Most of our customers receive approval within 2-4 weeks after applying to properties on their list. The timeline depends on how quickly you submit applications and how responsive landlords are. If you choose the case manager service, our consultant will work with you throughout the process to maximize your approval chances.",
  },
  {
    id: "money-back",
    question: "What is your money-back guarantee?",
    answer:
      "We offer a 100% money-back guarantee if you're not approved into a rental property within 30 days of your donation or case manager purchase. This means if you don't get approved after applying to properties on your list, we'll refund your full donation or case manager fee. No questions asked.",
  },
  {
    id: "credit-score",
    question: "Will this work if I have bad credit or no credit?",
    answer:
      "Yes! Our AI-powered search is specifically designed for credit-challenged renters. We match you with landlords and programs that accept applicants with low credit scores, no credit history, evictions, bankruptcies, and other credit challenges. Your rental profile helps us find properties that will actually approve you.",
  },
  {
    id: "payment-methods",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover), Google Pay, Apple Pay, and Stripe Link for returning customers. All payments are processed securely with SSL encryption.",
  },
  {
    id: "instant-delivery",
    question: "When will I receive my rental list?",
    answer:
      "Your personalized PDF report is available for instant download immediately after your donation is processed. You can start applying to properties within minutes. You'll also receive an email confirmation with your rental list and any applicable coupons for waiving application fees.",
  },
  {
    id: "support-agent",
    question: "What kind of support will I get?",
    answer:
      "With the donation-only option, you have access to our support team for questions about properties and applications. If you choose the case manager service, you'll have a dedicated Second Chance Housing Consultant available to guide you through the entire approval process, help with applications, provide advice on improving your approval chances, and follow up with landlords on your behalf.",
  },
  {
    id: "coupon-code",
    question: "How does the coupon code for application fees work?",
    answer:
      "After your donation is processed, you'll receive information about coupons that waive application fees with select Second Chance Programs on your list. Application fees typically range from $75-$300, so these coupons can save you hundreds of dollars. If you choose the case manager service, your consultant will help ensure you get these fee waivers applied.",
  },
  {
    id: "refund-process",
    question: "How do I request a refund?",
    answer:
      "If you're not approved into a rental property within 30 days, simply contact our support team with proof of your application attempts. We'll process your full refund within 5-7 business days. You can reach us via phone or email through our contact page.",
  },
  {
    id: "data-privacy",
    question: "Is my personal information secure?",
    answer:
      "Yes. We use SSL encryption to protect all your personal information. Your rental profile data is only used to match you with appropriate properties and programs. We never share your information with third parties without your consent, and we comply with all privacy regulations.",
  },
  {
    id: "donation-vs-case-manager",
    question: "Should I choose donation only or add the case manager?",
    answer:
      "Choose donation only if you prefer to apply to rental properties independently and manage the process yourself. Choose the case manager service ($125.00) if you want hands-on support from a dedicated consultant who will guide you through every step, help with applications, negotiate with landlords, and ensure you get approved. The case manager also provides access to moving expense loans and application fee waivers.",
  },
];

export default function ResultsFAQ() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="w-full bg-gradient-to-b from-slate-50 to-white py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-slate-600">
            Get answers to common questions about your Second Chance Housing search
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="border border-slate-200 rounded-lg overflow-hidden hover:border-cyan-400 transition-colors"
            >
              <button
                onClick={() => toggleFAQ(item.id)}
                className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors text-left"
              >
                <span className="font-semibold text-slate-900 text-lg">
                  {item.question}
                </span>
                <motion.div
                  animate={{ rotate: expandedId === item.id ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0 ml-4"
                >
                  <ChevronDown className="w-5 h-5 text-cyan-500" />
                </motion.div>
              </button>

              <AnimatePresence>
                {expandedId === item.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden bg-gradient-to-b from-slate-50 to-white border-t border-slate-200"
                  >
                    <div className="px-6 py-4 text-slate-700 leading-relaxed">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Still Have Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 p-6 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200 text-center"
        >
          <p className="text-slate-700 mb-3">
            Still have questions? Our support team is here to help!
          </p>
          <p className="text-sm text-slate-600">
            Contact us via phone at{" "}
            <span className="font-semibold text-cyan-600">24/7</span> or use the
            live chat widget for instant assistance.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
