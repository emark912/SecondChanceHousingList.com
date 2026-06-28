import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Download, Mail, Phone, Clock } from 'lucide-react';

export default function FlexiblePaymentConfirmation() {
  const [, navigate] = useLocation();
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    // Get payment data from session storage
    const stored = sessionStorage.getItem('flexiblePaymentData');
    if (stored) {
      setPaymentData(JSON.parse(stored));
    }
  }, []);

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-slate-600">Loading your payment confirmation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const firstName = paymentData.customerName?.split(' ')[0] || 'Customer';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Approval Message */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-20 h-20 text-green-600 animate-bounce" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Congratulations, {firstName}!
          </h1>
          <p className="text-2xl font-semibold text-green-600 mb-4">
            Your Offer has been APPROVED! ✓
          </p>
          <p className="text-lg text-slate-600">
            Your flexible payment plan is now active. Here's everything you need to know.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Payment Summary Card */}
          <Card className="md:col-span-2 shadow-lg">
            <CardHeader>
              <CardTitle>Your Payment Summary</CardTitle>
              <CardDescription>Complete breakdown of your flexible payment plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Key Amounts */}
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Total Service Cost:</span>
                  <span className="text-2xl font-bold text-slate-900">
                    ${(paymentData.totalAmount / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t pt-3">
                  <span className="text-slate-700">Down Payment (Today):</span>
                  <span className="text-xl font-bold text-green-600">
                    ${(paymentData.downPaymentAmount / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Remaining Balance:</span>
                  <span className="text-xl font-bold text-slate-900">
                    ${(paymentData.remainingBalance / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Schedule */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Upcoming Payments</h3>
                <div className="space-y-2">
                  {paymentData.paymentSchedule?.map((payment: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-slate-500" />
                        <div>
                          <p className="font-semibold text-slate-900">Payment {idx + 1}</p>
                          <p className="text-sm text-slate-500">
                            {new Date(payment.date).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900">
                        ${(payment.amount / 100).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Frequency Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Payment Frequency:</strong> {paymentData.paymentFrequency === 'biweekly' ? 'Bi-Weekly' : paymentData.paymentFrequency.charAt(0).toUpperCase() + paymentData.paymentFrequency.slice(1)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* What's Included Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">What You Get</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">100+ Verified Listings</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">Complete Contact Details</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">AI-Powered Matching</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">Professional PDF Report</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">24/7 Phone Support</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">30-Day Money-Back Guarantee</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* What Happens Next */}
        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle>What Happens Next</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="bg-cyan-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold mx-auto mb-3">
                  1
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Complete Payment</h4>
                <p className="text-sm text-slate-600">Your down payment is due today</p>
              </div>
              <div className="text-center">
                <div className="bg-cyan-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold mx-auto mb-3">
                  2
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Receive PDF</h4>
                <p className="text-sm text-slate-600">Get your full rental list immediately</p>
              </div>
              <div className="text-center">
                <div className="bg-cyan-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold mx-auto mb-3">
                  3
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Auto-Payments</h4>
                <p className="text-sm text-slate-600">Remaining payments charged on schedule</p>
              </div>
              <div className="text-center">
                <div className="bg-cyan-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold mx-auto mb-3">
                  4
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Get Approved</h4>
                <p className="text-sm text-slate-600">Apply to properties with confidence</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Support */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Phone className="w-5 h-5 text-cyan-600" />
                <h4 className="font-semibold">Call Us</h4>
              </div>
              <p className="text-sm text-slate-600">1-800-HOUSING</p>
              <p className="text-xs text-slate-500">Available 24/7</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-5 h-5 text-cyan-600" />
                <h4 className="font-semibold">Email Us</h4>
              </div>
              <p className="text-sm text-slate-600">support@secondchance.com</p>
              <p className="text-xs text-slate-500">Response within 1 hour</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Download className="w-5 h-5 text-cyan-600" />
                <h4 className="font-semibold">Download PDF</h4>
              </div>
              <p className="text-sm text-slate-600">Check your email</p>
              <p className="text-xs text-slate-500">Sent immediately after payment</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => navigate('/thank-you')}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 text-lg font-semibold"
          >
            View Your Results
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="px-8 py-3 text-lg font-semibold"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
