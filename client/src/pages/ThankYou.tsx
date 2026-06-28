import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Download, Mail, Home, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ThankYou() {
  const [, navigate] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get session ID from URL
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session_id");
    
    if (!sid) {
      navigate("/");
      return;
    }
    
    setSessionId(sid);
    setIsLoading(false);
  }, [navigate]);

  const handleDownload = async () => {
    if (!sessionId) {
      toast.error("Session ID not found");
      return;
    }

    try {
      // Download the PDF
      const response = await fetch(`/api/download-housing-list?sessionId=${sessionId}`);
      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "second-chance-housing-list.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download PDF. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your order...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-1 px-4 py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              className="flex justify-center mb-6"
            >
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-4">
                <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400" />
              </div>
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Thank You!
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              Your payment has been processed successfully.
            </p>
            <p className="text-lg text-muted-foreground">
              Your personalized Second Chance Housing list is ready to download.
            </p>
          </motion.div>

          {/* Download Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-8"
          >
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
              <CardContent className="pt-8 pb-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                    <Download className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-foreground">
                    Download Your List
                  </h2>
                  <p className="text-muted-foreground">
                    Your custom Second Chance Housing list with full contact information, phone numbers, websites, and application links.
                  </p>
                </div>

                <Button
                  onClick={handleDownload}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-lg rounded-lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download PDF Now
                </Button>

                <p className="text-sm text-muted-foreground text-center mt-4">
                  A copy has also been sent to your email
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Email Confirmation Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-8"
          >
            <Card className="border border-border">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary mt-1" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Order Confirmation Email
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      We've sent a confirmation email with your order details and a download link to your email address. Check your inbox and spam folder if you don't see it.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* What's Next */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mb-8"
          >
            <Card className="border border-border">
              <CardContent className="pt-6 pb-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5 text-primary" />
                  What's Next?
                </h3>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 font-semibold text-primary">1.</span>
                    <span>Download your personalized housing list PDF</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 font-semibold text-primary">2.</span>
                    <span>Review the listings with full contact information and application links</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 font-semibold text-primary">3.</span>
                    <span>Contact landlords and programs that match your rental profile</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 font-semibold text-primary">4.</span>
                    <span>Submit applications and start your path to approved housing</span>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              size="lg"
              className="flex-1 h-12"
            >
              Back to Home
            </Button>
            <Button
              onClick={handleDownload}
              size="lg"
              className="flex-1 bg-primary hover:bg-primary/90 text-white h-12"
            >
              Download Again
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-12 text-center text-sm text-muted-foreground"
          >
            <p>
              Need help? Contact us at{" "}
              <a
                href="mailto:support@secondchancehousinglocator.com"
                className="text-primary hover:underline"
              >
                Support@SecondChanceHousingList.com
              </a>
            </p>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
