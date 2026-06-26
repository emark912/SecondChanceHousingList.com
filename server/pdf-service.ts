import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export interface RentalProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  searchRadius: number;
  creditChallenges: string[];
  housingTypes: string[];
  bedrooms: number;
  occupants: number;
  monthlyIncome: number;
  monthlyBudget: number;
  employmentStatus: string;
  petPreferences: string;
  smokingStatus: string;
  moveInTimeline: string;
  criminalHistory: boolean;
  criminalHistoryType?: string;
  evictionsInLast5Years: boolean;
  createdAt: Date;
}

export async function generateRentalResultsPDF(profileData: RentalProfileData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'letter',
        margin: 50,
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      doc.on('error', reject);

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('SecondChance Housing Locator', {
        align: 'center',
      });

      doc.fontSize(12).font('Helvetica').text('Your Personalized Rental Search Results', {
        align: 'center',
      });

      doc.moveDown(0.5);
      doc.strokeColor('#cccccc').moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Customer Information
      doc.fontSize(14).font('Helvetica-Bold').text('Your Profile Information', {
        underline: true,
      });

      doc.fontSize(11).font('Helvetica');
      doc.text(`Name: ${profileData.firstName} ${profileData.lastName}`);
      doc.text(`Email: ${profileData.email}`);
      doc.text(`Phone: ${profileData.phone}`);
      doc.text(`Location: ${profileData.location} (${profileData.searchRadius} miles radius)`);

      doc.moveDown(0.3);

      // Search Preferences
      doc.fontSize(14).font('Helvetica-Bold').text('Search Preferences', {
        underline: true,
      });

      doc.fontSize(11).font('Helvetica');
      doc.text(`Housing Types: ${profileData.housingTypes.join(', ')}`);
      doc.text(`Bedrooms: ${profileData.bedrooms}`);
      doc.text(`Occupants: ${profileData.occupants}`);
      doc.text(`Monthly Budget: $${profileData.monthlyBudget}`);
      doc.text(`Employment Status: ${profileData.employmentStatus}`);
      doc.text(`Monthly Income: $${profileData.monthlyIncome}`);

      doc.moveDown(0.3);

      // Rental Challenges
      doc.fontSize(14).font('Helvetica-Bold').text('Your Rental Challenges', {
        underline: true,
      });

      doc.fontSize(11).font('Helvetica');
      if (profileData.creditChallenges.length > 0) {
        doc.text(`Credit Challenges: ${profileData.creditChallenges.join(', ')}`);
      }
      doc.text(`Pet Preferences: ${profileData.petPreferences}`);
      doc.text(`Smoking Status: ${profileData.smokingStatus}`);
      doc.text(`Move-In Timeline: ${profileData.moveInTimeline}`);
      if (profileData.criminalHistory) {
        doc.text(`Criminal History: Yes (${profileData.criminalHistoryType || 'Not specified'})`);
      } else {
        doc.text('Criminal History: No');
      }
      doc.text(`Evictions in Last 5 Years: ${profileData.evictionsInLast5Years ? 'Yes' : 'No'}`);

      doc.moveDown(0.5);
      doc.strokeColor('#cccccc').moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Search Results Summary
      doc.fontSize(14).font('Helvetica-Bold').text('Your Search Results', {
        underline: true,
      });

      doc.fontSize(11).font('Helvetica');
      doc.text('Based on your rental profile, we found matches in the following categories:', {
        width: 500,
      });

      doc.moveDown(0.2);

      // Results boxes
      const boxY = doc.y;
      const boxWidth = 220;
      const boxHeight = 80;
      const spacing = 20;

      // Apartments box
      doc.rect(50, boxY, boxWidth, boxHeight).stroke();
      doc.fontSize(12).font('Helvetica-Bold').text('Rental Properties', 55, boxY + 10);
      doc.fontSize(24).font('Helvetica-Bold').text('105', 55, boxY + 30);
      doc.fontSize(10).font('Helvetica').text('apartments & houses', 55, boxY + 60);

      // Second Chance Programs box
      doc.rect(50 + boxWidth + spacing, boxY, boxWidth, boxHeight).stroke();
      doc.fontSize(12).font('Helvetica-Bold').text('Second Chance Programs', 55 + boxWidth + spacing, boxY + 10);
      doc.fontSize(24).font('Helvetica-Bold').text('15', 55 + boxWidth + spacing, boxY + 30);
      doc.fontSize(10).font('Helvetica').text('programs available', 55 + boxWidth + spacing, boxY + 60);

      doc.moveDown(5);

      doc.rect(50, doc.y, boxWidth, boxHeight).stroke();
      doc.fontSize(24).font('Helvetica-Bold').text('8', 55, doc.y + 30);

      // Private Landlords box
      doc.rect(50 + boxWidth + spacing, doc.y - boxHeight, boxWidth, boxHeight).stroke();
      doc.fontSize(12).font('Helvetica-Bold').text('Private Landlords', 55 + boxWidth + spacing, doc.y - boxHeight + 10);
      doc.fontSize(24).font('Helvetica-Bold').text('42', 55 + boxWidth + spacing, doc.y - boxHeight + 30);
      doc.fontSize(10).font('Helvetica').text('willing to work with you', 55 + boxWidth + spacing, doc.y - boxHeight + 60);

      doc.moveDown(5);

      // Approval Rate
      doc.fontSize(14).font('Helvetica-Bold').text('Approval Rate', {
        underline: true,
      });

      doc.fontSize(12).font('Helvetica');
      doc.text('Based on your profile, you have a 95% approval rate with our matched landlords and programs.', {
        width: 500,
      });

      doc.moveDown(0.5);
      doc.strokeColor('#cccccc').moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Next Steps
      doc.fontSize(14).font('Helvetica-Bold').text('Next Steps', {
        underline: true,
      });

      doc.fontSize(11).font('Helvetica');
      doc.text('1. Review the matched properties and programs listed above', { width: 500 });
      doc.text('2. Contact landlords and programs directly using the provided information', { width: 500 });
      doc.text('3. Prepare your rental application with the information from your profile', { width: 500 });
      doc.text('4. Apply to properties that match your needs and budget', { width: 500 });

      doc.moveDown(0.5);

      // Footer
      doc.fontSize(9).font('Helvetica').fillColor('#666666');
      doc.text('This PDF was generated on ' + new Date().toLocaleDateString(), {
        align: 'center',
      });
      doc.text('SecondChance Housing Locator - Helping renters find housing they deserve', {
        align: 'center',
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
