import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ConfidentialityPopupProps {
  onAccept: () => void;
}

export function ConfidentialityPopup({ onAccept }: ConfidentialityPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem('truckflowNdaAccepted') === 'true';
    if (!hasAccepted) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('truckflowNdaAccepted', 'true');
    localStorage.setItem('ndaAcceptedDate', new Date().toISOString());
    setIsVisible(false);
    onAccept();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🔒 Confidential Demo
          </h3>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-3">
            This is a confidential demonstration of proprietary logistics technology.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            By clicking "I Agree", you acknowledge that the information shown is confidential and proprietary.
          </p>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={handleAccept}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            I Agree
          </Button>
        </div>
      </div>
    </div>
  );
}