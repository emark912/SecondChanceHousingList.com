import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Download } from "lucide-react";

interface EmailTemplatePreviewProps {
  template: {
    id: number;
    templateName: string;
    subject: string;
    preheader?: string;
    bodyHtml: string;
    ctaText: string;
    ctaButtonColor: string;
  };
  customerName?: string;
  cartValue?: number;
  cartItems?: string[];
}

export function EmailTemplatePreview({
  template,
  customerName = "John Doe",
  cartValue = 59.99,
  cartItems = ["Custom Rental List"],
}: EmailTemplatePreviewProps) {
  const handleDownloadHTML = () => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .email-container { max-width: 600px; margin: 0 auto; }
    .header { background: #f3f4f6; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .cta-button { 
      background-color: ${template.ctaButtonColor}; 
      color: white; 
      padding: 12px 24px; 
      text-decoration: none; 
      border-radius: 6px; 
      display: inline-block;
      margin: 20px 0;
    }
    .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>${template.subject}</h1>
      <p>${template.preheader || ""}</p>
    </div>
    <div class="content">
      ${template.bodyHtml}
      <a href="#" class="cta-button">${template.ctaText}</a>
    </div>
    <div class="footer">
      <p>© 2026 Second Chance Housing Locator. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.templateName}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Email Preview</h2>
        <Button variant="outline" size="sm" onClick={handleDownloadHTML} className="gap-2">
          <Download className="h-4 w-4" />
          Download HTML
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {template.templateName}
          </CardTitle>
          <CardDescription>
            <div className="space-y-1">
              <p><strong>Subject:</strong> {template.subject}</p>
              {template.preheader && <p><strong>Preheader:</strong> {template.preheader}</p>}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white border rounded-lg overflow-hidden">
            {/* Email Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 text-center border-b">
              <h1 className="text-2xl font-bold text-gray-900">{template.subject}</h1>
              {template.preheader && <p className="text-gray-600 text-sm mt-2">{template.preheader}</p>}
            </div>

            {/* Email Body */}
            <div className="p-6">
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: template.bodyHtml }}
              />

              {/* CTA Button */}
              <div className="mt-6 text-center">
                <button
                  style={{ backgroundColor: template.ctaButtonColor }}
                  className="text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
                >
                  {template.ctaText}
                </button>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t text-center text-xs text-gray-500">
                <p>© 2026 Second Chance Housing Locator. All rights reserved.</p>
              </div>
            </div>
          </div>

          {/* Preview Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm">
            <p className="text-blue-900">
              <strong>Preview Info:</strong> This preview shows how the email will appear to customers.
              Personalization variables like {"{customerName}"} and {"{city}"} will be replaced with actual data.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
