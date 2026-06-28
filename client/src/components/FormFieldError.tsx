import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormFieldErrorProps {
  error?: string;
  touched?: boolean;
}

export const FormFieldError: React.FC<FormFieldErrorProps> = ({ error, touched }) => {
  if (!error || !touched) return null;

  return (
    <div className="flex items-center gap-1 mt-1">
      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
      <span className="text-xs font-medium text-red-600">{error}</span>
    </div>
  );
};

export default FormFieldError;
