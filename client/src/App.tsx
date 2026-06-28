import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import SearchFormPage from "./pages/SearchFormPage";
import SearchingScreen from "./pages/SearchingScreen";
import Results from "./pages/Results";
import Checkout from "./pages/Checkout";
import ResultsCheckout from "./pages/ResultsCheckout";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPrograms from "./pages/AdminPrograms";
import AdminLogin from "./pages/AdminLogin";
import PaymentSuccess from "./pages/PaymentSuccess";
import ThankYou from "./pages/ThankYou";
import FlexiblePayment from "./pages/FlexiblePayment";
import FlexiblePaymentConfirmation from "./pages/FlexiblePaymentConfirmation";
import AdminPaymentDashboard from "./pages/AdminPaymentDashboard";
import { EmailTemplateManager } from "./pages/EmailTemplateManager";
import { AdminEmailTemplates } from "./pages/AdminEmailTemplates";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import PaymentConfirmation from "./pages/PaymentConfirmation";
import CorporateLeasingConfirmation from "./pages/CorporateLeasingConfirmation";
import RentalProcessDirections from "./pages/RentalProcessDirections";
import ToDoList from "./pages/ToDoList";
import PartnershipProgram from "./pages/PartnershipProgram";
import PartnershipVerify from "./pages/PartnershipVerify";
import PartnershipDashboard from "./pages/PartnershipDashboard";
import { PartnerDashboardEnhanced } from "./pages/PartnerDashboardEnhanced";
import AdminPartnershipManagement from "./pages/AdminPartnershipManagement";

import PartnerSignup from "./pages/PartnerSignup";
import PartnerLogin from "./pages/PartnerLogin";
import PartnerVerifyEmail from "./pages/PartnerVerifyEmail";
import PartnerActivateTrial from "./pages/PartnerActivateTrial";
import PartnerCardUpdated from "./pages/PartnerCardUpdated";
import PartnerAccountDashboard from "./pages/PartnerAccountDashboard";
import TestPayment from "./pages/TestPayment";
import { PartnerProvider } from "./contexts/PartnerContext";
function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/search-form"} component={SearchFormPage} />
      <Route path={"/searching"} component={SearchingScreen} />
      <Route path={"/results/:orderId"} component={Results} />
      <Route path={"/results"} component={ResultsCheckout} />
      <Route path={"/checkout"} component={Checkout} />
      <Route path={"/payment-success"} component={PaymentSuccess} />
      <Route path={"/checkout-success"} component={CheckoutSuccess} />
      <Route path={"/payment-confirmation"} component={PaymentConfirmation} />
      <Route path={"/corporate-leasing-confirmation"} component={CorporateLeasingConfirmation} />
      <Route path={"/thank-you"} component={ThankYou} />
      <Route path={"/flexible-payment"} component={FlexiblePayment} />
      <Route path={"/flexible-payment-confirmation"} component={FlexiblePaymentConfirmation} />
      <Route path={"/faq"} component={FAQ} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/rental-process-directions"} component={RentalProcessDirections} />
      <Route path={"/to-do-list"} component={ToDoList} />
      <Route path={"/partnership"} component={PartnershipProgram} />
      <Route path={"/partnership/verify"} component={PartnershipVerify} />
      <Route path={"/partnership/dashboard"} component={PartnershipDashboard} />
      <Route path={"/partnership/dashboard-enhanced"} component={PartnerDashboardEnhanced} />
      <Route path={"/partner/signup"} component={PartnerSignup} />
      <Route path={"/partner/login"} component={PartnerLogin} />
      <Route path={"/partner/verify-email"} component={PartnerVerifyEmail} />
      <Route path={"/partner/activate-trial"} component={PartnerActivateTrial} />
      <Route path={"/partner/card-updated"} component={PartnerCardUpdated} />
      <Route path={"/partner/dashboard"} component={PartnerAccountDashboard} />
      <Route path={"/admin-login"} component={AdminLogin} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/programs"} component={AdminPrograms} />
      <Route path={"/admin/payments"} component={AdminPaymentDashboard} />
      <Route path={"/admin/email-templates"} component={AdminEmailTemplates} />
      <Route path={"/admin/partnership"} component={AdminPartnershipManagement} />
      <Route path={"/test-payment"} component={TestPayment} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <PartnerProvider>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </PartnerProvider>
    </ErrorBoundary>
  );
}

export default App;
