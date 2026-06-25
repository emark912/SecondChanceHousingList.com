import { useLocation } from "wouter";

export default function Footer() {
  const [, navigate] = useLocation();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4">About</h3>
            <p className="text-gray-400 text-sm">
              Second Chance Housing List helps renters with credit challenges find landlords who accept them.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => navigate("/")}
                  className="text-gray-400 hover:text-white transition cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/how-it-works")}
                  className="text-gray-400 hover:text-white transition cursor-pointer"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/faq")}
                  className="text-gray-400 hover:text-white transition cursor-pointer"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/application")}
                  className="text-gray-400 hover:text-white transition cursor-pointer"
                >
                  Apply
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:support@secondchancehousinglist.com"
                  className="text-gray-400 hover:text-white transition"
                >
                  Email Support
                </a>
              </li>
              <li>
                <a
                  href="tel:555-123-4567"
                  className="text-gray-400 hover:text-white transition"
                >
                  Call Us
                </a>
              </li>
              <li>
                <span className="text-gray-400">
                  Mon-Fri, 9am-5pm EST
                </span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <p className="text-gray-400 text-sm mb-2">
              Email: support@secondchancehousinglist.com
            </p>
            <p className="text-gray-400 text-sm">
              Phone: (555) 123-4567
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; 2026 Second Chance Housing List. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition text-sm">
                Twitter
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition text-sm">
                Facebook
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition text-sm">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
