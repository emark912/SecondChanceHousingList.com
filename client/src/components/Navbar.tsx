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
          className="text-2xl font-bold text-blue-600 cursor-pointer hover:text-blue-700 transition"
        >
          Second Chance Housing List
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

          {/* Auth Buttons */}
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-medium">{user.name || user.email}</span>
              {user.role === "admin" && (
                <Button
                  onClick={() => navigate("/admin")}
                  variant="outline"
                  className="text-xs"
                >
                  Admin
                </Button>
              )}
              <Button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                variant="outline"
              >
                Logout
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
