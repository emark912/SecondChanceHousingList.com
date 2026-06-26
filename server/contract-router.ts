import { z } from 'zod';
import { router, protectedProcedure } from './_core/trpc';

export const contractRouter = router({
  /**
   */
    .input(
      z.object({
        customerAddress: z.string().min(1, 'Address is required'),
        customerCity: z.string().min(1, 'City is required'),
        customerState: z.string().min(2, 'State is required'),
        renterId: z.string().min(1, 'Renter ID is required'),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      const user = ctx.user;

      if (!user) {
        throw new Error('User not authenticated');
      }

      const expirationDate = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);

        customerName: user.name || 'Valued Customer',
        customerAddress: input.customerAddress,
        customerCity: input.customerCity,
        customerState: input.customerState,
        renterId: input.renterId,
        expirationDate: expirationDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        companyEmail: 'support@secondchancehousinglocator.com',
      });

      return {
        contractUrl: result.contractUrl,
        contractKey: result.contractKey,
        renterId: input.renterId,
        expirationDate: expirationDate.toISOString(),
      };
    }),

  /**
   * Get contract download link for a previously generated contract
   */
  getContractDownloadLink: protectedProcedure
    .input(
      z.object({
        contractKey: z.string().min(1, 'Contract key is required'),
      })
    )
    .query(async ({ ctx, input }: any) => {
      // In a real implementation, you would verify that the user owns this contract
      // For now, we'll just return the key for the storage service to retrieve

      return {
        contractKey: input.contractKey,
        downloadUrl: `/api/contracts/download/${input.contractKey}`,
      };
    }),
});
