import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Navbar() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo - Just the image, no text */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
        >
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663281720582/QVW7SNBf6EeKUYsKZD5una/schl-logo-cdTW4vYJTJWHo2jjs5qKJC.webp"
            alt="Second Chance Housing List"
            className="h-10 w-10"
          />
        </div>

        {/* Empty space for centering */}
        <div className="flex-1"></div>

        {/* Admin Link - Only for Admins */}
        {user?.role === "admin" && (
          <button
            onClick={() => navigate("/admin")}
            className="text-gray-700 hover:text-teal-600 transition font-medium cursor-pointer text-sm"
          >
            Admin
          </button>
        )}
      </div>
    </nav>
  );
}
