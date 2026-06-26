import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2, Mail, Phone, ArrowRight, Shield, Clock, FileText, Home
} from "lucide-react";
import { motion } from "framer-motion";

interface OrderData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  timestamp: string;
  isPaymentPlan?: boolean;
  downPaymentAmount?: number;
}

  const [, navigate] = useLocation();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [renterId] = useState(`SCHL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);

  useEffect(() => {
    const stored = sessionStorage.getItem("orderData");
    if (!stored) {
      navigate("/");
      return;
    }
    setOrderData(JSON.parse(stored));
    window.scrollTo(0, 0);
  }, [navigate]);

  if (!orderData) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const firstName = orderData.customerName.split(" ")[0];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <motion.div
        className="flex-1 container mx-auto px-3 sm:px-4 py-6 sm:py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Success Header */}
        <motion.div className="text-center mb-8 sm:mb-12" variants={itemVariants}>
          <motion.div
            className="flex justify-center mb-4 sm:mb-6"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <CheckCircle2 className="w-16 sm:w-20 h-16 sm:h-20 text-green-500" />
          </motion.div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            Payment Received!
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-4">
            We have received your first payment to join our
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 mb-4">
          </p>
        </motion.div>

        {/* Renter ID Card */}
        <motion.div className="max-w-2xl mx-auto mb-6 sm:mb-8" variants={itemVariants}>
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Your Renter ID Number
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-2">Your unique identifier</p>
                <p className="text-3xl sm:text-4xl font-mono font-bold text-blue-600 mb-4">
                  {renterId}
                </p>
                <p className="text-gray-600 text-sm">
                  Keep this number for your records and reference it in all communications
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Confirmation Message */}
        <motion.div className="max-w-2xl mx-auto mb-8 sm:mb-12" variants={itemVariants}>
          <Card className="border border-green-200 bg-white shadow-lg">
            <CardContent className="pt-8">
              <div className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Congratulations, {firstName}!
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We're excited to help you secure approval at your selected rental property.
                </p>
                <p className="text-gray-700 leading-relaxed font-semibold text-blue-600">
                  Please check your email for details on what's next.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Confirmation */}
        <motion.div className="max-w-2xl mx-auto mb-8 sm:mb-12" variants={itemVariants}>
          <Card className="border border-gray-200 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Payment Confirmation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-semibold">Order ID</p>
                  <p className="text-sm sm:text-lg font-mono text-gray-900">
                    {orderData.orderId}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-semibold">Date</p>
                  <p className="text-sm sm:text-lg text-gray-900">
                    {new Date(orderData.timestamp).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>

              <hr className="my-4" />

              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-3">
                  Customer Information
                </p>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-2">
                  <p className="text-gray-900">
                    <strong>Name:</strong> {orderData.customerName}
                  </p>
                  <p className="text-gray-900 break-all">
                    <strong>Email:</strong> {orderData.customerEmail}
                  </p>
                  <p className="text-gray-900">
                    <strong>Renter ID:</strong> {renterId}
                  </p>
                </div>
              </div>

              <hr className="my-4" />

              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-3">
                  Payment Summary
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded border border-blue-200">
                    <span className="text-gray-700">
                      {orderData.isPaymentPlan ? "Down Payment (Today)" : "Initial Payment"}
                    </span>
                    <span className="font-semibold text-gray-900">
                      ${(orderData.downPaymentAmount || orderData.totalAmount).toFixed(2)}
                    </span>
                  </div>
                  {orderData.isPaymentPlan && (
                    <div className="flex justify-between items-center p-3 bg-indigo-50 rounded border border-indigo-200">
                      <span className="text-gray-700">
                        Remaining Balance
                      </span>
                      <span className="font-semibold text-gray-900">
                        ${(orderData.totalAmount - (orderData.downPaymentAmount || 0)).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded border border-green-200">
                    <span className="font-bold text-gray-900">
                      {orderData.isPaymentPlan ? "Total Program Cost" : "Total Paid"}
                    </span>
                    <span className="text-lg sm:text-2xl font-bold text-green-600">
                      ${orderData.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* What's Next Section */}
        <motion.div className="max-w-2xl mx-auto mb-8 sm:mb-12" variants={itemVariants}>
          <Card className="border border-gray-200 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                What's Next?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  At this stage in the program, please review your to-do list to understand the next steps:
                </p>
                <Button
                  onClick={() => navigate("/to-do-list")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  Review Your To-Do List
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Steps:</h3>
                <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="font-bold text-blue-600 flex-shrink-0">1.</span>
                    <span>Check your email for program details and next steps</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-bold text-blue-600 flex-shrink-0">2.</span>
                    <span>Review the to-do list to understand the approval process</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-bold text-blue-600 flex-shrink-0">3.</span>
                    <span>Complete required documentation and property selection</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-bold text-blue-600 flex-shrink-0">4.</span>
                    <span>Work with our team to secure your rental approval</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact & Support */}
        <motion.div className="max-w-2xl mx-auto mb-8 sm:mb-12" variants={itemVariants}>
          <Card className="border border-gray-200 bg-white shadow-lg">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Email Support</h4>
                    <p className="text-sm text-gray-600">
                      support@secondchancehousinglocator.com
                    </p>
                    <p className="text-xs text-gray-500">Response within 1 hour</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Phone Support</h4>
                    <p className="text-sm text-gray-600">Available 24/7</p>
                    <p className="text-xs text-gray-500">Check your email for phone number</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4 justify-center" variants={itemVariants}>
          <Button
            onClick={() => navigate("/to-do-list")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold flex items-center justify-center gap-2"
          >
            View To-Do List
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="px-8 py-3 text-lg font-semibold"
          >
            Back to Home
          </Button>
        </motion.div>
      </motion.div>

      <Footer />
    </div>
  );
}
