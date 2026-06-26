import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2, Download, Mail, Phone, Calendar, DollarSign,
  Home, Users, ArrowRight, Shield, Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

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

export default function PaymentConfirmation() {
  const [, navigate] = useLocation();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("orderData");
    if (!stored) {
      navigate("/");
      return;
    }
    setOrderData(JSON.parse(stored));
    window.scrollTo(0, 0);
  }, [navigate]);

  const handleDownloadPDF = async () => {
    if (!orderData) return;
    
    setIsDownloading(true);
    try {
      // Create a simple PDF download link
      const element = document.createElement("a");
      element.setAttribute(
        "href",
        `data:text/plain;charset=utf-8,${encodeURIComponent(
          generatePDFContent(orderData)
        )}`
      );
      element.setAttribute(
        "download",
        `rental-results-${orderData.location.replace(/\s+/g, "-").toLowerCase()}.txt`
      );
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  const generatePDFContent = (data: OrderData): string => {
    return `
SECOND CHANCE HOUSING LOCATOR
Custom Rental Search Results

ORDER CONFIRMATION
=====================================
Order ID: ${data.orderId}
Date: ${new Date(data.timestamp).toLocaleDateString()}
Customer: ${data.customerName}
Email: ${data.customerEmail}

SEARCH LOCATION
=====================================
City/Area: ${data.location}

RESULTS SUMMARY
=====================================
Total Rental Matches: ${data.rentalMatches}
- Apartments: ~${Math.floor(data.rentalMatches * 0.30)}
- Houses: ~${Math.floor(data.rentalMatches * 0.20)}
- Second Chance Programs: ~${Math.floor(data.rentalMatches * 0.15)}
- Private Landlords: ~${Math.floor(data.rentalMatches * 0.20)}

PAYMENT DETAILS
=====================================
Donation Amount: $${data.donationAmount.toFixed(2)}
Case Manager Service: ${data.includeCaseManager ? "YES - $125.00" : "NO"}
Total Amount Paid: $${data.totalAmount.toFixed(2)}

NEXT STEPS
=====================================
1. Review your personalized rental matches
2. Contact properties that interest you
3. Submit rental applications
${data.includeCaseManager ? `4. Your assigned Second Chance Housing Consultant will contact you within 24 hours
5. Consultant will assist with loan applications and fee waivers` : ""}

RECOMMENDED SECOND CHANCE PROGRAMS
=====================================
1. GetLeaseReady.com - Lease readiness and credit building
2. ForRentNoCreditCheck.com - No credit check rentals
3. SecondChanceHousingList.com - Comprehensive second chance listings

NATIONAL SECOND CHANCE PROGRAMS
=====================================
- BadCreditHousing.com
- SecondChanceRentals.com
- NoCreditCheckApartments.com
- EvictionForgiveness.com
- BankruptcyRentals.com
- LowCreditApartments.com
- ForgiveMyRent.com
- HousingForAll.org
- SecondChanceHomes.net
- CreditChallengeHousing.com

SUPPORT
=====================================
Questions? Contact us:
Email: support@secondchancehousinglocator.com
Website: www.secondchancehousinglocator.com

Thank you for using Second Chance Housing Locator!
We believe everyone deserves a second chance and access to quality housing.
    `;
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />

      <motion.div
        className="container mx-auto px-3 sm:px-4 py-6 sm:py-12"
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
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
            Payment Successful!
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600">
            Your custom rental search results are ready
          </p>
        </motion.div>

        {/* Order Details Card */}
        <motion.div className="max-w-2xl mx-auto mb-6 sm:mb-8" variants={itemVariants}>
          <Card className="border-2 border-green-200 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Order Confirmation
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3 sm:space-y-4">
                {/* Order ID and Date */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold">
                      Order ID
                    </p>
                    <p className="text-sm sm:text-lg font-mono text-gray-900 break-all">
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

                {/* Customer Information */}
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-2">
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
                      <strong>Search Location:</strong> {orderData.location}
                    </p>
                  </div>
                </div>

                <hr className="my-4" />

                {/* Search Results Summary */}
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-2">
                    Your Rental Search Results
                  </p>
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                    <p className="text-xl sm:text-2xl font-bold text-blue-600 mb-2">
                      {orderData.rentalMatches}+ Matches Found
                    </p>
                    <p className="text-gray-700 text-xs sm:text-sm">
                      Your personalized list includes apartments, houses, second
                      in {orderData.location}.
                    </p>
                  </div>
                </div>

                <hr className="my-4" />

                {/* Payment Summary */}
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-2">
                    Payment Summary
                  </p>
                  <div className="space-y-2">
                    {orderData.donationAmount > 0 && (
                      <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded text-sm">
                        <span className="text-gray-700">Donation</span>
                        <span className="font-semibold text-gray-900">
                          ${orderData.donationAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {orderData.includeCaseManager && (
                      <div className="flex justify-between items-center p-2 sm:p-3 bg-indigo-50 rounded text-sm">
                        <span className="text-gray-700">
                          Case Manager Service
                        </span>
                        <span className="font-semibold text-indigo-600">
                          $125.00
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center p-2 sm:p-3 bg-green-50 rounded border border-green-200 text-sm">
                      <span className="font-bold text-gray-900">Total Paid</span>
                      <span className="text-lg sm:text-2xl font-bold text-green-600">
                        ${orderData.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Next Steps */}
        <motion.div className="max-w-2xl mx-auto mb-6 sm:mb-8" variants={itemVariants}>
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Clock className="w-5 h-5 text-blue-600" />
                What Happens Next
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Download Your Results
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Click the button below to download your personalized
                      rental search results PDF
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                      <span className="text-blue-600 font-bold">2</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Review Your Matches
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Review the {orderData.rentalMatches}+ properties and
                      programs that match your rental profile
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                      <span className="text-blue-600 font-bold">3</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Apply to Properties
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Contact properties directly and submit rental applications
                    </p>
                  </div>
                </div>

                {orderData.includeCaseManager && (
                  <div className="flex gap-4 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-600">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100">
                        <Users className="w-5 h-5 text-indigo-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Your Case Manager is Ready
                      </h3>
                      <p className="text-gray-700 text-sm">
                        Your assigned Second Chance Housing Consultant will
                        contact you within 24 hours to help with loan
                        applications, fee waivers, and approval process
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4 justify-center mb-12"
          variants={itemVariants}
        >
          <Button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            {isDownloading ? "Downloading..." : "Download Results PDF"}
          </Button>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="px-8 py-3 rounded-lg font-semibold"
          >
            Back to Home
          </Button>
        </motion.div>

        {/* Support Section */}
        <motion.div className="max-w-2xl mx-auto" variants={itemVariants}>
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="font-bold text-gray-900 mb-4">Need Help?</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex gap-3">
                  <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Email</p>
                    <p className="text-gray-600 text-sm">
                      support@secondchancehousinglocator.com
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Phone</p>
                    <p className="text-gray-600 text-sm">1-800-HOUSING-1</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <Footer />
    </div>
  );
}
