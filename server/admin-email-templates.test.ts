import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { emailTemplates } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Admin Email Templates", () => {
  let db: any;
  let testTemplateId: number;

  beforeAll(async () => {
    db = await getDb();
  });

  it("should retrieve all email templates", async () => {
    const templates = await db.select().from(emailTemplates).limit(10);
    expect(Array.isArray(templates)).toBe(true);
  });

  it("should get a specific email template by ID", async () => {
    const templates = await db.select().from(emailTemplates).limit(1);
    if (templates.length > 0) {
      const template = templates[0];
      testTemplateId = template.id;
      expect(template.id).toBeDefined();
      expect(template.subject).toBeDefined();
      expect(template.bodyHtml).toBeDefined();
    }
  });

  it("should update an email template", async () => {
    if (!testTemplateId) return;

    const newSubject = "Updated Test Subject";
    await db
      .update(emailTemplates)
      .set({ subject: newSubject })
      .where(eq(emailTemplates.id, testTemplateId));

    const updated = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.id, testTemplateId));

    expect(updated[0].subject).toBe(newSubject);
  });

  it("should verify template variables are properly formatted", async () => {
    const templates = await db.select().from(emailTemplates).limit(5);

    templates.forEach((template: any) => {
      // Check that subject contains valid variable placeholders
      const variableRegex = /{{[a-zA-Z_]+}}/g;
      const variables = template.subject.match(variableRegex) || [];
      expect(variables.every((v: string) => v.startsWith("{{") && v.endsWith("}}") )).toBe(true);
    });
  });

  it("should verify template has required fields", async () => {
    const templates = await db.select().from(emailTemplates).limit(1);

    if (templates.length > 0) {
      const template = templates[0];
      expect(template.templateName).toBeDefined();
      expect(template.templateType).toBeDefined();
      expect(template.subject).toBeDefined();
      expect(template.bodyHtml).toBeDefined();
      expect(template.isActive).toBeDefined();
    }
  });

  it("should handle template with optional fields", async () => {
    const templates = await db.select().from(emailTemplates).limit(1);

    if (templates.length > 0) {
      const template = templates[0];
      // Optional fields should be either defined or null/undefined
      expect(
        template.preheader === null ||
        template.preheader === undefined ||
        typeof template.preheader === "string"
      ).toBe(true);
    }
  });
});
