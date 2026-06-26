import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import { CheckCircle2, Heart } from 'lucide-react';

type PaymentFrequency = 'weekly' | 'biweekly' | 'monthly';

interface PaymentScheduleItem {
  date: string;
  amount: number;
}

interface SearchData {
  fullName: string;
  location: string;
  [key: string]: any;
}

const BENEFITS = [
  { title: '100+ Verified Listings', description: 'Personalized rental matches in your city specifically for your credit profile' },
  { title: 'Complete Contact Details', description: 'Phone numbers, emails, websites, and direct application links for every listing' },
  { title: 'AI-Powered Matching', description: 'Properties matched to your income, credit challenges, and move-in timeline' },
  { title: 'Professional PDF Report', description: 'Easy-to-read, organized list ready to download and share' },
  { title: 'Instant Delivery', description: 'Download immediately after purchase - no waiting' },
  { title: '24/7 Phone Support', description: 'A dedicated support agent will work with you to help you get approved with your Second Chance Rental matches until you\'re approved into a rental property' },
  { title: '100% Money-Back Guarantee', description: '100% of your money back if you\'re not approved into a rental property within 30 days' },
  { title: 'Coupon Code to Waive Application Fee', description: 'Your rental profile is matched with Second Chance Programs in our partnership program. After your payment, you will receive a coupon code that waives application fees (typically $75-$300) with select Second Chance Programs on your list.' },
  { title: 'Access to Credit Challenge Loan Programs', description: 'We are partnered with lenders who provide lending services to credit challenged renters like you. We understand moving can be expensive. Many of our customers get approved for loans up to $5,000.00 in just a few days to help them with moving expenses and new furniture. After your purchase you will be provided with an exclusive list of lenders to apply for a loan designed for credit challenged renters.' },
];

