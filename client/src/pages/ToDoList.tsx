import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ToDoList() {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    // Apartment and house rental images from Pexels and Pixabay (more reliable sources)
    const rentalImages = [
      "https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600",
      "https://images.pexels.com/photos/1438761/pexels-photo-1438761.jpeg?auto=compress&cs=tinysrgb&w=600",
      "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=600",
      "https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600",
    ];
    setImages(rentalImages);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Your To-Do List</h1>
          <p className="text-lg text-blue-100">
            Follow these steps to complete the SecondChanceHousingList.com Program from start to finish.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Step 1 - Search, Tour, and Select Your Rental Property */}
        <div className="mb-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
              1
            </div>
            <div className="flex-grow">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Search, Tour, and Select Your Rental Property
              </h2>
              <p className="text-slate-600 mb-4">
                Search, tour, and select ANY rental property you want in your desired area. Once you find a rental property you like, we'll move forward with the approval process.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {images[0] && (
              <img
                src={images[0]}
                alt="Beautiful house for rent"
                className="w-full h-64 object-cover rounded-lg shadow-lg"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/600x400?text=Rental+Property";
                }}
              />
            )}
            {images[1] && (
              <img
                src={images[1]}
                alt="Cozy apartment interior"
                className="w-full h-64 object-cover rounded-lg shadow-lg"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/600x400?text=Rental+Property";
                }}
              />
            )}
          </div>
        </div>

        {/* Step 2 - Submit Request for Renters ID Number */}
        <div className="mb-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
              2
            </div>
            <div className="flex-grow">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Submit Request for Renters ID Number
              </h2>
              <p className="text-slate-600 mb-4">
                Submit the Request Renters ID number form when you are ready to apply to the property of your choice. Be prepared to pay the $250.00 Processing Fee.
              </p>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
                <p className="text-amber-900 font-semibold">
                  💰 Processing Fee: $250.00
                </p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <a href="https://securedoc.wufoo.com/forms/m1bo4w1n0ld5thz/" target="_blank" rel="noopener noreferrer">
                  Pay Processing Fee
                </a>
              </Button>
            </div>
          </div>
          {images[2] && (
            <img
              src={images[2]}
              alt="Apartment building exterior"
              className="w-full h-64 object-cover rounded-lg shadow-lg"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/600x400?text=Rental+Property";
              }}
            />
          )}
        </div>

        {/* Step 3 - Wait for 3 to 7 Business Days */}
        <div className="mb-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
              3
            </div>
            <div className="flex-grow">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Wait for 3 to 7 Business Days
              </h2>
              <p className="text-slate-600 mb-4">
                Check your email and wait to hear from the Renters ID Department. They will provide you with your Renters ID Number usually within a few business days after your request and payment.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-blue-900">
                  ✓ Expected Timeline: 3-7 business days
                </p>
                <p className="text-blue-900">
                  ✓ Check your email for updates
                </p>
              </div>
            </div>
          </div>
          {images[3] && (
            <img
              src={images[3]}
              alt="Modern residential building"
              className="w-full h-64 object-cover rounded-lg shadow-lg"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/600x400?text=Rental+Property";
              }}
            />
          )}
        </div>

        {/* Step 4 - Review and Follow Application Directions */}
        <div className="mb-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
              4
            </div>
            <div className="flex-grow">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Review and Follow Application Directions
              </h2>
              <p className="text-slate-600 mb-4">
                Review and follow the directions on how to apply to your selected rental property using your new Renters ID Number.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <a href="https://secondchancehousinglocator.com/rental-process-directions" target="_blank" rel="noopener noreferrer">
                  View Rental Process Directions
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Step 5 - Get APPROVED and Move In */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                5
              </div>
              <div className="flex-grow">
                <h2 className="text-2xl font-bold text-green-900 mb-2">
                  Get APPROVED and Move In!
                </h2>
                <p className="text-green-800 text-lg font-semibold">
                  🎉 Congratulations! You are now ready to move into your new home.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Support Section */}
        <div className="bg-slate-100 rounded-lg p-8 mt-12">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Need Help?</h3>
          <p className="text-slate-600 mb-4">
            Our support team is available to answer any questions about the process.
          </p>
          <div className="space-y-2">
            <p className="text-slate-700">
              <strong>Email:</strong>{" "}
              <a href="mailto:support@secondchancehousinglocator.com" className="text-blue-600 hover:underline">
                support@secondchancehousinglocator.com
              </a>
            </p>
            <p className="text-slate-700">
              <strong>Chat:</strong> Available on our website 24 hours a day
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
