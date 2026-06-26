import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Download, Home, Mail, FileText, Calendar, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

interface OrderDetails {
  orderId: string;
  amount: number;
  paymentMethod: string;
  date: string;
  email: string;
  fullName: string;
}

export default function PaymentSuccess() {
  const [, navigate] = useLocation();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get order details from session storage or URL params
    const params = new URLSearchParams(window.location.search);
    const sessionData = sessionStorage.getItem("searchFormData");
    const paymentData = sessionStorage.getItem("paymentData");

    if (!sessionData || !paymentData) {
      navigate("/");
      return;
    }

    const searchData = JSON.parse(sessionData);
    const payment = JSON.parse(paymentData);

    setOrderDetails({
      orderId: payment.orderId || `ORD-${Date.now()}`,
      amount: payment.amount || 59.99,
      paymentMethod: payment.paymentMethod || "Credit Card",
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      email: searchData.email,
      fullName: searchData.fullName,
    });

    setIsLoading(false);
    window.scrollTo(0, 0);
  }, [navigate]);

  const handleDownloadPDF = () => {
    // Trigger PDF download from the server
    const pdfUrl = sessionStorage.getItem("pdfUrl") || "/api/download-housing-list";
    window.open(pdfUrl, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <Navbar />

      <main className="container mx-auto px-4 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          {/* Success Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-400 rounded-full blur-lg opacity-50"></div>
                <CheckCircle2 className="w-20 h-20 text-emerald-500 relative" />
              </div>
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Payment Successful!
            </h1>
            <p className="text-lg text-slate-600 mb-2">
              Your Second Chance Housing List is ready to download
            </p>
            <p className="text-sm text-slate-500">
              A confirmation email has been sent to {orderDetails?.email}
            </p>
          </div>

          {/* Order Details Card */}
          <Card className="mb-8 border-0 shadow-lg bg-white">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column - Order Info */}
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Order ID</p>
                    <p className="text-lg font-semibold text-slate-900">{orderDetails?.orderId}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Order Date</p>
                    <div className="flex items-center text-slate-900">
                      <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="font-semibold">{orderDetails?.date}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Payment Method</p>
                    <div className="flex items-center text-slate-900">
                      <CreditCard className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="font-semibold">{orderDetails?.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column - Amount */}
                <div className="flex flex-col justify-between">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                    <p className="text-sm font-medium text-slate-600 mb-2">Total Amount Paid</p>
                    <p className="text-4xl font-bold text-blue-600">${orderDetails?.amount.toFixed(2)}</p>
                    <p className="text-xs text-slate-500 mt-3">
                      ✓ Includes all discounts applied
                    </p>
                  </div>

                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 mt-4">
                    <p className="text-sm text-emerald-800 font-medium">
                      ✓ Payment received and processed
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What's Included */}
          <Card className="mb-8 border-0 shadow-lg bg-white">
            <CardContent className="p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">What's Included in Your List</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1" />
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-slate-900">Verified Rental Properties</p>
                    <p className="text-sm text-slate-600">Properties that accept second chance renters</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1" />
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-slate-900">Contact Information</p>
                    <p className="text-sm text-slate-600">Direct contact details for landlords</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1" />
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-slate-900">Personalized Matches</p>
                    <p className="text-sm text-slate-600">Based on your rental profile</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1" />
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-slate-900">Application Tips</p>
                    <p className="text-sm text-slate-600">Guidance for successful applications</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleDownloadPDF}
                className="w-full h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-lg flex items-center justify-center transition-all duration-300 shadow-lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Your Housing List (PDF)
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                className="w-full h-14 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg flex items-center justify-center transition-all duration-300"
              >
                <Mail className="w-5 h-5 mr-2" />
                Resend Confirmation Email
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={() => navigate("/")}
                variant="ghost"
                className="w-full h-14 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold rounded-lg flex items-center justify-center transition-all duration-300"
              >
                <Home className="w-5 h-5 mr-2" />
                Return to Home
              </Button>
            </motion.div>
          </div>

          {/* Support Info */}
          <Card className="mt-8 border-0 bg-blue-50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start">
                <FileText className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div className="ml-3">
                  <p className="font-semibold text-slate-900 mb-1">Need Help?</p>
                  <p className="text-sm text-slate-700">
                    Check your email for the confirmation with your housing list. If you don't see it, check your spam folder or contact our support team.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
