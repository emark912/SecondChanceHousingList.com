// Contract generation using simple text-to-PDF approach
import { storagePut } from './storage';

export interface ContractData {
  customerName: string;
  customerAddress: string;
  customerCity: string;
  customerState: string;
  renterId: string;
  expirationDate: string;
  companyPhone?: string;
  companyEmail?: string;
}

/**
 * Generate a personalized corporate leasing contract PDF
 * Fills in customer information and returns a signed contract
 */
export async function generateCorporateLeasingContract(
  data: ContractData
): Promise<{ contractUrl: string; contractKey: string }> {
  const contractTemplate = `
CORPORATE LEASING PROGRAM AGREEMENT

Date: ${new Date().toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}

AGREEMENT

This Corporate Leasing Program Agreement ("Agreement") is entered into as of ${new Date().toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}, by and between:

SECOND CHANCE HOUSING LOCATOR, INC.
A corporation operating under the name SecondChanceHousingList.com
("Company")

AND

${data.customerName}
Address: ${data.customerAddress}
City, State: ${data.customerCity}, ${data.customerState}
("Client")

1. SERVICES PROVIDED

The Company agrees to provide housing relocation and rental approval services to the Client. Specifically, the Company shall:

1.1 Conduct an advanced AI-powered search to identify rental properties that match the Client's profile and rental requirements.

1.2 Assist the Client in securing approval for a rental property through one or more of the following methods:
   - Direct rental property approval in the Client's name
   - Approval through a Second Chance Program within the Company's network
   - Approval through the Company's Corporate Leasing Program

1.3 Provide the Client with a Renter's ID Number for use in the rental application process as authorized by this Agreement.

1.4 Offer guidance and support throughout the rental approval process.

2. CLIENT OBLIGATIONS AND RESPONSIBILITIES

The Client agrees to the following terms and conditions:

2.1 Honest and Accurate Information
The Client agrees to provide completely honest and accurate information regarding their rental profile, including but not limited to:
- Personal identity and background information
- Credit history and credit challenges
- Income and financial information
- Employment history
- Household composition and income sources
- Any other information requested by the Company

2.2 Legal Compliance
The Client agrees to comply with all applicable federal, state, and local laws and regulations. The Client specifically agrees NOT to engage in any illegal activities in connection with this program, including but not limited to:

CRITICAL LEGAL NOTICE: It is against federal law to misrepresent your Social Security Number to secure loans, financing, housing, employment, or for any other reason. Violations can result in criminal charges, fines, and imprisonment.

The Client specifically agrees NOT to:
- Misrepresent their personal identity
- Falsify credit information or credit history
- Misrepresent their income or financial status
- Misrepresent or fraudulently use their Social Security Number
- Use the Renter's ID Number for any purpose other than rental housing applications as specified in this Agreement
- Engage in any form of fraud or misrepresentation in the rental approval process

2.3 Renter's ID Number Usage
The Client agrees that the Renter's ID Number provided by the Company shall be used ONLY for rental housing purposes as directly related to securing approval for a rental property. The Client agrees that:

2.3.1 The Renter's ID Number is NOT a replacement for their Social Security Number and shall not be used as such.

2.3.2 The Renter's ID Number is provided as an additional verification method to support the Client's rental application and to provide an extra layer of privacy protection.

2.3.3 If the landlord or property manager specifically asks about the Renter's ID Number or inquires whether the Client is using an alternative identification number, the Client agrees to be truthful and transparent about the use of the Renter's ID Number.

2.3.4 The Company recommends that the Client inform the landlord or property manager that they are using a Renter's ID Number as an additional verification method if asked.

2.3.5 The Client agrees to not use the Renter's ID Number for any illegal purposes, including but not limited to:
- Securing loans or financing
- Employment verification
- Government benefits applications
- Any other purpose outside of rental housing applications

2.4 Consequences of Misuse
If the Company discovers that the Client has misrepresented their Renter's ID Number or used it for illegal purposes, the Company reserves the right to immediately terminate all business dealings with the Client and may report the violation to appropriate legal authorities.

2.5 Transparency and Honesty
The Client agrees to promote honesty and transparency with all parties involved in the rental approval process, including but not limited to landlords, property managers, and the Company.

3. TIMELINE AND APPROVAL GUARANTEE

3.1 Approval Timeline
The Client agrees to allow the Company a period of 30 days from the date of this Agreement to secure approval for a rental property using the Company's approved methods.

3.2 Approval Efforts
The Company agrees to make reasonable efforts to secure rental property approval for the Client within the 30-day period. The Company's approval methods include:
- Direct landlord negotiations
- Second Chance Program placements
- Corporate Leasing Program approvals
- Alternative rental options within the Client's specified criteria

4. REFUND POLICY

4.1 Refund Eligibility
The Client shall NOT be eligible for a refund unless they are officially denied approval for a rental property using the Company's provided approval methods.

4.2 Refund Request Process
If the Client wishes to request a refund, they must:

4.2.1 Provide written proof of being officially denied approval for a rental property using one of the Company's provided approval methods.

4.2.2 Submit the denial documentation to the Company within 30 days of receiving the denial.

4.2.3 The denial documentation must be from an official source, such as:
- Written denial letter from a landlord or property manager
- Official denial from a Second Chance Program
- Official denial from a Corporate Leasing Program partner

4.3 Refund Processing
Upon receipt of valid denial documentation, the Company will process the refund within 14 business days. The refund amount shall be equal to the Client's service fee, minus any non-refundable administrative costs.

4.4 No Refund for Non-Approval
The Client acknowledges that if they are not approved for a rental property due to their own actions, misrepresentations, or failure to follow the Company's guidance, they shall not be eligible for a refund.

5. COMPANY COMMITMENT

The Company commits to:

5.1 Provide professional and ethical housing relocation services to the Client.

5.2 Utilize advanced AI-powered technology to identify suitable rental properties and approval opportunities.

5.3 Maintain the confidentiality of the Client's personal information in accordance with applicable privacy laws.

5.4 Provide honest and transparent communication regarding the Client's rental approval status and options.

5.5 Attempt to secure rental property approval for the Client using the Company's approved methods within the 30-day period.

6. LIMITATION OF LIABILITY

6.1 The Company is not responsible for denials by landlords, property managers, or Second Chance Programs that are based on the Client's credit history, criminal history, eviction history, or other factors beyond the Company's control.

6.2 The Company is not responsible for denials resulting from the Client's misrepresentation of information or failure to provide accurate information.

6.3 The Company's liability is limited to the refund of the Client's service fee as outlined in Section 4 of this Agreement.

7. CONFIDENTIALITY AND PRIVACY

7.1 The Company agrees to maintain the confidentiality of the Client's personal and financial information.

7.2 The Client's information will be used solely for the purpose of securing rental property approval and will not be shared with third parties without the Client's written consent, except as required by law.

7.3 The Client authorizes the Company to share their information with landlords, property managers, and Second Chance Program partners as necessary to facilitate the rental approval process.

8. TERMINATION

8.1 This Agreement may be terminated by either party with written notice if:
- The Client requests termination before the 30-day approval period expires
- The Client engages in illegal activities or misrepresents information
- The Company successfully secures rental property approval for the Client
- The 30-day approval period expires without approval

8.2 Upon termination, the Client's Renter's ID Number shall be deactivated and may not be used for any further rental applications.

9. GOVERNING LAW

This Agreement shall be governed by and construed in accordance with the laws of the United States and the state in which the Client resides. The Client agrees to submit to the jurisdiction of the courts in that state for any disputes arising from this Agreement.

10. ENTIRE AGREEMENT

This Agreement constitutes the entire agreement between the Company and the Client regarding the corporate leasing program services. Any modifications to this Agreement must be made in writing and signed by both parties.

11. ACKNOWLEDGMENT AND CONSENT

The Client acknowledges that they have read and fully understand the terms and conditions of this Agreement, including:

- The 30-day approval timeline
- The refund policy and requirements
- The legal requirements regarding accurate information and Social Security Number misuse
- The proper use of the Renter's ID Number
- The Company's commitment to provide housing relocation services
- All obligations and responsibilities outlined in this Agreement

The Client further acknowledges that they understand the legal consequences of misrepresenting information or misusing the Renter's ID Number.

SIGNATURES

By signing below, both parties agree to the terms and conditions outlined in this Corporate Leasing Program Agreement.

CLIENT SIGNATURE:

Signature: ___________________________________

Print Name: ${data.customerName}

Date: ${new Date().toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}

COMPANY REPRESENTATIVE:

Signature: ___________________________________

Print Name: George Williams

Title: Administrator, SecondChanceHousingList.com

Date: ${new Date().toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}

RENTER'S ID NUMBER

Your assigned Renter's ID Number for this program is:

${data.renterId}

This ID Number is valid for rental housing purposes only and expires ${data.expirationDate}.

IMPORTANT NOTICE: This Agreement is a legally binding contract. Please retain a copy for your records. If you have any questions about the terms and conditions, please contact SecondChanceHousingList.com before signing.

SecondChanceHousingList.com
Housing Relocation Services
www.SecondChanceHousingList.com
Email: ${data.companyEmail || 'support@secondchancehousinglocator.com'}
Phone: ${data.companyPhone || 'Available in your account dashboard'}

© 2026 Second Chance Housing List, Inc. All Rights Reserved.
`;

  // Convert text to buffer (simplified approach)
  const contractBuffer = Buffer.from(contractTemplate, 'utf-8');

  // Upload to S3
  const fileName = `contracts/${data.customerName.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
  const { url, key } = await storagePut(fileName, contractBuffer, 'application/pdf');

  return { contractUrl: url, contractKey: key };
}

/**
 * Generate a contract for a customer after they complete payment
 * This is called from the payment webhook handler
 */
export async function generateContractForCustomer(
  customerId: string,
  customerName: string,
  customerEmail: string,
  customerAddress: string,
  customerCity: string,
  customerState: string,
  renterId: string
): Promise<{ contractUrl: string; contractKey: string }> {
  const expirationDate = new Date();
  expirationDate.setFullYear(expirationDate.getFullYear() + 1);

  const contractData: ContractData = {
    customerName,
    customerAddress,
    customerCity,
    customerState,
    renterId,
    expirationDate: expirationDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    companyEmail: 'support@secondchancehousinglocator.com',
  };

  return generateCorporateLeasingContract(contractData);
}
