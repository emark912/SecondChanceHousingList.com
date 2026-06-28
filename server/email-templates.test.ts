import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createEmailTemplate,
  getEmailTemplateById,
  getEmailTemplatesByType,
  getDefaultEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  setDefaultEmailTemplate,
} from "./db";

describe("Email Template Management", () => {
  let templateId: number;
  const testTemplate = {
    templateType: "abandoned_checkout_20min" as const,
    templateName: "Test Template",
    subject: "Hi {customerName}, Your {city} Rental List is Ready",
    preheader: "Complete your order now",
    bodyHtml: "<p>Hello {customerName}, your rental list in {city} is ready!</p>",
    bodyText: "Hello {customerName}, your rental list in {city} is ready!",
    includeCustomerName: true,
    includeCartValue: true,
    includeCartItems: false,
    includeCountdown: false,
    countdownHours: 24,
    ctaText: "Complete Your Order",
    ctaButtonColor: "#3b82f6",
    createdBy: 1,
  };

  beforeAll(async () => {
    // Create a test template
    templateId = await createEmailTemplate(testTemplate);
    expect(templateId).toBeGreaterThan(0);
  });

  afterAll(async () => {
    // Clean up - delete the test template
    if (templateId) {
      await deleteEmailTemplate(templateId);
    }
  });

  it("should create an email template", async () => {
    expect(templateId).toBeGreaterThan(0);
  });

  it("should retrieve template by ID", async () => {
    const template = await getEmailTemplateById(templateId);
    expect(template).toBeDefined();
    expect(template?.templateName).toBe("Test Template");
    expect(template?.subject).toContain("{customerName}");
  });

  it("should retrieve templates by type", async () => {
    const templates = await getEmailTemplatesByType("abandoned_checkout_20min");
    expect(Array.isArray(templates)).toBe(true);
    expect(templates.length).toBeGreaterThan(0);
    expect(templates.some((t) => t.id === templateId)).toBe(true);
  });

  it("should update email template", async () => {
    const updatedName = "Updated Test Template";
    await updateEmailTemplate(templateId, { templateName: updatedName });

    const template = await getEmailTemplateById(templateId);
    expect(template?.templateName).toBe(updatedName);
  });

  it("should set template as default", async () => {
    await setDefaultEmailTemplate(templateId, "abandoned_checkout_20min");

    const template = await getEmailTemplateById(templateId);
    expect(template?.isDefault).toBe(true);
  });

  it("should get default template for type", async () => {
    const defaultTemplate = await getDefaultEmailTemplate("abandoned_checkout_20min");
    expect(defaultTemplate).toBeDefined();
    expect(defaultTemplate?.isDefault).toBe(true);
  });

  it("should support template variables", async () => {
    const template = await getEmailTemplateById(templateId);
    expect(template?.subject).toContain("{customerName}");
    expect(template?.subject).toContain("{city}");
    expect(template?.bodyHtml).toContain("{customerName}");
    expect(template?.bodyHtml).toContain("{city}");
  });

  it("should support personalization options", async () => {
    const template = await getEmailTemplateById(templateId);
    expect(template?.includeCustomerName).toBe(true);
    expect(template?.includeCartValue).toBe(true);
    expect(template?.ctaText).toBe("Complete Your Order");
    expect(template?.ctaButtonColor).toBe("#3b82f6");
  });

  it("should support multiple template types", async () => {
    const template20min = await getEmailTemplatesByType("abandoned_checkout_20min");
    const template3day = await getEmailTemplatesByType("abandoned_checkout_3day");

    expect(Array.isArray(template20min)).toBe(true);
    expect(Array.isArray(template3day)).toBe(true);
  });
});
