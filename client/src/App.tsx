import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import SearchingScreen from "./pages/SearchingScreen";
import Results from "./pages/Results";
import PropertyDetail from "./pages/PropertyDetail";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProperties from "./pages/AdminProperties";
import HowItWorks from "./pages/HowItWorks";
import FAQ from "./pages/FAQ";
import Application from "./pages/Application";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import ResultsCheckout from "./pages/ResultsCheckout";
import ThankYou from "./pages/ThankYou";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/searching"} component={SearchingScreen} />
      <Route path={"/results"} component={Results} />
      <Route path={"/property/:id"} component={PropertyDetail} />
      <Route path={"/checkout"} component={Checkout} />
      <Route path={"/checkout/success"} component={CheckoutSuccess} />
      <Route path={"/results-checkout"} component={ResultsCheckout} />
      <Route path={"/thank-you"} component={ThankYou} />
      <Route path={"/payment/success"} component={PaymentSuccess} />
      <Route path={"/payment/failed"} component={PaymentFailed} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/properties"} component={AdminProperties} />
      <Route path={"/how-it-works"} component={HowItWorks} />
      <Route path={"/faq"} component={FAQ} />
      <Route path={"/application"} component={Application} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
