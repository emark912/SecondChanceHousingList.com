import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Download, Mail, RefreshCw, Eye } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function PaymentAccountability() {
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // Fetch payments list
  const { data: paymentsData, isLoading: paymentsLoading, refetch: refetchPayments } = trpc.admin.paymentsList.useQuery();

  // Fetch payment details
  const { data: paymentDetails } = trpc.admin.paymentDetails.useQuery(
    { orderId: selectedOrderId! },
    { enabled: selectedOrderId !== null }
  );

  // Resend email mutation
  const resendEmailMutation = trpc.admin.resendPdfEmail.useMutation({
    onSuccess: () => {
      refetchPayments();
    },
  });

  // Filter payments by email
  const filteredPayments = useMemo(() => {
    if (!paymentsData) return [];
    if (!searchEmail) return paymentsData;
    return paymentsData.filter((payment: any) =>
      payment.customerEmail.toLowerCase().includes(searchEmail.toLowerCase())
    );
  }, [paymentsData, searchEmail]);

  const handleResendEmail = (orderId: number) => {
    if (confirm("Are you sure you want to resend the PDF email to this customer?")) {
      resendEmailMutation.mutate({ orderId });
    }
  };

  const handleDownloadPdf = (orderId: number) => {
    const payment = paymentsData?.find((p: any) => p.orderId === orderId);
    if (payment?.pdfUrl) {
      window.open(payment.pdfUrl, "_blank");
    }
  };

  // Statistics
  const stats = useMemo(() => {
    if (!paymentsData) return { total: 0, completed: 0, pending: 0, noEmail: 0, noPdf: 0 };

    return {
      total: paymentsData.length,
      completed: paymentsData.filter((p: any) => p.paymentStatus === "completed").length,
      pending: paymentsData.filter((p: any) => p.paymentStatus === "pending").length,
      noEmail: paymentsData.filter((p: any) => !p.emailSent).length,
      noPdf: paymentsData.filter((p: any) => !p.pdfUrl).length,
    };
  }, [paymentsData]);

  return (
    <div className="space-y-4">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Payments</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Completed</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">No Email</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.noEmail}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">No PDF</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.noPdf}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Issues Alert */}
      {stats.noEmail > 0 || stats.noPdf > 0 ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Critical Issues:</strong> {stats.noEmail} customers haven't received emails, {stats.noPdf} orders missing PDFs. Review and resend immediately.
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Search and Filter */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Search Payments</CardTitle>
          <CardDescription>Find payments by customer email address</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search by email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={() => refetchPayments()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>All Payments ({filteredPayments.length})</CardTitle>
          <CardDescription>Complete list of customer payments and delivery status</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {paymentsLoading ? (
            <div className="text-center py-8">Loading payments...</div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No payments found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Email Sent</TableHead>
                    <TableHead>PDF</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment: any) => (
                    <TableRow key={payment.orderId}>
                      <TableCell className="font-medium">{payment.orderId}</TableCell>
                      <TableCell>{payment.customerName}</TableCell>
                      <TableCell className="text-sm">{payment.customerEmail}</TableCell>
                      <TableCell>${(payment.amount / 100).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={payment.paymentStatus === "completed" ? "default" : "secondary"}>
                          {payment.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={payment.emailSent ? "outline" : "destructive"}>
                          {payment.emailSent ? "✓ Sent" : "✗ Not Sent"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={payment.pdfUrl ? "outline" : "secondary"}>
                          {payment.pdfUrl ? "✓ Available" : "✗ Missing"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedOrderId(payment.orderId)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {payment.pdfUrl && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDownloadPdf(payment.orderId)}
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleResendEmail(payment.orderId)}
                            disabled={resendEmailMutation.isPending}
                            title="Resend PDF email"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Details Panel */}
      {selectedOrderId && paymentDetails && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Payment Details - Order #{selectedOrderId}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedOrderId(null)}
              className="absolute right-4 top-4"
            >
              ✕
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Customer Name</p>
                <p className="font-medium">{paymentDetails.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customer Email</p>
                <p className="font-medium">{paymentDetails.customerEmail}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-medium">${(parseFloat(paymentDetails.amount) / 100).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <Badge>{paymentDetails.paymentStatus}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email Sent</p>
                <Badge variant={paymentDetails.emailSent === 1 ? "outline" : "destructive"}>
                  {paymentDetails.emailSent === 1 ? "Yes" : "No"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{new Date(paymentDetails.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {paymentDetails.pdfUrl && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">PDF URL</p>
                <div className="flex gap-2">
                  <Input value={paymentDetails.pdfUrl} readOnly className="text-xs" />
                  <Button onClick={() => handleDownloadPdf(selectedOrderId)} size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => handleResendEmail(selectedOrderId)}
                disabled={resendEmailMutation.isPending}
                className="flex-1"
              >
                <Mail className="h-4 w-4 mr-2" />
                {resendEmailMutation.isPending ? "Sending..." : "Resend PDF Email"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
