import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Shield } from "lucide-react";

const faqs = [
  {
    question: "What is SecondChanceHousingList.com?",
    answer:
      "SecondChanceHousingList.com is an AI-powered search engine that helps credit-challenged renters find second chance housing programs, rental properties, and options that will approve them into a rental property based on their unique rental criteria. Our AI Agent examines both public and private databases in real time to compile a customized list of housing options.",
  },
  {
    question: "Is it really free to search?",
    answer:
      "Yes! It is completely FREE to use our Second Chance Housing List and to receive your personalized rental list. Our AI Agent compiles your customized list at no cost. We are a donation-supported service. You can support our mission with a donation of your choice (minimum $10.00, average $25.00). Optionally, you can add a Second Chance Housing Consultant for just $125.00 (regularly $350.00 - limited time discount!) to help you get approved into a rental property.",
  },
  {
    question: "What does my personalized list include?",
    answer:
      "Your personalized Second Chance Housing List includes: Company Name, Company Website, Contact Person, Company Contact Number, Company Email Address, and detailed descriptions of each rental program, rental property, or housing option. The list typically includes 100+ second chance rental properties, corporate leasing programs, and second chance housing programs.",
  },
  {
    question: "What credit challenges do you help with?",
    answer:
      "Our AI Agent is trained to find housing options for renters with a variety of credit challenges including: No Credit Score, Low Credit Score, Evictions, Loan Defaults, Broken Leases, Criminal History, and Bankruptcy. We search for programs and properties that use alternative approval methods.",
  },
  {
    question: "How does the AI search work?",
    answer:
      "Our AI-Powered Search Engine Agent researches both public and private databases in real time. It scans second chance housing programs, apartments, private landlords, corporate leasing programs, and local laws. It also verifies legitimacy by checking review platforms, court records, and public records, and removes options associated with excessive negative reviews or high crime areas.",
  },
  {
    question: "What is your refund policy?",
    answer:
      "We offer a 100% money-back guarantee. If you are not approved into a rental property within 30 days from one of the rental resources we provided you with, we will refund you 100% of your donation or case manager fee. No questions asked.",
  },
  {
    question: "How quickly will I receive my results?",
    answer:
      "Our AI Agent compiles your personalized list in seconds. Once you complete your payment, your results will be emailed to you immediately as a downloadable PDF document.",
  },
  {
    question: "What types of housing options are included?",
    answer:
      "Our search covers a wide range of housing types including apartments, townhomes, duplexes, single-family houses, condos, and studios. We search for second chance housing programs, second chance apartments, private landlords, corporate leasing programs, and realtors who specialize in helping credit-challenged renters.",
  },
  {
    question: "What is our In-House Corporate Leasing Program?",
    answer:
      "Our In-House Corporate Leasing Program is a premium service where we use our company\'s excellent business credit, corporate name, and financials to submit rental applications on your behalf. Your social security number stays private throughout the process - property managers screen our corporation\'s business credit instead of your personal credit. You\'re placed on the lease as the official occupant. This is an excellent option for renters with significant credit challenges. The program includes a Renters ID number, corporate tradelines added to build excellent rental credit history, and guaranteed approval within 30 days or your money back.",
  },
  {
    question: "How much does the In-House Corporate Leasing Program cost?",
    answer:
      "The program costs $1,000.00 down payment + $250.00 after you select your rental property. The $1,000 down payment is used to generate your Renters ID number, register it with rental credit bureaus, add our excellent corporate tradelines to your Renters ID, and manage your file. The $150 after property selection is used to add positive rental history to your Renters ID, provide landlord/property manager verification services, and consultation support.",
  },
  {
    question: "What services are included in the $1,000 down payment?",
    answer:
      "The $1,000 down payment includes: (1) Generation of your unique Renters ID number, (2) Registration of your Renters ID with rental-related credit bureaus, (3) Addition of our excellent corporate tradelines to your Renters ID to build rental credit history, and (4) Professional management of your file throughout the process.",
  },
  {
    question: "What services are included in the $150 after property selection?",
    answer:
      "The $150 payment after you select your rental property includes: (1) Addition of positive rental history to your Renters ID number in your name, (2) Landlord and property manager verification services for your new rental property, and (3) Consultation and ongoing support to ensure your approval.",
  },
  {
    question: "What is a Corporate Leasing Program?",
    answer:
      "Corporate Leasing Programs are companies that can get you approved for a rental property using their excellent corporate credit instead of your personal credit. This is an excellent option for renters with significant credit challenges who may not qualify through traditional means.",
  },
  {
    question: "How do you verify the listings?",
    answer:
      "Our AI Agent scans all programs, rental properties, and resources on review platforms, checks court records, public records, private records, and uses other tools to verify legitimacy and historic data. We remove rental options from the list that are associated with excessive negative reviews, high crime areas, and other notable concerns.",
  },
  {
    question: "Can I get help with a moving loan?",
    answer:
      "Yes! During the search process, you can indicate whether you need a small loan to help you move into your new rental property. If we can help secure a loan for you, we will include relevant information in your results.",
  },
  {
    question: "How do I contact support?",
    answer:
      "You can reach our support team through the Contact Us page on our website. We are here to help you every step of the way in your housing search journey.",
  },
  {
    question: "What is a Second Chance Housing Consultant?",
    answer:
      "A Second Chance Housing Consultant is a dedicated professional who works directly with you after you receive your personalized rental list. They help you navigate the rental options, answer questions about each program, set tour appointments, negotiate with property managers and landlords, and guide you through the application process until you are successfully approved into a rental property of your choice. Your consultant will assist you with getting a loan if you need one and waive your application fee in select Second Chance Programs in our partnership program. Exclusive perks include access to credit challenge loan programs (borrow $1,500 to $5,000 for moving expenses) and coupons to waive application fees (save $50 to $300). This premium service is available for just $125.00 (regularly $350.00 - limited time discount!)."
  },
  {
    question: "How does the donation model work?",
    answer:
      "Our service is supported by donations from customers who believe in our mission to help credit-challenged renters find housing. Your personalized rental list is completely free. We ask for a donation of your choice (minimum $10.00) to support our operations. The average donation is $25.00, but you decide what works for your budget. Every donation helps us continue serving more renters in need. If you choose donation only, you receive your personalized list of 100+ matching Second Chance Rental Properties and Programs that you can apply to directly.",
  },
  {
    question: "What is the difference between donation only and the case manager service?",
    answer:
      "With donation only, you receive your personalized rental list with 100+ matching Second Chance Rental Properties and Programs in your area that you can apply to independently. With the case manager service ($125.00), you get all of that PLUS a dedicated housing consultant who works with you until you are approved, helps negotiate with landlords, sets tour appointments, provides exclusive access to credit challenge loan programs for moving expenses, and gets application fee waivers for select second chance programs. Choose donation only if you prefer to apply independently, or choose the case manager if you want hands-on support throughout the entire approval process.",
  },
];

export default function FAQ() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <section className="py-12 md:py-20">
        <div className="container max-w-3xl">
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Find answers to common questions about our AI-powered second chance housing search service.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border/50 rounded-xl px-5 shadow-sm bg-white data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left text-sm md:text-base font-medium text-foreground hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium">
              <Shield className="w-4 h-4" />
              30-Day Money Back Guarantee on All Purchases
            </div>
          </div>


        </div>
      </section>

      <Footer />
    </div>
  );
}
