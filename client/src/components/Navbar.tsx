import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function Navbar() {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
        >
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663281720582/QVW7SNBf6EeKUYsKZD5una/schl-logo-cdTW4vYJTJWHo2jjs5qKJC.webp"
            alt="Second Chance Housing List"
            className="h-10 w-10"
          />
          <span className="text-xl font-bold text-blue-600">SCHL</span>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate("/how-it-works")}
            className="text-gray-700 hover:text-blue-600 transition font-medium cursor-pointer"
          >
            How It Works
          </button>
          <button
            onClick={() => navigate("/faq")}
            className="text-gray-700 hover:text-blue-600 transition font-medium cursor-pointer"
          >
            FAQ
          </button>
          <button
            onClick={() => navigate("/application")}
            className="text-gray-700 hover:text-blue-600 transition font-medium cursor-pointer"
          >
            Apply
          </button>

          {/* Admin Link - Only for Admins */}
          {user?.role === "admin" && (
            <button
              onClick={() => navigate("/admin")}
              className="text-gray-700 hover:text-blue-600 transition font-medium cursor-pointer"
            >
              Admin
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
