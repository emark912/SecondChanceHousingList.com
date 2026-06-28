import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function RentalProcessDirections() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Rental Process Directions</h1>
          <p className="text-lg opacity-90">Guidelines for Applying to Rental Properties Using Your Renters ID</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Step 1 */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-blue-600 mb-4">1. Select at Least 3 Rental Properties</h2>
              <div className="space-y-3 text-foreground">
                <p>
                  Choose at least 3 rental properties that meet your needs and budget. Among your selections, ensure that at least one property is managed by a private homeowner to maximize your approval odds using our proven approval method.
                </p>
                <p>
                  We recommend selecting multiple properties because approval outcomes can vary based on factors beyond credit history. With 3 or more options, our approval method typically succeeds with at least one property.
                </p>
                <p>
                  Having multiple options increases your chances of securing housing quickly and provides flexibility if one property doesn't work out.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-blue-600 mb-4">2. Contact the Property Before Applying</h2>
              <div className="space-y-3 text-foreground">
                <p>
                  Before submitting your application, contact the property manager or landlord directly. Call or visit the property to verify it meets your criteria and to understand their approval standards.
                </p>
                <p>
                  <strong>Key conversation points:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Ask if their approval process requires a credit score</li>
                  <li>Present yourself as someone with limited credit history but strong rental history</li>
                  <li>Emphasize your stable income and clean rental record</li>
                  <li>Gauge their openness to alternative approval methods</li>
                </ul>
                <p>
                  Properties that are open to alternative approval methods are more likely to approve your application using your Renters ID with its established positive rental history.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-blue-600 mb-4">3. Important Guidelines When Filling Out Your Application</h2>
              <div className="space-y-4 text-foreground">
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                  <p className="font-bold text-red-700 mb-2">Critical: Do NOT Use Personal Information</p>
                  <ul className="list-disc list-inside space-y-1 text-red-700">
                    <li>Do NOT provide personal phone numbers or email addresses</li>
                    <li>Do NOT submit personal contact information on the application</li>
                    <li>Do NOT use any addresses you've previously lived at</li>
                  </ul>
                </div>

                <div className="bg-green-50 border-l-4 border-green-500 p-4">
                  <p className="font-bold text-green-700 mb-2">Required: Create New Contact Information</p>
                  <ul className="list-disc list-inside space-y-1 text-green-700">
                    <li>Create a new email address at Gmail.com for the application</li>
                    <li>Create a new phone number at google.com/voice for the application</li>
                    <li>Use ONLY the address provided by the Renters ID Department</li>
                  </ul>
                </div>

                <p className="text-sm text-gray-600 italic">
                  <strong>Important:</strong> Mixing personal information with your Renters ID can cause your new credit file to merge with your old one, resulting in application rejection. Keep these completely separate.
                </p>

                <p className="text-sm text-gray-600 italic">
                  <strong>Note:</strong> If the landlord requires proof that your Renters ID is legitimate, the Renters ID Department will provide the necessary verification documents.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 4 */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-blue-600 mb-4">4. Apply Online When Possible</h2>
              <div className="space-y-3 text-foreground">
                <p>
                  Prioritize properties that offer online applications. Online applications increase approval chances and allow you to submit all required documents electronically.
                </p>
                <p>
                  <strong>Application methods to request:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Online rental application</li>
                  <li>Email submission of application and documents</li>
                  <li>Fax submission if needed</li>
                </ul>
                <p>
                  If you've toured a property but want to apply the next day, let the property manager know you're out of town and request to complete the application online to secure the property immediately.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 5 */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-blue-600 mb-4">5. Rental History Guidelines</h2>
              <div className="space-y-3 text-foreground">
                <p>
                  On your rental application, show 2-3 years of rental history using the address and information provided by the Renters ID Department. Do not reference any addresses from your personal credit history.
                </p>
                <p>
                  <strong>Important protections:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Never allow anyone to run a credit check using your old address</li>
                  <li>Ensure creditors use ONLY the information you provide</li>
                  <li>If your ID still shows an old address, inform creditors that you haven't updated it yet</li>
                  <li>Your Renters ID already includes positive rental history to support your application</li>
                </ul>
                <p className="text-sm text-gray-600">
                  By the time you receive your Renters ID, positive rental history has already been added to your credit profile to help you through the screening process.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 6 */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-blue-600 mb-4">6. Proper Documentation Is Essential</h2>
              <div className="space-y-3 text-foreground">
                <p>
                  Prepare proper documentation to support your application. Required documents typically include:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Proof of income (recent pay stubs, employment letter)</li>
                  <li>Rental history documentation</li>
                  <li>Personal identification</li>
                  <li>Any additional documents requested by the property</li>
                </ul>
                <p>
                  Contact the Renters ID Department for their list of third-party providers who can help you obtain proper documentation if needed.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 7 */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-blue-600 mb-4">7. Expect to Pay These Costs</h2>
              <div className="space-y-3 text-foreground">
                <p>When approved, you'll typically need to pay:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Application/admin fee</li>
                  <li>Security deposit</li>
                  <li>First month's rent</li>
                  <li>Last month's rent</li>
                </ul>
                <p className="text-sm text-gray-600">
                  Confirm all costs with the property manager before submitting your application.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 8 */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-blue-600 mb-4">8. Add Extra Tradelines to Increase Approval Chances</h2>
              <div className="space-y-3 text-foreground">
                <p>
                  If you face approval challenges or want to apply to luxury properties with higher credit score requirements, you can strengthen your Renters ID by adding additional tradelines.
                </p>
                <p>
                  <strong>To add tradelines:</strong>
                </p>
                <p>
                  Visit <a href="https://www.getleaseready.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">GetLeaseReady.com</a> and inquire about their service to add tradelines to your Renters ID. Additional tradelines can produce an excellent credit score profile on your Renters ID number, significantly increasing your approval odds.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Support Section */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-blue-600 mb-4">Questions or Need Assistance?</h2>
              <div className="space-y-3 text-foreground">
                <p>Our support team is available 24/7 to help you through the rental process.</p>
                <div className="space-y-2">
                  <p>
                    <strong>Email:</strong> <a href="mailto:support@secondchancehousinglocator.com" className="text-blue-600 hover:underline">Support@SecondChanceHousingLocator.com</a>
                  </p>
                  <p>
                    <strong>Chat:</strong> Available on our website 24 hours a day
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
