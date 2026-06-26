import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Copy, Edit2, Trash2, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function EmailTemplateManager() {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [templateType, setTemplateType] = useState("abandoned_checkout_20min");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const templatesQuery = trpc.emailTemplates.getByType.useQuery({ templateType });
  const templates = templatesQuery.data || [];

  const selectedTemplateData = selectedTemplate ? templates.find(t => t.id === selectedTemplate) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email Template Manager</h1>
        <p className="text-gray-600 mt-2">Customize abandoned cart email templates and recovery messaging</p>
      </div>

      <Tabs defaultValue="abandoned_checkout_20min" onValueChange={setTemplateType} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="abandoned_checkout_20min">20-Minute Reminder</TabsTrigger>
          <TabsTrigger value="abandoned_checkout_3day">3-Day Reminder</TabsTrigger>
        </TabsList>

        <TabsContent value="abandoned_checkout_20min" className="space-y-4">
          <TemplateList
            templates={templates}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={setSelectedTemplate}
            templateType={templateType}
            onCreateNew={() => setIsCreateDialogOpen(true)}
          />
        </TabsContent>

        <TabsContent value="abandoned_checkout_3day" className="space-y-4">
          <TemplateList
            templates={templates}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={setSelectedTemplate}
            templateType={templateType}
            onCreateNew={() => setIsCreateDialogOpen(true)}
          />
        </TabsContent>
      </Tabs>

      {selectedTemplateData && (
        <TemplateEditor
          template={selectedTemplateData}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}

      <CreateTemplateDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        templateType={templateType}
      />
    </div>
  );
}

function TemplateList({
  templates,
  selectedTemplate,
  onSelectTemplate,
  templateType,
  onCreateNew,
}: {
  templates: any[];
  selectedTemplate: number | null;
  onSelectTemplate: (id: number) => void;
  templateType: string;
  onCreateNew: () => void;
}) {
  const deleteTemplateMutation = trpc.emailTemplates.delete.useMutation();
  const duplicateTemplateMutation = trpc.emailTemplates.duplicate.useMutation();
  const setDefaultMutation = trpc.emailTemplates.setDefault.useMutation();

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this template?")) {
      await deleteTemplateMutation.mutateAsync({ id });
    }
  };

  const handleDuplicate = async (id: number, name: string) => {
    const newName = prompt("Enter name for duplicated template:", `${name} (Copy)`);
    if (newName) {
      await duplicateTemplateMutation.mutateAsync({ id, newName });
    }
  };

  const handleSetDefault = async (id: number) => {
    await setDefaultMutation.mutateAsync({ id, templateType });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Templates</h2>
        <Button onClick={onCreateNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Template
        </Button>
      </div>

      <div className="grid gap-3">
        {templates.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-500 text-center">No templates found for this type</p>
            </CardContent>
          </Card>
        ) : (
          templates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all ${
                selectedTemplate === template.id ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => onSelectTemplate(template.id)}
            >
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{template.templateName}</h3>
                      {template.isDefault && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Default</span>
                      )}
                      {!template.isActive && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Inactive</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate(template.id, template.templateName);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(template.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {!template.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetDefault(template.id);
                    }}
                  >
                    Set as Default
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function TemplateEditor({
  template,
  isOpen,
  onOpenChange,
}: {
  template: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [formData, setFormData] = useState(template);
  const updateMutation = trpc.emailTemplates.update.useMutation();

  const handleSave = async () => {
    await updateMutation.mutateAsync({
      id: template.id,
      ...formData,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Template: {template.templateName}</DialogTitle>
          <DialogDescription>Customize email content and settings</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Template Name</label>
            <Input
              value={formData.templateName}
              onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subject Line</label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g., {customerName}, Your list Second Chance Rentals in {city} Order"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Preheader Text</label>
            <Input
              value={formData.preheader || ""}
              onChange={(e) => setFormData({ ...formData, preheader: e.target.value })}
              placeholder="Preview text shown in email clients"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email Body (HTML)</label>
            <textarea
              value={formData.bodyHtml}
              onChange={(e) => setFormData({ ...formData, bodyHtml: e.target.value })}
              className="w-full h-64 p-3 border rounded-lg font-mono text-sm"
              placeholder="HTML email content"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">CTA Button Text</label>
              <Input
                value={formData.ctaText}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">CTA Button Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.ctaButtonColor}
                  onChange={(e) => setFormData({ ...formData, ctaButtonColor: e.target.value })}
                  className="h-10 w-20 border rounded"
                />
                <Input
                  value={formData.ctaButtonColor}
                  onChange={(e) => setFormData({ ...formData, ctaButtonColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Personalization Options
            </h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.includeCustomerName}
                onChange={(e) => setFormData({ ...formData, includeCustomerName: e.target.checked })}
              />
              Include customer name
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.includeCartValue}
                onChange={(e) => setFormData({ ...formData, includeCartValue: e.target.checked })}
              />
              Include cart value
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.includeCartItems}
                onChange={(e) => setFormData({ ...formData, includeCartItems: e.target.checked })}
              />
              Include cart items
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.includeCountdown}
                onChange={(e) => setFormData({ ...formData, includeCountdown: e.target.checked })}
              />
              Include countdown timer
              {formData.includeCountdown && (
                <Input
                  type="number"
                  value={formData.countdownHours}
                  onChange={(e) => setFormData({ ...formData, countdownHours: parseInt(e.target.value) })}
                  className="w-20 ml-2"
                  min="1"
                  max="72"
                />
              )}
            </label>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CreateTemplateDialog({
  isOpen,
  onOpenChange,
  templateType,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  templateType: string;
}) {
  const [formData, setFormData] = useState({
    templateName: "",
    subject: "",
    bodyHtml: "",
  });

  const createMutation = trpc.emailTemplates.create.useMutation();

  const handleCreate = async () => {
    await createMutation.mutateAsync({
      templateType: templateType as any,
      ...formData,
    });
    onOpenChange(false);
    setFormData({ templateName: "", subject: "", bodyHtml: "" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Template</DialogTitle>
          <DialogDescription>Create a new email template from scratch</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Template Name</label>
            <Input
              value={formData.templateName}
              onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
              placeholder="e.g., Standard Reminder"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subject Line</label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Email subject line"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email Body (HTML)</label>
            <textarea
              value={formData.bodyHtml}
              onChange={(e) => setFormData({ ...formData, bodyHtml: e.target.value })}
              className="w-full h-40 p-3 border rounded-lg font-mono text-sm"
              placeholder="HTML email content"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Template"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
