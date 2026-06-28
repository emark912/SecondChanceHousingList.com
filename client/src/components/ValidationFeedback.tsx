import { Check, AlertCircle } from "lucide-react";

interface ValidationFeedbackProps {
  isValid: boolean;
  isTouched: boolean;
  hasError: boolean;
}

export function ValidationFeedback({
  isValid,
  isTouched,
  hasError,
}: ValidationFeedbackProps) {
  // Show nothing if field hasn't been touched
  if (!isTouched) {
    return null;
  }

  // Show error state
  if (hasError) {
    return (
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
        <AlertCircle className="w-5 h-5 text-red-500" />
      </div>
    );
  }

  // Show success state
  if (isValid) {
    return (
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
        <Check className="w-5 h-5 text-green-500 animate-pulse" />
      </div>
    );
  }

  return null;
}

export default ValidationFeedback;
