import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function PaymentFailed() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">Second Chance Housing List</div>
        </div>
      </nav>

      {/* Error Message */}
      <div className="max-w-2xl mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Card className="p-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Failed
          </h1>

          <p className="text-xl text-gray-600 mb-8">
            Unfortunately, your donation could not be processed. Please try again or contact support if the problem persists.
          </p>

          {/* Possible Reasons */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-bold text-red-900 mb-4">Common reasons for payment failure:</h3>
            <ul className="space-y-2 text-red-900 text-sm">
              <li className="flex gap-2">
                <span>•</span>
                <span>Insufficient funds on your card</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Card was declined by your bank</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Incorrect card information</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Payment gateway timeout</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 justify-center">
            <Button
              onClick={() => window.history.back()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              Try Again
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="px-8"
            >
              Return Home
            </Button>
          </div>

          {/* Support */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-600 mb-2">
              Need help?
            </p>
            <p className="text-sm text-gray-600">
              Contact our support team at <span className="font-semibold">support@secondchancehousinglist.com</span>
            </p>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          <p>&copy; 2026 Second Chance Housing List. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
