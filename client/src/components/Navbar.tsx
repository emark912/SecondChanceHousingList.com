import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, Shield } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact Us" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-cyan-500/20 shadow-lg shadow-cyan-500/10">
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/30 group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all">
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="hidden sm:inline text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">Second Chance Housing List</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location === link.href
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50"
                      : "text-gray-300 hover:text-white hover:bg-cyan-500/10"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/#search-form">
              <Button size="sm" className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-md shadow-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/50">
                <Search className="w-4 h-4" />
                Start Free Search
              </Button>
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-cyan-500/10 transition-colors text-gray-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 border-t border-cyan-500/20 pt-3 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    location === link.href
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50"
                      : "text-gray-300 hover:text-white hover:bg-cyan-500/10"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </span>
              </Link>
            ))}
            <div className="px-4 pt-2">
              <Link href="/#search-form">
                <Button size="sm" className="w-full gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white" onClick={() => setIsOpen(false)}>
                  <Search className="w-4 h-4" />
                  Start Free Search
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
