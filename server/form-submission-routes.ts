import { Express, Request, Response } from "express";
import { createFormSubmission } from "./db";
import { notifyOwner } from "./_core/notification";

export function registerFormSubmissionRoutes(app: Express) {
  app.post("/api/form-submission", async (req: Request, res: Response) => {
    try {
      const {
        fullName,
        email,
        location,
        creditChallenges,
        housingTypes,
        bedrooms,
        criminalHistory,
        evictions,
        income,
        monthlyBudget,
        monthlyIncome,
      } = req.body;

      // Validate required fields
      if (!fullName || !email || !location) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Create form submission record
      const submissionId = await createFormSubmission({
        fullName,
        email,
        location,
        creditChallenges: creditChallenges || [],
        housingTypes: housingTypes || [],
        bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
        criminalHistory,
        evictions,
        income,
        monthlyBudget,
        monthlyIncome,
      });

      // Send email notification to admin with all form data
      try {
        const creditChallengesText = creditChallenges?.length > 0 ? creditChallenges.join(", ") : "None";
        const housingTypesText = housingTypes?.length > 0 ? housingTypes.join(", ") : "None";
        
        const content = `New Form Submission - ID: ${submissionId}

--- PERSONAL INFORMATION ---
Name: ${fullName}
Email: ${email}
Location: ${location}

--- FINANCIAL INFORMATION ---
Annual Income: $${income}
Monthly Rent Budget: $${monthlyBudget}
Monthly Housing Income: $${monthlyIncome}

--- HOUSING PREFERENCES ---
Bedrooms: ${bedrooms}
Housing Types: ${housingTypesText}

--- BACKGROUND INFORMATION ---
Credit Challenges: ${creditChallengesText}
Criminal History: ${criminalHistory}
Evictions: ${evictions}`;
        
        await notifyOwner({
          title: `New Form Submission from ${fullName}`,
          content,
        });
      } catch (emailError) {
        console.error("Failed to send admin notification:", emailError);
        // Don't fail the request if email notification fails
      }

      res.json({ success: true, submissionId });
    } catch (error) {
      console.error("Form submission error:", error);
      res.status(500).json({ error: "Failed to process form submission" });
    }
  });
}
