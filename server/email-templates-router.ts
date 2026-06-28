import { z } from "zod";
import nodemailer from "nodemailer";
import { adminProcedure, router } from "./_core/trpc";
import {
  createEmailTemplate,
  getEmailTemplateById,
  getEmailTemplatesByType,
  getDefaultEmailTemplate,
  getAllEmailTemplates,
  updateEmailTemplate,
  deleteEmailTemplate,
  setDefaultEmailTemplate,
  duplicateEmailTemplate,
} from "./db";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const emailTemplatesRouter = router({
  getAll: adminProcedure.query(async () => {
    return await getAllEmailTemplates();
  }),
  getById: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return await getEmailTemplateById(input.id);
  }),
  getByType: adminProcedure.input(z.object({ templateType: z.string() })).query(async ({ input }) => {
    return await getEmailTemplatesByType(input.templateType);
  }),
  getDefault: adminProcedure.input(z.object({ templateType: z.string() })).query(async ({ input }) => {
    return await getDefaultEmailTemplate(input.templateType);
  }),
  create: adminProcedure
    .input(z.object({
      templateType: z.enum(["abandoned_checkout_20min", "abandoned_checkout_3day"]),
      templateName: z.string(),
      subject: z.string(),
      preheader: z.string().optional(),
      bodyHtml: z.string(),
      bodyText: z.string().optional(),
      includeCustomerName: z.boolean().default(true),
      includeCartValue: z.boolean().default(true),
      includeCartItems: z.boolean().default(false),
      includeCountdown: z.boolean().default(false),
      countdownHours: z.number().default(24),
      ctaText: z.string().default("Complete Your Order"),
      ctaButtonColor: z.string().default("#3b82f6"),
    }))
    .mutation(async ({ input, ctx }) => {
      return await createEmailTemplate({
        ...input,
        createdBy: ctx.user!.id,
      });
    }),
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      templateName: z.string().optional(),
      subject: z.string().optional(),
      preheader: z.string().optional(),
      bodyHtml: z.string().optional(),
      bodyText: z.string().optional(),
      includeCustomerName: z.boolean().optional(),
      includeCartValue: z.boolean().optional(),
      includeCartItems: z.boolean().optional(),
      includeCountdown: z.boolean().optional(),
      countdownHours: z.number().optional(),
      ctaText: z.string().optional(),
      ctaButtonColor: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await updateEmailTemplate(id, data);
    }),
  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    return await deleteEmailTemplate(input.id);
  }),
  setDefault: adminProcedure
    .input(z.object({ id: z.number(), templateType: z.string() }))
    .mutation(async ({ input }) => {
      return await setDefaultEmailTemplate(input.id, input.templateType);
    }),
  duplicate: adminProcedure
    .input(z.object({ id: z.number(), newName: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await duplicateEmailTemplate(input.id, input.newName, ctx.user!.id);
    }),
  sendTest: adminProcedure
    .input(z.object({ templateId: z.number(), testEmail: z.string().email() }))
    .mutation(async ({ input }) => {
      const template = await getEmailTemplateById(input.templateId);
      if (!template) {
        throw new Error("Template not found");
      }

      const sampleData = {
        customerName: "John Smith",
        city: "Los Angeles",
        state: "CA",
        creditChallenges: "Eviction, Low Credit Score",
        rentalBudget: "$1,500",
        moveInDate: "March 15, 2026",
        renterId: "SCH-2026-001",
        caseManager: "George Williams",
        propertyAddress: "123 Main St, Los Angeles, CA",
        checkoutLink: "https://secondchancehousinglocator.com/checkout",
      };

      let subject = template.subject;
      let bodyHtml = template.bodyHtml;
      let bodyText = template.bodyText || "";

      Object.entries(sampleData).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        subject = subject.replace(regex, value);
        bodyHtml = bodyHtml.replace(regex, value);
        bodyText = bodyText.replace(regex, value);
      });

      await transporter.sendMail({
        from: process.env.GMAIL_EMAIL,
        to: input.testEmail,
        subject,
        html: bodyHtml,
        text: bodyText,
      });

      return { success: true, message: `Test email sent to ${input.testEmail}` };
    }),
});