export default function FlexiblePayment() {
  const [, navigate] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();
  const [downPayment, setDownPayment] = useState<string>('25');
  const [frequency, setFrequency] = useState<PaymentFrequency>('weekly');
  const [isLoading, setIsLoading] = useState(false);
  const [searchData, setSearchData] = useState<SearchData | null>(null);

  // Load rental search data from session storage
  useEffect(() => {
    const stored = sessionStorage.getItem('searchFormData');
    if (stored) {
      setSearchData(JSON.parse(stored));
    }
  }, []);

  const totalAmount = 7499; // $74.99 in cents ($59.99 + $15 interest)
  const downPaymentAmount = Math.max(2500, Math.floor(parseFloat(downPayment || '0') * 100));
  const remainingBalance = totalAmount - downPaymentAmount;

  // Calculate payment schedule
  const paymentSchedule = useMemo(() => {
    const schedule: PaymentScheduleItem[] = [];
    if (remainingBalance <= 0) return schedule;

    const today = new Date();
    let currentDate = new Date(today);
    let remainingAmount = remainingBalance;
    let paymentCount = 0;

    // Determine interval in days
    const intervalDays = frequency === 'weekly' ? 7 : frequency === 'biweekly' ? 14 : 30;

    // Create 4 payments (or fewer if balance is small)
    while (remainingAmount > 0 && paymentCount < 4) {
      currentDate.setDate(currentDate.getDate() + intervalDays);
      paymentCount++;

      // Distribute remaining balance evenly
      const paymentAmount = paymentCount === 4 ? remainingAmount : Math.floor(remainingBalance / 4);
      remainingAmount -= paymentAmount;

      schedule.push({
        date: currentDate.toISOString().split('T')[0],
        amount: paymentAmount,
      });
    }

    return schedule;
  }, [remainingBalance, frequency]);

  const createSession = trpc.payment.createFlexiblePaymentSession.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/');
      return;
    }

    setIsLoading(true);
    try {
      // Store payment data in session storage for webhook processing
      const paymentData = {
        customerName: user.name || 'Customer',
        customerEmail: user.email || '',
        downPaymentAmount,
        totalAmount,
        remainingBalance,
        paymentFrequency: frequency,
        paymentSchedule,
        searchData: searchData || {}, // Include rental search data
      };
      sessionStorage.setItem('flexiblePaymentData', JSON.stringify(paymentData));

      const result = await createSession.mutateAsync({
        customerName: user.name || 'Customer',
        customerEmail: user.email || '',
        downPaymentAmount,
        totalAmount,
        remainingBalance,
        paymentFrequency: frequency,
        paymentSchedule,
        searchData: searchData || {}, // Pass rental search data to backend
      });

      if (result.url) {
        window.open(result.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating payment session:', error);
      alert('Failed to create payment session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const customerName = searchData?.fullName || user?.name || 'Friend';
  const moveInCity = searchData?.location || 'your area';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">({customerName})! You're worthy of a Second Chance.</h1>
          <p className="text-xl text-slate-600 mb-6">
            Your Custom List of Second Chance Rentals in {moveInCity} is waiting for you.
          </p>
          <p className="text-lg text-slate-600 mb-6">
            We believe in helping ALL renters, no matter their current financial situation.
          </p>
        </div>

        {/* Values Message */}
        <Card className="mb-12 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-8">
            <div className="space-y-4">
              <div className="flex gap-3">
                <Heart className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">We Value People Over Profits</h3>
                  <p className="text-slate-700 leading-relaxed">
                    We don't reject customers due to financial difficulty. We understand that moving and securing housing can be expensive, which is why we offer flexible payment plans that work for YOUR budget. We believe everyone deserves a second chance, and we're committed to making our services accessible to all renters, regardless of their financial situation.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Get Your Order Today</h3>
                  <p className="text-slate-700 leading-relaxed">
                    After you make your first down payment, you'll receive your complete custom rental list immediately. You don't have to wait until your balance is paid in full. Start applying to properties and finding your second chance home today!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Set Your Payment Plan</CardTitle>
                <CardDescription>Choose your down payment and payment frequency</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Down Payment */}
                  <div className="space-y-2">
                    <Label htmlFor="downPayment" className="text-base font-semibold">
                      Down Payment (Minimum $25)
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-slate-900">$</span>
                      <Input
                        id="downPayment"
                        type="number"
                        min="25"
                        step="1"
                        value={downPayment}
                        onChange={(e) => setDownPayment(e.target.value)}
                        className="text-lg font-semibold"
                      />
                    </div>
                    <p className="text-sm text-slate-500">
                      Remaining balance: ${(remainingBalance / 100).toFixed(2)}
                    </p>
                  </div>

                  {/* Payment Frequency */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Payment Frequency</Label>
                    <RadioGroup value={frequency} onValueChange={(val) => setFrequency(val as PaymentFrequency)}>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                        <RadioGroupItem value="weekly" id="weekly" />
                        <Label htmlFor="weekly" className="cursor-pointer flex-1">
                          <div className="font-semibold">Weekly</div>
                          <div className="text-sm text-slate-500">4 payments over 4 weeks</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                        <RadioGroupItem value="biweekly" id="biweekly" />
                        <Label htmlFor="biweekly" className="cursor-pointer flex-1">
                          <div className="font-semibold">Bi-Weekly</div>
                          <div className="text-sm text-slate-500">4 payments over 8 weeks</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                        <RadioGroupItem value="monthly" id="monthly" />
                        <Label htmlFor="monthly" className="cursor-pointer flex-1">
                          <div className="font-semibold">Monthly</div>
                          <div className="text-sm text-slate-500">4 payments over 4 months</div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
                  >
                    {isLoading ? 'Processing...' : 'Continue to Payment'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Summary Section with Button */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-slate-700">Discounted Price</span>
                  <span className="font-semibold">$59.99</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-slate-700">Interest Fee (Processing & Management)</span>
                  <span className="font-semibold text-amber-600">+$15.00</span>
                </div>
                <div className="flex justify-between items-center py-3 bg-blue-50 px-4 rounded-lg">
                  <span className="text-lg font-bold text-slate-900">Total Cost</span>
                  <span className="text-2xl font-bold text-blue-600">${(totalAmount / 100).toFixed(2)}</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> The flexible payment plan option includes a small interest fee ($15.00) to support our processing and management of your payment plan. This increases the total from the discounted price of $59.99 to $74.99.
                  </p>
                </div>
                <div className="mt-6">
                  <h3 className="font-semibold text-slate-900 mb-3">Your Payment Schedule</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    <div className="flex justify-between items-center py-2 bg-slate-50 px-3 rounded">
                      <span className="font-semibold">Down Payment Today</span>
                      <span className="font-bold text-green-600">${(downPaymentAmount / 100).toFixed(2)}</span>
                    </div>
                    {paymentSchedule.map((payment, index) => (
                      <div key={index} className="flex justify-between items-center py-2 px-3 border-b">
                        <span className="text-slate-700">Payment {index + 1} - {payment.date}</span>
                        <span className="font-semibold">${(payment.amount / 100).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg mt-6"
                >
                  {isLoading ? 'Processing...' : 'Continue to Payment'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* What You Will Get Section with Button */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>What You'll Get With Your Order in {moveInCity}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {BENEFITS.map((benefit, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-slate-900">{benefit.title}</h4>
                        <p className="text-sm text-slate-600">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
                >
                  {isLoading ? 'Processing...' : 'Continue to Payment'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">When will I get my rental list?</h4>
              <p className="text-slate-700">You'll receive your complete custom rental list immediately after your first down payment is processed. You don't have to wait for the full balance to be paid.</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Why is the flexible payment plan more expensive?</h4>
              <p className="text-slate-700">The additional $15 fee covers our payment processing and management costs. This allows us to offer flexible payment options to all customers, regardless of their financial situation, while maintaining our service quality.</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">What if I need help?</h4>
              <p className="text-slate-700">Our 24/7 support team is here to help. You'll have access to a dedicated support agent who will work with you throughout your rental search journey.</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Is my payment information secure?</h4>
              <p className="text-slate-700">Yes! All payments are processed securely through Stripe, one of the most trusted payment processors in the world. Your payment information is never stored on our servers.</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Can I change my payment plan?</h4>
              <p className="text-slate-700">Yes, you can adjust your payment frequency (weekly, bi-weekly, or monthly) before making your first payment. Contact our support team if you need to modify your plan after payment has started.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
