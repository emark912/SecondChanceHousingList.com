import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle2, Clock, DollarSign, Eye, RotateCw, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function AdminPaymentDashboard() {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [retryingPaymentId, setRetryingPaymentId] = useState<number | null>(null);

  // Fetch data
  const { data: stats } = trpc.payment.getDashboardStats.useQuery();
  const { data: paymentPlans } = trpc.payment.getPaymentPlans.useQuery({});
  const { data: failedPayments } = trpc.payment.getFailedPayments.useQuery();
  const { data: planDetails } = trpc.payment.getPaymentPlanDetails.useQuery(
    { planId: selectedPlan! },
    { enabled: !!selectedPlan }
  );

  // Mutations
  const retryMutation = trpc.payment.retryFailedPayment.useMutation();
  const cancelMutation = trpc.payment.cancelPaymentPlan.useMutation();

  const handleRetryPayment = async (paymentId: number) => {
    setRetryingPaymentId(paymentId);
    try {
      await retryMutation.mutateAsync({ paymentId });
      // Refetch failed payments
    } catch (error) {
      console.error('Failed to retry payment:', error);
    } finally {
      setRetryingPaymentId(null);
    }
  };

  const handleCancelPlan = async () => {
    if (!selectedPlan) return;
    try {
      await cancelMutation.mutateAsync({ planId: selectedPlan, reason: cancelReason });
      setShowCancelDialog(false);
      setCancelReason('');
      setSelectedPlan(null);
    } catch (error) {
      console.error('Failed to cancel plan:', error);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Donation & Case Manager Management</h1>
        <p className="text-muted-foreground mt-2">View and manage donations and case manager add-on payments</p>
      </div>

      {/* Dashboard Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPlans}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.activePlans} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(stats.totalCollected / 100).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">From {stats.completedPlans} completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Scheduled Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(stats.totalScheduled / 100).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Pending collection</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failedPayments}</div>
              <p className="text-xs text-muted-foreground mt-1">Require attention</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Pending Donations & Case Managers</TabsTrigger>
          <TabsTrigger value="failed">Failed Payments</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        {/* Active Plans Tab */}
        <TabsContent value="active" className="space-y-4">
          <div className="space-y-2">
            {paymentPlans?.filter(p => p.status === 'active').map((plan) => (
              <Card key={plan.id} className="cursor-pointer hover:bg-accent" onClick={() => setSelectedPlan(plan.id)}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{plan.customerName}</h3>
                      <p className="text-sm text-muted-foreground">{plan.customerEmail}</p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span>Donation: ${(plan.downPaymentAmount / 100).toFixed(2)}</span>
                        <span>Total: ${(plan.totalAmount / 100).toFixed(2)}</span>
                        <span>Status: {plan.status}</span>
                        <Badge variant="outline">{plan.paymentFrequency}</Badge>
                      </div>
                    </div>
                    <Eye className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Failed Payments Tab */}
        <TabsContent value="failed" className="space-y-4">
          <div className="space-y-2">
            {failedPayments?.map((payment) => (
              <Card key={payment.id} className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <h3 className="font-semibold">{payment.customerEmail}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Amount: ${(payment.paymentAmount / 100).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Scheduled: {payment.scheduledDate ? new Date(payment.scheduledDate).toLocaleDateString() : 'N/A'}
                      </p>
                      {payment.failureReason && (
                        <p className="text-sm text-red-600 mt-1">Reason: {payment.failureReason}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Retries: {payment.retryCount}/{payment.maxRetries}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRetryPayment(payment.id)}
                      disabled={retryingPaymentId === payment.id || payment.retryCount >= payment.maxRetries}
                    >
                      <RotateCw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Completed Tab */}
        <TabsContent value="completed" className="space-y-4">
          <div className="space-y-2">
            {paymentPlans?.filter(p => p.status === 'completed').map((plan) => (
              <Card key={plan.id} className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <h3 className="font-semibold">{plan.customerName}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{plan.customerEmail}</p>
                      <p className="text-sm mt-2">Total Paid: ${(plan.totalAmount / 100).toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Plan Details Panel */}
      {selectedPlan && planDetails && (
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{planDetails.plan?.customerName}</CardTitle>
                <CardDescription>{planDetails.plan?.customerEmail}</CardDescription>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowCancelDialog(true)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel Plan
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Payment Schedule */}
            <div>
              <h4 className="font-semibold mb-2">Payment Schedule</h4>
              <div className="space-y-2">
                {planDetails.payments?.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div>
                      <p className="text-sm font-medium">${(payment.paymentAmount / 100).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {payment.scheduledDate ? new Date(payment.scheduledDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <Badge variant={
                      payment.status === 'completed' ? 'default' :
                      payment.status === 'failed' ? 'destructive' :
                      payment.status === 'processing' ? 'secondary' :
                      'outline'
                    }>
                      {payment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Processing Logs */}
            {planDetails.logs && planDetails.logs.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Processing History</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {planDetails.logs.map((log) => (
                    <div key={log.id} className="text-xs p-2 bg-muted rounded">
                      <div className="flex items-center gap-2">
                        {log.status === 'succeeded' ? (
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-red-600" />
                        )}
                        <span className="font-medium">{log.status}</span>
                      </div>
                      <p className="text-muted-foreground mt-1">
                        ${(log.paymentAmount / 100).toFixed(2)} - {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                      </p>
                      {log.errorMessage && (
                        <p className="text-red-600 mt-1">{log.errorMessage}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cancel Plan Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Payment Plan</DialogTitle>
            <DialogDescription>
              This action will cancel the payment plan and all pending payments. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reason for cancellation</label>
              <Textarea
                placeholder="Enter the reason for cancelling this plan..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                Keep Plan
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelPlan}
                disabled={!cancelReason.trim()}
              >
                Cancel Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
