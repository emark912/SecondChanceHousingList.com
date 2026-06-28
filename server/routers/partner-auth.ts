/**
 * Partner Authentication Router
 * tRPC procedures for partner signup, login, and account management
 */

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  createPartnerAccount,
  authenticatePartner,
  verifyPartnerEmail,
  changePartnerPassword,
  updatePartnerProfile,
  getPartnerById,
} from "../partner-auth-service";
import { sendPartnerEmail } from "../partner-email-service";

export const partnerAuthRouter = router({
  /**
   * Create partner account (signup)
   */
  signup: publicProcedure
    .input(
      z.object({
        partnerName: z.string().min(2, "Partner name required"),
        businessName: z.string().min(2, "Business name required"),
        email: z.string().email("Valid email required"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Validate passwords match
      if (input.password !== input.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Generate verification code
      const verificationCode = Math.random().toString().slice(2, 8);

      // Create account
      const result = await createPartnerAccount(
        input.partnerName,
        input.businessName,
        input.email,
        input.password,
        verificationCode
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to create account");
      }

      // Send verification email
      try {
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">Verify Your Email</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Welcome to the Partnership Program, ${input.partnerName}!</p>
              
              <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                Thank you for signing up. To complete your registration and access your partner account, please verify your email address using the code below:
              </p>
              
              <div style="background: white; border: 2px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; text-align: center;">
                <p style="font-size: 12px; color: #999; margin: 0 0 10px 0;">Verification Code</p>
                <p style="font-size: 32px; font-weight: bold; color: #667eea; margin: 0; letter-spacing: 5px;">${verificationCode}</p>
              </div>
              
              <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                This code will expire in 24 hours. If you didn't create this account, please ignore this email.
              </p>
              
              <p style="font-size: 12px; color: #999; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
                Best regards,<br>
                <strong>Partnership Program Team</strong>
              </p>
            </div>
          </div>
        `;

        await sendPartnerEmail({
          to: input.email,
          subject: "Verify Your Email - Partnership Program",
          html,
          partnerId: result.partnerId || 0,
          emailType: "verification_code",
        });
      } catch (error) {
        console.error("[Partner Auth] Error sending verification email:", error);
      }

      return {
        success: true,
        message: "Account created. Check your email for verification code.",
        partnerId: result.partnerId,
      };
    }),

  /**
   * Verify email with code
   */
  verifyEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        verificationCode: z.string().length(6),
      })
    )
    .mutation(async ({ input }) => {
      const result = await verifyPartnerEmail(input.email, input.verificationCode);

      if (!result.success) {
        throw new Error(result.error || "Verification failed");
      }

      return { success: true, message: "Email verified successfully" };
    }),

  /**
   * Login partner
   */
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await authenticatePartner(input.email, input.password);

      if (!result.success) {
        throw new Error(result.error || "Authentication failed");
      }

      // Set session cookie
      if (ctx.res) {
        ctx.res.setHeader(
          "Set-Cookie",
          `partner_id=${result.partnerId}; Path=/; HttpOnly; SameSite=Strict`
        );
      }

      return {
        success: true,
        partnerId: result.partnerId,
        message: "Logged in successfully",
      };
    }),

  /**
   * Get current partner profile
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    // Get partner ID from session/context
    // This assumes you have partner ID in context
    // For now, returning a placeholder
    return { success: false, error: "Not implemented" };
  }),

  /**
   * Update partner profile
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        partnerName: z.string().optional(),
        businessName: z.string().optional(),
        businessPhone: z.string().optional(),
        businessAddress: z.string().optional(),
        businessCity: z.string().optional(),
        businessState: z.string().optional(),
        businessZip: z.string().optional(),
        billingEmail: z.string().email().optional(),
        billingName: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Get partner ID from context (would be set during login)
      const partnerId = (ctx as any).partnerId;
      if (!partnerId) {
        throw new Error("Not authenticated");
      }

      const result = await updatePartnerProfile(partnerId, input);

      if (!result.success) {
        throw new Error(result.error || "Failed to update profile");
      }

      return { success: true, message: "Profile updated successfully" };
    }),

  /**
   * Change password
   */
  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8),
        confirmPassword: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Validate passwords match
      if (input.newPassword !== input.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const partnerId = (ctx as any).partnerId;
      if (!partnerId) {
        throw new Error("Not authenticated");
      }

      const result = await changePartnerPassword(
        partnerId,
        input.currentPassword,
        input.newPassword
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to change password");
      }

      return { success: true, message: "Password changed successfully" };
    }),

  /**
   * Logout partner
   */
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    // Clear session cookie
    if (ctx.res) {
      ctx.res.setHeader(
        "Set-Cookie",
        "partner_id=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0"
      );
    }

    return { success: true, message: "Logged out successfully" };
  }),
});
