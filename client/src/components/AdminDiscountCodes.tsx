import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Tag, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export function AdminDiscountCodes() {
  const utils = trpc.useUtils();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    maxUses: "",
    validFrom: new Date().toISOString().split("T")[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });

  const { data: codes, isLoading, error } = trpc.adminInsights.getAllDiscountCodes.useQuery();

  const createMutation = trpc.adminInsights.createDiscountCode.useMutation({
    onSuccess: () => {
      toast.success(`Code "${form.code.toUpperCase()}" is now active.`);
      utils.adminInsights.getAllDiscountCodes.invalidate();
      setShowCreate(false);
      setForm({ code: "", description: "", discountType: "percentage", discountValue: "", maxUses: "", validFrom: new Date().toISOString().split("T")[0], validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] });
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleMutation = trpc.adminInsights.updateDiscountCodeStatus.useMutation({
    onSuccess: () => utils.adminInsights.getAllDiscountCodes.invalidate(),
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.adminInsights.deleteDiscountCode.useMutation({
    onSuccess: () => {
      toast.success("Discount code deleted");
      utils.adminInsights.getAllDiscountCodes.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleCreate = () => {
    if (!form.code || !form.discountValue) {
      toast.error("Code and discount value are required.");
      return;
    }
    createMutation.mutate({
      code: form.code,
      description: form.description || undefined,
      discountType: form.discountType,
      discountValue: parseFloat(form.discountValue),
      maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
      validFrom: new Date(form.validFrom).toISOString(),
      validUntil: new Date(form.validUntil).toISOString(),
    });
  };

  if (isLoading) {
    return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-500 p-4">
        <AlertCircle className="h-5 w-5" />
        <span>Failed to load discount codes.</span>
      </div>
    );
  }

  const now = new Date();
  const activeCount = codes?.filter(c => c.isActive === 1 && new Date(c.validUntil) > now).length || 0;
  const totalUsed = codes?.reduce((s, c) => s + (c.usedCount || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{codes?.length || 0}</p>
          <p className="text-sm text-muted-foreground">Total Codes</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          <p className="text-sm text-muted-foreground">Active</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{totalUsed}</p>
          <p className="text-sm text-muted-foreground">Total Uses</p>
        </CardContent></Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2"><Tag className="h-4 w-4" /> All Discount Codes</h3>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1" /> Create Code
        </Button>
      </div>

      {/* Table */}
      {!codes || codes.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">
          <Tag className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p>No discount codes yet. Create your first one.</p>
        </CardContent></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Uses</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes.map((code) => {
                const isExpired = new Date(code.validUntil) < now;
                const isActive = code.isActive === 1 && !isExpired;
                return (
                  <TableRow key={code.id}>
                    <TableCell>
                      <div>
                        <span className="font-mono font-semibold text-sm">{code.code}</span>
                        {code.description && <p className="text-xs text-muted-foreground">{code.description}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {code.discountType === "percentage"
                          ? `${parseFloat(String(code.discountValue))}% off`
                          : `$${parseFloat(String(code.discountValue)).toFixed(2)} off`}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{code.usedCount || 0}</span>
                      {code.maxUses && <span className="text-xs text-muted-foreground"> / {code.maxUses}</span>}
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm ${isExpired ? "text-red-500" : "text-muted-foreground"}`}>
                        {new Date(code.validUntil).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {isExpired ? (
                        <Badge variant="secondary">Expired</Badge>
                      ) : isActive ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!isExpired && (
                          <Switch
                            checked={code.isActive === 1}
                            onCheckedChange={(v) => toggleMutation.mutate({ id: code.id, isActive: v })}
                          />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            if (confirm(`Delete code "${code.code}"?`)) {
                              deleteMutation.mutate({ id: code.id });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Discount Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Code *</Label>
              <Input
                placeholder="e.g. SAVE20"
                value={form.code}
                onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                placeholder="Optional description"
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Discount Type *</Label>
                <Select value={form.discountType} onValueChange={(v: "percentage" | "fixed") => setForm(f => ({ ...f, discountType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Value *</Label>
                <Input
                  type="number"
                  placeholder={form.discountType === "percentage" ? "e.g. 20" : "e.g. 10.00"}
                  value={form.discountValue}
                  onChange={(e) => setForm(f => ({ ...f, discountValue: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Max Uses (leave blank for unlimited)</Label>
              <Input
                type="number"
                placeholder="e.g. 100"
                value={form.maxUses}
                onChange={(e) => setForm(f => ({ ...f, maxUses: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Valid From *</Label>
                <Input type="date" value={form.validFrom} onChange={(e) => setForm(f => ({ ...f, validFrom: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Valid Until *</Label>
                <Input type="date" value={form.validUntil} onChange={(e) => setForm(f => ({ ...f, validUntil: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Code"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
