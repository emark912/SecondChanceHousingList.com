import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContractModal: React.FC<ContractModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Corporate Leasing Program Agreement</h2>
            <p className="text-blue-100 text-sm mt-1">Please review before proceeding with payment</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 p-2 rounded-lg transition-colors"
            aria-label="Close contract"
          >
            <X size={24} />
          </button>
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 border-l-4 border-blue-600 px-6 py-4">
          <p className="text-sm text-blue-900">
            <strong>Important:</strong> After you complete your payment for the Corporate Leasing Program, you will receive this legally binding contract via email. Once you become an official client, you will be assigned a unique Renter's ID Number that will be included in your contract.
          </p>
        </div>

        {/* Contract Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="prose prose-sm max-w-none">
            <h3 className="text-lg font-bold mt-0 mb-4">CORPORATE LEASING PROGRAM AGREEMENT</h3>

            <p>
              <strong>Date:</strong> February 25, 2026
            </p>

            <h4 className="font-bold mt-6 mb-2">AGREEMENT</h4>
            <p>
              This Corporate Leasing Program Agreement ("Agreement") is entered into as of February 25, 2026, by and between:
            </p>
            <p>
              <strong>SECOND CHANCE HOUSING LOCATOR, INC.</strong><br />
              A corporation operating under the name SecondChanceHousingList.com<br />
              ("Company")
            </p>
            <p>
              AND
            </p>
            <p>
              <strong>[CUSTOMER NAME]</strong><br />
              City, State: [CUSTOMER CITY], [CUSTOMER STATE]<br />
              ("Client")
            </p>

            <h4 className="font-bold mt-6 mb-2">1. SERVICES PROVIDED</h4>
            <p>
              The Company agrees to provide housing relocation and rental approval services to the Client. Specifically, the Company shall:
            </p>
            <ul>
              <li>Conduct an advanced AI-powered search to identify rental properties that match the Client's profile and rental requirements.</li>
              <li>Assist the Client in securing approval for a rental property through one or more of the following methods:
                <ul>
                  <li>Direct rental property approval in the Client's name</li>
                  <li>Approval through a Second Chance Program within the Company's network</li>
                  <li>Approval through the Company's Corporate Leasing Program</li>
                </ul>
              </li>
              <li>Provide the Client with a Renter's ID Number for use in the rental application process as authorized by this Agreement.</li>
              <li>Offer guidance and support throughout the rental approval process.</li>
            </ul>

            <h4 className="font-bold mt-6 mb-2">2. CLIENT OBLIGATIONS AND RESPONSIBILITIES</h4>
            <p>
              The Client agrees to the following terms and conditions:
            </p>

            <h5 className="font-semibold mt-4 mb-2">2.1 Honest and Accurate Information</h5>
            <p>
              The Client agrees to provide completely honest and accurate information regarding their rental profile, including but not limited to:
            </p>
            <ul>
              <li>Personal identity and background information</li>
              <li>Credit history and credit challenges</li>
              <li>Income and financial information</li>
              <li>Employment history</li>
              <li>Household composition and income sources</li>
              <li>Any other information requested by the Company</li>
            </ul>

            <h5 className="font-semibold mt-4 mb-2">2.2 Legal Compliance</h5>
            <p>
              The Client agrees to comply with all applicable federal, state, and local laws and regulations. The Client specifically agrees NOT to engage in any illegal activities in connection with this program, including but not limited to:
            </p>
            <div className="bg-red-50 border border-red-200 p-4 my-4 rounded">
              <p className="text-red-900 font-semibold mb-2">
                ⚠️ CRITICAL LEGAL NOTICE
              </p>
              <p className="text-red-900 text-sm">
                It is against federal law to misrepresent your Social Security Number to secure loans, financing, housing, employment, or for any other reason. Violations can result in criminal charges, fines, and imprisonment.
              </p>
            </div>

            <p>
              The Client specifically agrees NOT to:
            </p>
            <ul>
              <li>Misrepresent their personal identity</li>
              <li>Falsify credit information or credit history</li>
              <li>Misrepresent their income or financial status</li>
              <li>Misrepresent or fraudulently use their Social Security Number</li>
              <li>Use the Renter's ID Number for any purpose other than rental housing applications as specified in this Agreement</li>
              <li>Engage in any form of fraud or misrepresentation in the rental approval process</li>
            </ul>

            <h5 className="font-semibold mt-4 mb-2">2.3 Renter's ID Number Usage</h5>
            <p>
              The Client agrees that the Renter's ID Number provided by the Company shall be used ONLY for rental housing purposes as directly related to securing approval for a rental property. The Client agrees that:
            </p>
            <ul>
              <li>The Renter's ID Number is NOT a replacement for their Social Security Number and shall not be used as such.</li>
              <li>The Renter's ID Number is provided as an additional verification method to support the Client's rental application and to provide an extra layer of privacy protection.</li>
              <li>If the landlord or property manager specifically asks about the Renter's ID Number or inquires whether the Client is using an alternative identification number, the Client agrees to be truthful and transparent about the use of the Renter's ID Number.</li>
              <li>The Company recommends that the Client inform the landlord or property manager that they are using a Renter's ID Number as an additional verification method if asked.</li>
              <li>The Client agrees to not use the Renter's ID Number for any illegal purposes, including but not limited to:
                <ul>
                  <li>Securing loans or financing</li>
                  <li>Employment verification</li>
                  <li>Government benefits applications</li>
                  <li>Any other purpose outside of rental housing applications</li>
                </ul>
              </li>
            </ul>

            <h5 className="font-semibold mt-4 mb-2">2.4 Consequences of Misuse</h5>
            <p>
              If the Company discovers that the Client has misrepresented their Renter's ID Number or used it for illegal purposes, the Company reserves the right to immediately terminate all business dealings with the Client and may report the violation to appropriate legal authorities.
            </p>

            <h5 className="font-semibold mt-4 mb-2">2.5 Transparency and Honesty</h5>
            <p>
              The Client agrees to promote honesty and transparency with all parties involved in the rental approval process, including but not limited to landlords, property managers, and the Company.
            </p>

            <h4 className="font-bold mt-6 mb-2">3. TIMELINE AND APPROVAL GUARANTEE</h4>
            <h5 className="font-semibold mt-4 mb-2">3.1 Approval Timeline</h5>
            <p>
              The Client agrees to allow the Company a period of <strong>30 days</strong> from the date of this Agreement to secure approval for a rental property using the Company's approved methods.
            </p>

            <h5 className="font-semibold mt-4 mb-2">3.2 Approval Efforts</h5>
            <p>
              The Company agrees to make reasonable efforts to secure rental property approval for the Client within the 30-day period. The Company's approval methods include:
            </p>
            <ul>
              <li>Direct landlord negotiations</li>
              <li>Second Chance Program placements</li>
              <li>Corporate Leasing Program approvals</li>
              <li>Alternative rental options within the Client's specified criteria</li>
            </ul>

            <h4 className="font-bold mt-6 mb-2">4. REFUND POLICY</h4>
            <h5 className="font-semibold mt-4 mb-2">4.1 Refund Eligibility</h5>
            <p>
              The Client shall NOT be eligible for a refund unless they are officially denied approval for a rental property using the Company's provided approval methods.
            </p>

            <h5 className="font-semibold mt-4 mb-2">4.2 Refund Request Process</h5>
            <p>
              If the Client wishes to request a refund, they must:
            </p>
            <ul>
              <li>Provide written proof of being officially denied approval for a rental property using one of the Company's provided approval methods.</li>
              <li>Submit the denial documentation to the Company within 30 days of receiving the denial.</li>
              <li>The denial documentation must be from an official source, such as:
                <ul>
                  <li>Written denial letter from a landlord or property manager</li>
                  <li>Official denial from a Second Chance Program</li>
                  <li>Official denial from a Corporate Leasing Program partner</li>
                </ul>
              </li>
            </ul>

            <h5 className="font-semibold mt-4 mb-2">4.3 Refund Processing</h5>
            <p>
              Upon receipt of valid denial documentation, the Company will process the refund within 14 business days. The refund amount shall be equal to the Client's service fee, minus any non-refundable administrative costs.
            </p>

            <h5 className="font-semibold mt-4 mb-2">4.4 No Refund for Non-Approval</h5>
            <p>
              The Client acknowledges that if they are not approved for a rental property due to their own actions, misrepresentations, or failure to follow the Company's guidance, they shall not be eligible for a refund.
            </p>

            <h4 className="font-bold mt-6 mb-2">5. COMPANY COMMITMENT</h4>
            <p>
              The Company commits to:
            </p>
            <ul>
              <li>Provide professional and ethical housing relocation services to the Client.</li>
              <li>Utilize advanced AI-powered technology to identify suitable rental properties and approval opportunities.</li>
              <li>Maintain the confidentiality of the Client's personal information in accordance with applicable privacy laws.</li>
              <li>Provide honest and transparent communication regarding the Client's rental approval status and options.</li>
              <li>Attempt to secure rental property approval for the Client using the Company's approved methods within the 30-day period.</li>
            </ul>

            <h4 className="font-bold mt-6 mb-2">6. LIMITATION OF LIABILITY</h4>
            <ul>
              <li>The Company is not responsible for denials by landlords, property managers, or Second Chance Programs that are based on the Client's credit history, criminal history, eviction history, or other factors beyond the Company's control.</li>
              <li>The Company is not responsible for denials resulting from the Client's misrepresentation of information or failure to provide accurate information.</li>
              <li>The Company's liability is limited to the refund of the Client's service fee as outlined in Section 4 of this Agreement.</li>
            </ul>

            <h4 className="font-bold mt-6 mb-2">7. CONFIDENTIALITY AND PRIVACY</h4>
            <ul>
              <li>The Company agrees to maintain the confidentiality of the Client's personal and financial information.</li>
              <li>The Client's information will be used solely for the purpose of securing rental property approval and will not be shared with third parties without the Client's written consent, except as required by law.</li>
              <li>The Client authorizes the Company to share their information with landlords, property managers, and Second Chance Program partners as necessary to facilitate the rental approval process.</li>
            </ul>

            <h4 className="font-bold mt-6 mb-2">8. TERMINATION</h4>
            <ul>
              <li>This Agreement may be terminated by either party with written notice if:
                <ul>
                  <li>The Client requests termination before the 30-day approval period expires</li>
                  <li>The Client engages in illegal activities or misrepresents information</li>
                  <li>The Company successfully secures rental property approval for the Client</li>
                  <li>The 30-day approval period expires without approval</li>
                </ul>
              </li>
              <li>Upon termination, the Client's Renter's ID Number shall be deactivated and may not be used for any further rental applications.</li>
            </ul>

            <h4 className="font-bold mt-6 mb-2">9. GOVERNING LAW</h4>
            <p>
              This Agreement shall be governed by and construed in accordance with the laws of the United States and the state in which the Client resides. The Client agrees to submit to the jurisdiction of the courts in that state for any disputes arising from this Agreement.
            </p>

            <h4 className="font-bold mt-6 mb-2">10. ENTIRE AGREEMENT</h4>
            <p>
              This Agreement constitutes the entire agreement between the Company and the Client regarding the corporate leasing program services. Any modifications to this Agreement must be made in writing and signed by both parties.
            </p>

            <h4 className="font-bold mt-6 mb-2">11. ACKNOWLEDGMENT AND CONSENT</h4>
            <p>
              The Client acknowledges that they have read and fully understand the terms and conditions of this Agreement, including:
            </p>
            <ul>
              <li>The 30-day approval timeline</li>
              <li>The refund policy and requirements</li>
              <li>The legal requirements regarding accurate information and Social Security Number misuse</li>
              <li>The proper use of the Renter's ID Number</li>
              <li>The Company's commitment to provide housing relocation services</li>
              <li>All obligations and responsibilities outlined in this Agreement</li>
            </ul>

            <p>
              The Client further acknowledges that they understand the legal consequences of misrepresenting information or misusing the Renter's ID Number.
            </p>

            <h4 className="font-bold mt-6 mb-2">SIGNATURES</h4>
            <p>
              By signing below, both parties agree to the terms and conditions outlined in this Corporate Leasing Program Agreement.
            </p>

            <div className="mt-8 border-t pt-6">
              <p className="font-semibold mb-4">CLIENT SIGNATURE:</p>
              <p className="mb-6">Signature: ___________________________________</p>
              <p className="mb-6">Print Name: ___________________________________</p>
              <p className="mb-6">Date: ___________________________________</p>

              <p className="font-semibold mb-4 mt-8">COMPANY REPRESENTATIVE:</p>
              <p className="mb-6">Signature: <strong>George Williams</strong> ✓</p>
              <p className="mb-6">Print Name: <strong>George Williams</strong></p>
              <p className="mb-6">Title: <strong>Administrator, SecondChanceHousingList.com</strong></p>
              <p className="mb-6">Date: <strong>February 25, 2026</strong></p>
            </div>

            <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 rounded">
              <p className="text-sm text-yellow-900">
                <strong>IMPORTANT NOTICE:</strong> This Agreement is a legally binding contract. Please retain a copy for your records. If you have any questions about the terms and conditions, please contact SecondChanceHousingList.com before signing.
              </p>
            </div>

            <div className="mt-8 text-center text-sm text-gray-600 border-t pt-6">
              <p><strong>SecondChanceHousingList.com</strong></p>
              <p>Housing Relocation Services</p>
              <p>www.SecondChanceHousingList.com</p>
              <p>Email: support@secondchancehousinglocator.com</p>
              <p className="mt-4">© 2026 Second Chance Housing List, Inc. All Rights Reserved.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
