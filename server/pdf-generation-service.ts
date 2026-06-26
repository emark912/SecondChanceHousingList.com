import PDFDocument from "pdfkit";
import { Readable } from "stream";
import { housingPrograms, getProgramsByCategory } from "./housing-programs-data";

export interface FormSubmissionData {
  fullName: string;
  email: string;
  location: string;
  creditChallenges?: string[];
  housingTypes?: string[];
  bedrooms?: number;
  criminalHistory?: string;
  evictions?: string;
  income?: string;
  monthlyBudget?: string;
  monthlyIncome?: string;
}

export function generateHousingListPDF(
  submissionData: FormSubmissionData
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "letter",
      margin: 40,
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => {
      chunks.push(chunk);
    });

    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    doc.on("error", reject);

    // Title
    doc.fontSize(24).font("Helvetica-Bold").text("Second Chance Housing List", {
      align: "center",
    });
    doc.moveDown(0.5);

    // Personalized greeting
    doc.fontSize(12).font("Helvetica").text(
      `Personalized for: ${submissionData.fullName}`,
      {
        align: "center",
      }
    );
    doc.fontSize(10).text(`Location: ${submissionData.location}`, {
      align: "center",
    });
    doc.moveDown(1);

    // Personal Profile Section
    doc.fontSize(14).font("Helvetica-Bold").text("Your Rental Profile");
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.5);

    doc.fontSize(11).font("Helvetica-Bold").text("Personal Information:");
    doc.fontSize(10).font("Helvetica");
    doc.text(`Name: ${submissionData.fullName}`);
    doc.text(`Email: ${submissionData.email}`);
    doc.text(`Location: ${submissionData.location}`);
    doc.moveDown(0.5);

    doc.fontSize(11).font("Helvetica-Bold").text("Financial Information:");
    doc.fontSize(10).font("Helvetica");
    if (submissionData.income) {
      doc.text(`Annual Income: $${submissionData.income}`);
    }
    if (submissionData.monthlyBudget) {
      doc.text(`Monthly Rent Budget: $${submissionData.monthlyBudget}`);
    }
    if (submissionData.monthlyIncome) {
      doc.text(`Monthly Housing Income: $${submissionData.monthlyIncome}`);
    }
    doc.moveDown(0.5);

    doc.fontSize(11).font("Helvetica-Bold").text("Housing Preferences:");
    doc.fontSize(10).font("Helvetica");
    if (submissionData.bedrooms) {
      doc.text(`Bedrooms: ${submissionData.bedrooms}`);
    }
    if (submissionData.housingTypes && submissionData.housingTypes.length > 0) {
      doc.text(`Housing Types: ${submissionData.housingTypes.join(", ")}`);
    }
    doc.moveDown(0.5);

    doc.fontSize(11).font("Helvetica-Bold").text("Background Information:");
    doc.fontSize(10).font("Helvetica");
    if (submissionData.creditChallenges && submissionData.creditChallenges.length > 0) {
      doc.text(
        `Credit Challenges: ${submissionData.creditChallenges.join(", ")}`
      );
    }
    if (submissionData.criminalHistory) {
      doc.text(`Criminal History: ${submissionData.criminalHistory}`);
    }
    if (submissionData.evictions) {
      doc.text(`Evictions: ${submissionData.evictions}`);
    }

    doc.moveDown(1.5);

    // Housing Programs Section
    doc.fontSize(14).font("Helvetica-Bold").text("Recommended Housing Programs");
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.5);

    doc.fontSize(10).font("Helvetica").text(
      "Based on your rental profile, here are housing programs and resources that may be able to help you find approved housing:"
    );
    doc.moveDown(1);

    // Get all unique categories and display programs
    const categories = [
      "Second Chance Apartments",
      "Rent Guarantee Programs",
      "Government Programs",
      "Non-Profit Programs",
      "Rental Properties",
      "Corporate Leasing",
      "Rental Assistance",
      "Credit Services",
    ];

    categories.forEach((category) => {
      const programs = getProgramsByCategory(category);
      if (programs.length > 0) {
        // Category header
        doc.fontSize(12).font("Helvetica-Bold").text(category);
        doc.moveDown(0.3);

        // Programs in category
        programs.forEach((program) => {
          doc.fontSize(10).font("Helvetica-Bold").text(`• ${program.name}`);
          doc.fontSize(9).font("Helvetica").text(`Website: ${program.website}`);
          doc.fontSize(9).font("Helvetica").text(program.description, {
            width: 475,
          });
          doc.moveDown(0.3);
        });

        doc.moveDown(0.5);
      }
    });

    // Footer with important information
    doc.addPage();
    doc.fontSize(14).font("Helvetica-Bold").text("Important Information");
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.5);

    doc.fontSize(10).font("Helvetica").text(
      "Next Steps to Finding Housing:",
      { underline: true }
    );
    doc.moveDown(0.3);

    const steps = [
      "1. Review the programs listed above that match your rental profile",
      "2. Visit their websites or call the phone numbers provided",
      "3. Complete their application process with your rental profile information",
      "4. Be honest about your background - these programs specialize in second chance housing",
      "5. Follow up with programs regularly to check application status",
      "6. Consider reaching out to multiple programs to increase your chances of approval",
    ];

    steps.forEach((step) => {
      doc.fontSize(9).font("Helvetica").text(step, { width: 475 });
      doc.moveDown(0.3);
    });

    doc.moveDown(1);

    doc.fontSize(10).font("Helvetica").text(
      "Tips for Success:",
      { underline: true }
    );
    doc.moveDown(0.3);

    const tips = [
      "• Be prepared to explain your credit challenges and background honestly",
      "• Have documentation ready (pay stubs, ID, references)",
      "• Consider programs that specialize in your specific situation (evictions, criminal history, etc.)",
      "• Some programs may require a co-signer or guarantor",
      "• Don't give up - many programs are specifically designed to help people like you",
      "• Ask about lease guarantee programs that can help offset landlord concerns",
    ];

    tips.forEach((tip) => {
      doc.fontSize(9).font("Helvetica").text(tip, { width: 475 });
      doc.moveDown(0.3);
    });

    doc.moveDown(1);

    // Support information
    doc.fontSize(10).font("Helvetica-Bold").text("Need Help?");
    doc.fontSize(9).font("Helvetica").text(
      "If you have questions about this list or need additional resources, contact:"
    );
    doc.moveDown(0.3);
    doc.fontSize(9).font("Helvetica").text(
      "Second Chance Housing Locator"
    );
    doc.fontSize(9).font("Helvetica").text(
      "Email: support@secondchancehousinglocator.com"
    );
    doc.fontSize(9).font("Helvetica").text(
      "Website: secondchancehousinglocator.com"
    );

    doc.moveDown(1);

    // Disclaimer
    doc.fontSize(8).font("Helvetica").text(
      "This list is provided for informational purposes. Second Chance Housing Locator does not guarantee approval by any program listed. Each program has its own eligibility requirements and application process. Please verify all information directly with each program.",
      { width: 475, align: "left" }
    );

    doc.end();
  });
}
