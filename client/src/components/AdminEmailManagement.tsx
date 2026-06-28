/**
 * AdminEmailManagement
 * Comprehensive admin panel for viewing and editing all email workflows,
 * templates, logs, and delivery statistics.
 *
 * Sub-tabs:
 *   1. Templates  — list + inline HTML editor + live preview + send-test
 *   2. Workflows  — visual step-by-step timeline for each email sequence
 *   3. Logs       — unified log (customers + leads + partners) with filters
 *   4. Stats      — delivery / open / click / bounce rates per template type
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Mail, Eye, Code2, Send, ChevronRight, CheckCircle2, Clock,
  Users, UserCheck, Building2, Search, RefreshCw, BarChart3,
  AlertCircle, ArrowRight, Pencil, X, Save,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const AUDIENCE_COLORS: Record<string, string> = {
  lead: "bg-blue-100 text-blue-800 border-blue-200",
  customer: "bg-green-100 text-green-800 border-green-200",
  partner: "bg-purple-100 text-purple-800 border-purple-200",
};

const STATUS_COLORS: Record<string, string> = {
  sent: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  bounced: "bg-orange-100 text-orange-800",
  opened: "bg-blue-100 text-blue-800",
  clicked: "bg-purple-100 text-purple-800",
};

const AUDIENCE_ICONS: Record<string, React.ReactNode> = {
  lead: <Users className="h-4 w-4" />,
  customer: <UserCheck className="h-4 w-4" />,
  partner: <Building2 className="h-4 w-4" />,
};

function humanize(str: string) {
  return str.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

// ─── Template Editor ─────────────────────────────────────────────────────────
function TemplateEditor({ template, onClose }: { template: any; onClose: () => void }) {
  const utils = trpc.useUtils();
  const [subject, setSubject] = useState(template.subject);
  const [bodyHtml, setBodyHtml] = useState(template.bodyHtml);
  const [description, setDescription] = useState(template.description ?? "");
  const [previewMode, setPreviewMode] = useState<"html" | "preview">("html");
  const [testEmail, setTestEmail] = useState("");

  const updateMutation = trpc.adminEmailManagement.updateTemplate.useMutation({
    onSuccess: () => {
      toast.success("Template saved successfully");
      utils.adminEmailManagement.getAllTemplates.invalidate();
      onClose();
    },
    onError: (e) => toast.error(`Save failed: ${e.message}`),
  });

  const sendTestMutation = trpc.adminEmailManagement.sendTestEmail.useMutation({
    onSuccess: (r) => toast.success(r.message),
    onError: (e) => toast.error(`Test failed: ${e.message}`),
  });

  const handleSave = () => {
    updateMutation.mutate({ id: template.id, subject, bodyHtml, description });
  };

  const handleSendTest = () => {
    if (!testEmail) { toast.error("Enter a test email address"); return; }
    // Save first, then send test with current bodyHtml
    updateMutation.mutate(
      { id: template.id, subject, bodyHtml, description },
      {
        onSuccess: () => {
          sendTestMutation.mutate({ templateId: template.id, toEmail: testEmail });
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
      {/* Header info */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge className={AUDIENCE_COLORS[template.audience] ?? ""} variant="outline">
          {AUDIENCE_ICONS[template.audience]} <span className="ml-1 capitalize">{template.audience}</span>
        </Badge>
        <Badge variant="secondary" className="font-mono text-xs">{template.templateType}</Badge>
      </div>

      {/* Description */}
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-1 block">Description (internal note)</label>
        <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="What triggers this email?" />
      </div>

      {/* Subject */}
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-1 block">Subject Line</label>
        <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject…" />
      </div>

      {/* Body editor / preview toggle */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-muted-foreground">Email Body (HTML)</label>
          <div className="flex gap-1">
            <Button size="sm" variant={previewMode === "html" ? "default" : "ghost"} onClick={() => setPreviewMode("html")}>
              <Code2 className="h-3 w-3 mr-1" /> HTML
            </Button>
            <Button size="sm" variant={previewMode === "preview" ? "default" : "ghost"} onClick={() => setPreviewMode("preview")}>
              <Eye className="h-3 w-3 mr-1" /> Preview
            </Button>
          </div>
        </div>
        {previewMode === "html" ? (
          <Textarea
            value={bodyHtml}
            onChange={e => setBodyHtml(e.target.value)}
            className="font-mono text-xs min-h-[320px] resize-y"
            placeholder="Paste HTML here. Use {{variable}} for dynamic values."
          />
        ) : (
          <div className="border rounded-md overflow-hidden" style={{ minHeight: 320 }}>
            <iframe
              srcDoc={bodyHtml}
              className="w-full"
              style={{ minHeight: 320, border: "none" }}
              title="Email Preview"
              sandbox="allow-same-origin"
            />
          </div>
        )}
      </div>

      {/* Variable reference */}
      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer font-medium hover:text-foreground">Available template variables</summary>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {[
            "{{customerName}}", "{{partnerName}}", "{{businessName}}", "{{city}}", "{{state}}",
            "{{housingType}}", "{{bedrooms}}", "{{monthlyIncome}}", "{{verificationCode}}",
            "{{verificationLink}}", "{{resetLink}}", "{{checkoutLink}}", "{{dashboardLink}}",
            "{{upgradeLink}}", "{{packageName}}", "{{leadsRemaining}}", "{{lockedLeadsCount}}",
            "{{leadNumber}}", "{{customerPhone}}", "{{customerEmail}}",
          ].map(v => (
            <code key={v} className="bg-muted px-1 py-0.5 rounded text-xs">{v}</code>
          ))}
        </div>
      </details>

      {/* Send test */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium text-muted-foreground mb-1 block">Send Test Email</label>
          <Input
            type="email"
            value={testEmail}
            onChange={e => setTestEmail(e.target.value)}
            placeholder="test@example.com"
          />
        </div>
        <Button
          variant="outline"
          onClick={handleSendTest}
          disabled={sendTestMutation.isPending || updateMutation.isPending}
        >
          <Send className="h-4 w-4 mr-1" />
          {sendTestMutation.isPending ? "Sending…" : "Send Test"}
        </Button>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          <Save className="h-4 w-4 mr-1" />
          {updateMutation.isPending ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

// ─── Templates Tab ────────────────────────────────────────────────────────────
function TemplatesTab() {
  const { data: templates, isLoading } = trpc.adminEmailManagement.getAllTemplates.useQuery();
  const [audienceFilter, setAudienceFilter] = useState<"all" | "lead" | "customer" | "partner">("all");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (!templates) return [];
    return templates.filter(t => {
      const matchAudience = audienceFilter === "all" || t.audience === audienceFilter;
      const matchSearch = !search || t.templateType.includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase());
      return matchAudience && matchSearch;
    });
  }, [templates, audienceFilter, search]);

  const editingTemplate = editingId ? templates?.find(t => t.id === editingId) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading templates…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search templates…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={audienceFilter} onValueChange={v => setAudienceFilter(v as any)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Audiences</SelectItem>
            <SelectItem value="lead">Leads</SelectItem>
            <SelectItem value="customer">Customers</SelectItem>
            <SelectItem value="partner">Partners</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Template list */}
      <div className="grid gap-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Mail className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>No templates found.</p>
          </div>
        )}
        {filtered.map(t => (
          <Card key={t.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge className={`${AUDIENCE_COLORS[t.audience] ?? ""} text-xs`} variant="outline">
                      <span className="capitalize">{t.audience}</span>
                    </Badge>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{t.templateType}</code>
                    {!t.isActive && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                  </div>
                  <p className="font-medium text-sm truncate">{t.subject}</p>
                  {(t as any).description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{(t as any).description}</p>
                  )}
                </div>
                <Dialog open={editingId === t.id} onOpenChange={open => setEditingId(open ? t.id : null)}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Pencil className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Edit Template — {humanize(t.templateType)}</DialogTitle>
                    </DialogHeader>
                    {editingId === t.id && editingTemplate && (
                      <TemplateEditor template={editingTemplate} onClose={() => setEditingId(null)} />
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Workflows Tab ────────────────────────────────────────────────────────────
function WorkflowsTab() {
  const { data: workflows, isLoading } = trpc.adminEmailManagement.getWorkflows.useQuery();
  const [audienceFilter, setAudienceFilter] = useState<"all" | "lead" | "customer" | "partner">("all");

  const filtered = useMemo(() => {
    if (!workflows) return [];
    return workflows.filter(w => audienceFilter === "all" || w.audience === audienceFilter);
  }, [workflows, audienceFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading workflows…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Select value={audienceFilter} onValueChange={v => setAudienceFilter(v as any)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Audiences</SelectItem>
            <SelectItem value="lead">Leads</SelectItem>
            <SelectItem value="customer">Customers</SelectItem>
            <SelectItem value="partner">Partners</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6">
        {filtered.map(workflow => (
          <Card key={workflow.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Badge className={`${AUDIENCE_COLORS[workflow.audience] ?? ""} text-xs`} variant="outline">
                  {AUDIENCE_ICONS[workflow.audience]}
                  <span className="ml-1 capitalize">{workflow.audience}</span>
                </Badge>
                <CardTitle className="text-base">{workflow.name}</CardTitle>
              </div>
              <CardDescription>{workflow.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Timeline */}
              <div className="relative">
                {workflow.steps.map((step, idx) => (
                  <div key={step.templateType} className="flex gap-4 mb-4 last:mb-0">
                    {/* Step number + connector */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                        {step.order}
                      </div>
                      {idx < workflow.steps.length - 1 && (
                        <div className="w-0.5 flex-1 bg-border mt-1 min-h-4" />
                      )}
                    </div>
                    {/* Step content */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{step.label}</span>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{step.templateType}</code>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>{step.timing}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Logs Tab ─────────────────────────────────────────────────────────────────
function LogsTab() {
  const [audience, setAudience] = useState<"all" | "customer" | "lead" | "partner">("all");
  const [status, setStatus] = useState<"all" | "sent" | "failed" | "bounced" | "opened" | "clicked">("all");
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const LIMIT = 50;

  const { data, isLoading, refetch } = trpc.adminEmailManagement.getEmailLogs.useQuery({
    audience, status, search: search || undefined, limit: LIMIT, offset,
  });

  const logs = data?.logs ?? [];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by email, name, or subject…" value={search} onChange={e => { setSearch(e.target.value); setOffset(0); }} />
        </div>
        <Select value={audience} onValueChange={v => { setAudience(v as any); setOffset(0); }}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Audiences</SelectItem>
            <SelectItem value="lead">Leads</SelectItem>
            <SelectItem value="customer">Customers</SelectItem>
            <SelectItem value="partner">Partners</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={v => { setStatus(v as any); setOffset(0); }}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="bounced">Bounced</SelectItem>
            <SelectItem value="opened">Opened</SelectItem>
            <SelectItem value="clicked">Clicked</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={() => refetch()} title="Refresh">
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Audience</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin inline mr-2" /> Loading…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No email logs found.
                </TableCell>
              </TableRow>
            )}
            {logs.map(log => (
              <TableRow key={log.id}>
                <TableCell>
                  <Badge className={`${AUDIENCE_COLORS[log.audience] ?? ""} text-xs`} variant="outline">
                    <span className="capitalize">{log.audience}</span>
                  </Badge>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{log.emailType}</code>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium">{log.recipientName || "—"}</div>
                  <div className="text-xs text-muted-foreground">{log.recipientEmail}</div>
                </TableCell>
                <TableCell className="max-w-xs">
                  <p className="text-sm truncate" title={log.subject}>{log.subject}</p>
                </TableCell>
                <TableCell>
                  <Badge className={`${STATUS_COLORS[log.status] ?? ""} text-xs`}>
                    {log.status}
                  </Badge>
                  {log.failureReason && (
                    <p className="text-xs text-red-600 mt-0.5 max-w-32 truncate" title={log.failureReason}>{log.failureReason}</p>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(log.sentAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing {offset + 1}–{Math.min(offset + LIMIT, offset + logs.length)} of {data?.total ?? "?"}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - LIMIT))}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={logs.length < LIMIT} onClick={() => setOffset(offset + LIMIT)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Stats Tab ────────────────────────────────────────────────────────────────
function StatsTab() {
  const { data: stats, isLoading } = trpc.adminEmailManagement.getEmailStats.useQuery();
  const [audienceFilter, setAudienceFilter] = useState<"all" | "customer" | "lead" | "partner">("all");

  const filtered = useMemo(() => {
    if (!stats) return [];
    return stats
      .filter(s => audienceFilter === "all" || s.audience === audienceFilter)
      .sort((a, b) => b.total - a.total);
  }, [stats, audienceFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading stats…
      </div>
    );
  }

  const totals = filtered.reduce(
    (acc, s) => ({ sent: acc.sent + s.sent, failed: acc.failed + s.failed, bounced: acc.bounced + s.bounced, total: acc.total + s.total }),
    { sent: 0, failed: 0, bounced: 0, total: 0 }
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Select value={audienceFilter} onValueChange={v => setAudienceFilter(v as any)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Audiences</SelectItem>
            <SelectItem value="lead">Leads</SelectItem>
            <SelectItem value="customer">Customers</SelectItem>
            <SelectItem value="partner">Partners</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Sent", value: totals.total, color: "text-foreground" },
          { label: "Delivered", value: totals.sent, color: "text-green-600" },
          { label: "Failed", value: totals.failed, color: "text-red-600" },
          { label: "Bounced", value: totals.bounced, color: "text-orange-600" },
        ].map(card => (
          <Card key={card.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Per-type breakdown */}
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email Type</TableHead>
              <TableHead>Audience</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Sent</TableHead>
              <TableHead className="text-right">Failed</TableHead>
              <TableHead className="text-right">Bounced</TableHead>
              <TableHead className="text-right">Delivery Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No data yet. Emails will appear here once they are sent.
                </TableCell>
              </TableRow>
            )}
            {filtered.map(s => (
              <TableRow key={s.emailType}>
                <TableCell>
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{s.emailType}</code>
                </TableCell>
                <TableCell>
                  <Badge className={`${AUDIENCE_COLORS[s.audience] ?? ""} text-xs`} variant="outline">
                    <span className="capitalize">{s.audience}</span>
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">{s.total}</TableCell>
                <TableCell className="text-right text-green-600">{s.sent}</TableCell>
                <TableCell className="text-right text-red-600">{s.failed}</TableCell>
                <TableCell className="text-right text-orange-600">{s.bounced}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 bg-muted rounded-full h-1.5">
                      <div
                        className="bg-green-500 h-1.5 rounded-full"
                        style={{ width: `${s.deliveryRate}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-10">{s.deliveryRate}%</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AdminEmailManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Mail className="h-5 w-5" /> Email Management
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          View and edit all email workflows, templates, logs, and delivery statistics for leads, customers, and partners.
        </p>
      </div>

      <Tabs defaultValue="templates">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="templates">
            <Pencil className="h-4 w-4 mr-1.5" /> Templates
          </TabsTrigger>
          <TabsTrigger value="workflows">
            <ArrowRight className="h-4 w-4 mr-1.5" /> Workflows
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Mail className="h-4 w-4 mr-1.5" /> Send Log
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart3 className="h-4 w-4 mr-1.5" /> Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-4">
          <TemplatesTab />
        </TabsContent>

        <TabsContent value="workflows" className="mt-4">
          <WorkflowsTab />
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <LogsTab />
        </TabsContent>

        <TabsContent value="stats" className="mt-4">
          <StatsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
