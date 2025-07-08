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
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-green-600 dark:text-green-400">
            NON-DISCLOSURE AGREEMENT
          </h3>
        </div>
        
        <div className="mb-6 text-sm">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            This Non‑Disclosure Agreement ("Agreement") is effective as of the date the Receiving Party clicks "I Agree," by and between <strong>TruckFlow AI</strong> ("Disclosing Party") and the individual or entity accessing the demo ("Receiving Party").
          </p>
          
          <div className="space-y-3 max-h-[50vh] overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">1. Definition of Confidential Information</p>
              <p className="text-gray-600 dark:text-gray-400">All non-public information shared via the demo—code, algorithms, business/data plans—is "Confidential Information."</p>
            </div>
            
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">2. Obligations</p>
              <div className="text-gray-600 dark:text-gray-400 ml-2">
                <p>a) Maintain confidentiality and not disclose.</p>
                <p>b) Use solely to evaluate the demo.</p>
                <p>c) Prevent third-party access.</p>
              </div>
            </div>
            
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">3. Exclusions</p>
              <p className="text-gray-600 dark:text-gray-400">Public domain, independently developed, rightfully received, or legally required disclosures are not covered.</p>
            </div>
            
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">4. Term</p>
              <p className="text-gray-600 dark:text-gray-400">Protection continues until info is public through no fault of Receiving Party <strong>or for 5 years</strong> from acceptance.</p>
            </div>
            
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">5. No License</p>
              <p className="text-gray-600 dark:text-gray-400">No ownership, patent, or license rights are granted by this Agreement.</p>
            </div>
            
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">6. Remedies & Injunctive Relief</p>
              <p className="text-gray-600 dark:text-gray-400">Breach causes irreparable harm. Disclosing Party may seek immediate injunctive relief without bond or proof of damage, plus actual and punitive damages, attorneys' fees, and costs.</p>
            </div>
            
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">7. Choice of Law & Jury Waiver</p>
              <p className="text-gray-600 dark:text-gray-400">Governed by the laws of the State of <strong>Alabama</strong>. Receiving Party irrevocably consents to exclusive jurisdiction and venue in state or federal courts in <strong>Alabama</strong>. They waive jury trial, class action status, arbitration, and any objections to personal jurisdiction or venue.</p>
            </div>
            
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">8. Consent to Suit</p>
              <p className="text-gray-600 dark:text-gray-400">By clicking "I Agree" the Receiving Party consents to being sued individually (no derivative or class claims) in Alabama courts and agrees not to challenge the enforceability of this Agreement.</p>
            </div>
            
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">9. Severability</p>
              <p className="text-gray-600 dark:text-gray-400">If any part is unenforceable, the rest remains valid.</p>
            </div>
            
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">10. Entire Agreement</p>
              <p className="text-gray-600 dark:text-gray-400">This Agreement is the full understanding between parties and supersedes prior agreements.</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              <strong>BY CLICKING "I AGREE" YOU ACKNOWLEDGE YOU HAVE READ, UNDERSTAND, AND AGREE TO THIS NDA IN FULL.</strong>
            </p>
          </div>
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