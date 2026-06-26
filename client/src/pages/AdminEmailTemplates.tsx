import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Eye, Code, Mail } from "lucide-react";


interface TemplateVariable {
  name: string;
  example: string;
  description: string;
}

const TEMPLATE_VARIABLES: Record<string, TemplateVariable[]> = {
  common: [
    { name: "{{customerName}}", example: "John", description: "Customer's first name" },
    { name: "{{city}}", example: "Los Angeles", description: "City where searching for rentals" },
    { name: "{{state}}", example: "CA", description: "State abbreviation" },
    { name: "{{checkoutLink}}", example: "https://...", description: "Link to checkout page" },
  ],
  lead: [
    { name: "{{creditChallenges}}", example: "Eviction, Low Credit Score", description: "Customer's credit issues" },
    { name: "{{rentalBudget}}", example: "$1,500", description: "Monthly rental budget" },
    { name: "{{moveInDate}}", example: "March 15, 2026", description: "Desired move-in date" },
  ],
  corporate: [
    { name: "{{renterId}}", example: "SCH-2026-001", description: "Unique renter ID" },
    { name: "{{caseManager}}", example: "George Williams", description: "Assigned case manager name" },
    { name: "{{propertyAddress}}", example: "123 Main St, LA, CA", description: "Selected rental property" },
  ],
};

