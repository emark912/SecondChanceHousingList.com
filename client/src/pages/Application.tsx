import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Application() {
  useEffect(() => {
    // Redirect to external application form
    window.location.href = "https://customerportal.wufoo.com/forms/w1auvgls12kqovh/";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <div className="mb-6">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Redirecting to Application Form
          </h1>

          <p className="text-gray-600 mb-6">
            If you are not automatically redirected, please click the button below.
          </p>

          <a
            href="https://customerportal.wufoo.com/forms/w1auvgls12kqovh/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition"
          >
            Open Application Form
          </a>

          <p className="text-sm text-gray-500 mt-6">
            You will be taken to our secure application form to apply as a landlord or property manager.
          </p>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
