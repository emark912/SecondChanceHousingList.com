import { Link } from "wouter";
import { Shield, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1a1a2e] text-gray-300">
      <div className="container py-8 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-tight text-white leading-tight">
                  SecondChance
                </span>
                <span className="text-[10px] text-gray-400 leading-tight">
                  Housing Locator
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Helping credit-challenged renters find second chance housing programs, rental properties, and options using AI-powered search technology.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wide uppercase">
              Pages
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/">
                  <span className="text-sm text-gray-400 hover:text-white transition-colors">
                    Home
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <span className="text-sm text-gray-400 hover:text-white transition-colors">
                    FAQ
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <span className="text-sm text-gray-400 hover:text-white transition-colors">
                    Contact Us
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/checkout">
                  <span className="text-sm text-gray-400 hover:text-white transition-colors">
                    Checkout
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/partnership">
                  <span className="text-sm text-gray-400 hover:text-white transition-colors">
                    Partnership Program
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wide uppercase">
              Services
            </h4>
            <ul className="space-y-2.5">
              <li className="text-sm text-gray-400">Second Chance Housing Search</li>
              <li className="text-sm text-gray-400">AI-Powered Property Matching</li>
              <li className="text-sm text-gray-400">Corporate Leasing Programs</li>
              <li className="text-sm text-gray-400">Credit Challenge Solutions</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wide uppercase">
              Contact
            </h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400">
                  support@secondchancehousinglocator.com
                </span>
              </li>

              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400">
                  Serving all 50 states
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} SecondChanceHousingList.com. All rights reserved.
          </p>

        </div>
      </div>
    </footer>
  );
}