export function AdminEmailTemplates() {
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    console.log(`[${type.toUpperCase()}] ${message}`);
  };
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [previewMode, setPreviewMode] = useState<"html" | "text">("html");
  const [testEmail, setTestEmail] = useState("");

  // Queries
  const { data: templates, isLoading, refetch } = trpc.emailTemplates.getAll.useQuery();
  const { data: currentTemplate } = trpc.emailTemplates.getById.useQuery(
    { id: selectedTemplate! },
    { enabled: !!selectedTemplate }
  );

  // Mutations
  const updateMutation = trpc.emailTemplates.update.useMutation({
    onSuccess: () => {
      showToast('Template updated successfully');
      refetch();
      setEditMode(false);
    },
    onError: (error) => {
      showToast(`Error updating template: ${error.message}`, 'error');
    },
  });

  const sendTestMutation = trpc.emailTemplates.sendTest.useMutation({
    onSuccess: () => {
      showToast('Test email sent successfully');
      setTestEmail("");
    },
    onError: (error: any) => {
      showToast(`Error sending test email: ${error.message}`, 'error');
    },
  });

  const [formData, setFormData] = useState({
    templateName: "",
    subject: "",
    preheader: "",
    bodyHtml: "",
    bodyText: "",
    ctaText: "",
    ctaButtonColor: "#0066cc",
    isActive: true,
  });

  // Load template data when selected
  useMemo(() => {
    if (currentTemplate) {
      setFormData({
        templateName: currentTemplate.templateName,
        subject: currentTemplate.subject,
        preheader: currentTemplate.preheader || "",
        bodyHtml: currentTemplate.bodyHtml,
        bodyText: currentTemplate.bodyText || "",
        ctaText: currentTemplate.ctaText || "",
        ctaButtonColor: currentTemplate.ctaButtonColor || "#0066cc",
        isActive: currentTemplate.isActive,
      });
    }
  }, [currentTemplate]);

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;
    await updateMutation.mutateAsync({
      id: selectedTemplate,
      ...formData,
    });
  };

  const handleSendTest = async () => {
    if (!selectedTemplate || !testEmail) return;
    await sendTestMutation.mutateAsync({
      templateId: selectedTemplate,
      testEmail,
    });
  };

  const previewVariables = {
    customerName: "John Smith",
    city: "Los Angeles",
    state: "CA",
    creditChallenges: "Eviction, Low Credit Score",
    rentalBudget: "$1,500",
    moveInDate: "March 15, 2026",
    renterId: "SCH-2026-001",
    caseManager: "George Williams",
    propertyAddress: "123 Main St, Los Angeles, CA",
    checkoutLink: "#",
  };

  const getPreviewContent = () => {
    let content = previewMode === "html" ? formData.bodyHtml : formData.bodyText;
    
    // Replace variables with examples
    Object.entries(previewVariables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, "g"), String(value));
    });

    return content;
  };

  if (isLoading) {
    return <div className="p-8">Loading email templates...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">Email Template Manager</h1>
        <p className="text-gray-600 mt-2">Create and edit email templates for your automated campaigns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Template List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Templates</CardTitle>
            <CardDescription>Select a template to edit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {templates?.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template.id);
                  setEditMode(false);
                }}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  selectedTemplate === template.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-medium text-sm">{template.templateName}</div>
                <div className="text-xs text-gray-500 mt-1">{template.templateType}</div>
                <div className="flex items-center gap-2 mt-2">
                  {template.isActive ? (
                    <Badge variant="default" className="text-xs">Active</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">Inactive</Badge>
                  )}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Template Editor */}
        {selectedTemplate && currentTemplate && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{currentTemplate.templateName}</CardTitle>
                  <CardDescription>{currentTemplate.templateType}</CardDescription>
                </div>
                <Button
                  onClick={() => setEditMode(!editMode)}
                  variant={editMode ? "default" : "outline"}
                >
                  {editMode ? "Done Editing" : "Edit Template"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="content" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="test">Test</TabsTrigger>
                  <TabsTrigger value="variables">Variables</TabsTrigger>
                </TabsList>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-4">
                  {!editMode ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Subject Line</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded text-sm">{formData.subject}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Preheader</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded text-sm">{formData.preheader}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">CTA Button Text</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded text-sm">{formData.ctaText}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Template Name</label>
                        <Input
                          value={formData.templateName}
                          onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                          placeholder="e.g., 15-Minute Lead Notification"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Subject Line</label>
                        <Input
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          placeholder="e.g., Congratulations {{customerName}}!"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Preheader (preview text)</label>
                        <Input
                          value={formData.preheader}
                          onChange={(e) => setFormData({ ...formData, preheader: e.target.value })}
                          placeholder="e.g., Your personalized matches are ready"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">CTA Button Text</label>
                        <Input
                          value={formData.ctaText}
                          onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                          placeholder="e.g., View Your Matches"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">CTA Button Color</label>
                        <div className="flex gap-2 items-center mt-1">
                          <input
                            type="color"
                            value={formData.ctaButtonColor}
                            onChange={(e) => setFormData({ ...formData, ctaButtonColor: e.target.value })}
                            className="w-12 h-10 rounded cursor-pointer"
                          />
                          <Input
                            value={formData.ctaButtonColor}
                            onChange={(e) => setFormData({ ...formData, ctaButtonColor: e.target.value })}
                            placeholder="#0066cc"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">HTML Body</label>
                        <Textarea
                          value={formData.bodyHtml}
                          onChange={(e) => setFormData({ ...formData, bodyHtml: e.target.value })}
                          placeholder="Enter HTML email content..."
                          rows={12}
                          className="font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Plain Text Body</label>
                        <Textarea
                          value={formData.bodyText}
                          onChange={(e) => setFormData({ ...formData, bodyText: e.target.value })}
                          placeholder="Enter plain text version..."
                          rows={8}
                          className="font-mono text-xs"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveTemplate} disabled={updateMutation.isPending}>
                          {updateMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button variant="outline" onClick={() => setEditMode(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Preview Tab */}
                <TabsContent value="preview" className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={previewMode === "html" ? "default" : "outline"}
                      onClick={() => setPreviewMode("html")}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      HTML Preview
                    </Button>
                    <Button
                      size="sm"
                      variant={previewMode === "text" ? "default" : "outline"}
                      onClick={() => setPreviewMode("text")}
                    >
                      <Code className="w-4 h-4 mr-2" />
                      Text Preview
                    </Button>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Preview shows sample data. Variables will be replaced with actual customer data when sent.
                    </AlertDescription>
                  </Alert>

                  <div className="border rounded-lg p-4 bg-gray-50 min-h-96 max-h-96 overflow-auto">
                    {previewMode === "html" ? (
                      <iframe
                        srcDoc={getPreviewContent()}
                        className="w-full h-full border-0"
                        title="Email Preview"
                      />
                    ) : (
                      <pre className="text-xs whitespace-pre-wrap font-mono">{getPreviewContent()}</pre>
                    )}
                  </div>
                </TabsContent>

                {/* Test Tab */}
                <TabsContent value="test" className="space-y-4">
                  <Alert>
                    <Mail className="h-4 w-4" />
                    <AlertDescription>
                      Send a test email to verify the template looks correct before activating it.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Test Email Address</label>
                      <Input
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="your@email.com"
                      />
                    </div>
                    <Button
                      onClick={handleSendTest}
                      disabled={!testEmail || sendTestMutation.isPending}
                    >
                      {sendTestMutation.isPending ? "Sending..." : "Send Test Email"}
                    </Button>
                    {sendTestMutation.isSuccess && (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          Test email sent successfully to {testEmail}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </TabsContent>

                {/* Variables Tab */}
                <TabsContent value="variables" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(TEMPLATE_VARIABLES).map(([category, vars]) => (
                      <Card key={category}>
                        <CardHeader>
                          <CardTitle className="text-sm capitalize">{category} Variables</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {vars.map((variable) => (
                            <div key={variable.name} className="p-2 bg-gray-50 rounded text-xs">
                              <div className="font-mono font-bold text-blue-600">{variable.name}</div>
                              <div className="text-gray-600 mt-1">{variable.description}</div>
                              <div className="text-gray-500 mt-1">Example: {variable.example}</div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
