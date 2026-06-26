import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2, Download, Calendar, Users, DollarSign, Home,
  ArrowRight, Mail, Phone, Clock
} from "lucide-react";
import { motion } from "framer-motion";

interface OrderData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  location: string;
  donationAmount: number;
  includeCaseManager: boolean;
  totalAmount: number;
  timestamp: string;
  rentalMatches: number;
}

export default function CheckoutSuccess() {
  const [, navigate] = useLocation();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Retrieve order data from sessionStorage
    const stored = sessionStorage.getItem("orderData");
    if (!stored) {
      // If no order data, redirect to home
      navigate("/");
      return;
    }
    
    try {
      const data = JSON.parse(stored);
      setOrderData(data);
    } catch (error) {
      console.error("Failed to parse order data:", error);
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const handleDownloadPDF = () => {
    // Generate PDF with rental results
    // This would typically call an API endpoint to generate and download the PDF
    const element = document.createElement("a");
    element.setAttribute("href", `/api/download-results?orderId=${orderData?.orderId}`);
    element.setAttribute("download", `rental-results-${orderData?.orderId}.pdf`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleScheduleConsultation = () => {
    // Open scheduling link or modal
    window.open("https://calendly.com/secondchancehousing", "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />

      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Success Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <CheckCircle2 className="w-20 h-20 text-green-500" />
            </motion.div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Thank You for Your Support!
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Your order has been successfully processed. We're committed to helping you find quality housing.
          </p>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          className="max-w-3xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Card className="glass border-emerald-500/30 bg-gradient-to-br from-emerald-50/10 to-teal-50/10">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Mail className="w-6 h-6 text-emerald-400" />
                Order Confirmation
              </h2>

              <div className="space-y-4 mb-8">
                {/* Order ID */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-600">
                  <span className="text-slate-300">Order ID:</span>
                  <span className="font-mono text-white font-semibold">{orderData.orderId}</span>
                </div>

                {/* Customer Name */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-600">
                  <span className="text-slate-300">Name:</span>
                  <span className="text-white font-semibold">{orderData.customerName}</span>
                </div>

                {/* Email */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-600">
                  <span className="text-slate-300">Email:</span>
                  <span className="text-white font-semibold">{orderData.customerEmail}</span>
                </div>

                {/* Location */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-600">
                  <span className="text-slate-300 flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Location:
                  </span>
                  <span className="text-white font-semibold">{orderData.location}</span>
                </div>

                {/* Rental Matches */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-600">
                  <span className="text-slate-300 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Rental Matches:
                  </span>
                  <span className="text-white font-semibold">{orderData.rentalMatches} properties & programs</span>
                </div>

                {/* Donation Amount */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-600">
                  <span className="text-slate-300 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Donation:
                  </span>
                  <span className="text-white font-semibold">${orderData.donationAmount.toFixed(2)}</span>
                </div>

                {/* Case Manager (if selected) */}
                {orderData.includeCaseManager && (
                  <div className="flex justify-between items-center pb-4 border-b border-slate-600 bg-amber-500/10 p-3 rounded-lg">
                    <span className="text-slate-300 flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-400" />
                      Case Manager:
                    </span>
                    <span className="text-amber-300 font-semibold">$125.00</span>
                  </div>
                )}

                {/* Total Amount */}
                <div className="flex justify-between items-center pt-4 bg-emerald-500/10 p-4 rounded-lg">
                  <span className="text-lg font-bold text-emerald-300">Total Amount:</span>
                  <span className="text-2xl font-bold text-emerald-400">${orderData.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Timestamp */}
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Clock className="w-4 h-4" />
                <span>Order placed on {new Date(orderData.timestamp).toLocaleDateString()} at {new Date(orderData.timestamp).toLocaleTimeString()}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Next Steps Section */}
        <motion.div
          className="max-w-3xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Card className="glass border-blue-500/30 bg-gradient-to-br from-blue-50/10 to-cyan-50/10">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <ArrowRight className="w-6 h-6 text-blue-400" />
                What's Next?
              </h2>

              <div className="space-y-4">
                {/* Download Results */}
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Download className="w-5 h-5 text-blue-400" />
                    Step 1: Download Your Results
                  </h3>
                  <p className="text-slate-300 text-sm mb-3">
                    Your personalized rental list with {orderData.rentalMatches} matching Second Chance Rental Properties and Programs is ready to download.
                  </p>
                  <Button
                    onClick={handleDownloadPDF}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF Results
                  </Button>
                </div>

                {/* Apply to Properties */}
                <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                  <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Home className="w-5 h-5 text-cyan-400" />
                    Step 2: Start Applying
                  </h3>
                  <p className="text-slate-300 text-sm">
                    Review your rental matches and begin applying to properties directly. Each listing includes contact details and application links.
                  </p>
                </div>

                {/* Case Manager Option */}
                {orderData.includeCaseManager ? (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Users className="w-5 h-5 text-amber-400" />
                      Step 3: Schedule Your Consultation
                    </h3>
                    <p className="text-slate-300 text-sm mb-3">
                      Your dedicated Second Chance Housing Consultant is ready to help you get approved. They'll work with you until you're approved into your chosen rental property.
                    </p>
                    <Button
                      onClick={handleScheduleConsultation}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Consultation
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-400" />
                      Need Extra Help?
                    </h3>
                    <p className="text-slate-300 text-sm mb-3">
                      If you'd like personalized support from a Second Chance Housing Consultant, you can add the case manager service for $125.
                    </p>
                    <Button
                      onClick={() => navigate("/")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Upgrade to Case Manager
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Confirmation Email */}
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Card className="glass border-slate-500/30 bg-gradient-to-br from-slate-700/20 to-slate-800/20">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-slate-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white mb-2">Confirmation Email Sent</h3>
                  <p className="text-slate-300 text-sm">
                    A detailed confirmation email with your order details and download link has been sent to <span className="font-semibold">{orderData.customerEmail}</span>. Check your inbox (and spam folder) for the message.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Return to Home */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-black text-lg px-8 py-6 h-auto"
          >
            Return to Home
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
