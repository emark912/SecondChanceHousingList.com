import React from 'react';
import { Check } from 'lucide-react';

interface SuccessIndicatorProps {
  show: boolean;
  message?: string;
}

export const SuccessIndicator: React.FC<SuccessIndicatorProps> = ({ show, message = 'Valid' }) => {
  if (!show) return null;

  return (
    <div className="success-indicator flex items-center gap-1 mt-1">
      <Check className="success-icon checkmark-icon w-4 h-4 text-green-500" strokeWidth={3} />
      <span className="success-message text-green-600 text-xs font-medium">{message}</span>
    </div>
  );
};

export default SuccessIndicator;
