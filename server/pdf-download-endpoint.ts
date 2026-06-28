import { z } from "zod";
import { publicProcedure } from "./_core/trpc";

export const downloadRentalPDFEndpoint = publicProcedure
  .input(z.object({
    orderId: z.number(),
    customerName: z.string(),
    customerEmail: z.string().email(),
    location: z.string(),
    totalMatches: z.number(),
    apartmentMatches: z.number(),
    houseMatches: z.number(),
    programMatches: z.number(),
    corporateMatches: z.number(),
    landlordMatches: z.number(),
    creditChallenges: z.array(z.string()),
    housingTypes: z.array(z.string()),
    bedrooms: z.number(),
    donationAmount: z.number(),
    includeCaseManager: z.boolean(),
    totalAmount: z.number(),
  }))
  .query(async ({ input }) => {
    try {
      const { generateRentalResultsPDF } = await import('./pdf-service');
      const nameParts = input.customerName.split(' ');
      const firstName = nameParts[0] || 'Customer';
      const lastName = nameParts.slice(1).join(' ') || '';
      const pdfData = {
        firstName,
        lastName,
        email: input.customerEmail,
        phone: '',
        location: input.location,
        searchRadius: 25,
        creditChallenges: input.creditChallenges,
        housingTypes: input.housingTypes,
        bedrooms: input.bedrooms,
        occupants: 1,
        monthlyIncome: 0,
        monthlyBudget: 0,
        employmentStatus: 'unknown',
        petPreferences: 'none',
        smokingStatus: 'non-smoker',
        moveInTimeline: 'flexible',
        criminalHistory: false,
        evictionsInLast5Years: false,
        createdAt: new Date(),
      };
      const pdfBuffer = await generateRentalResultsPDF(pdfData);
      return {
        success: true,
        pdfBuffer: pdfBuffer.toString('base64'),
        filename: `rental-search-results-${input.location.replace(/\s+/g, '-').toLowerCase()}.pdf`,
      };
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      throw new Error('Failed to generate rental PDF');
    }
  });
