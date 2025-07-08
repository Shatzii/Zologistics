import { useState, useEffect } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CreditCard, Truck } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  loadBoardAccess: string[];
  recommended?: boolean;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free Tier',
    price: 0,
    features: [
      '10 free load boards',
      '10 loads per day limit',
      'Basic route optimization',
      'Standard support'
    ],
    loadBoardAccess: [
      '123LoadBoard (Free)',
      'FreeFreightSearch',
      'NextLOAD',
      'TruckSmarter',
      'Shiply',
      'FreightCenter',
      'uShip (Free)',
      'Cargomatic',
      'Convoy',
      'Trucker Path'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 79,
    recommended: true,
    features: [
      'All free features',
      'Unlimited loads',
      'AI rate optimization',
      'Real-time notifications',
      'Advanced analytics',
      'Priority support'
    ],
    loadBoardAccess: [
      'All 10 free load boards',
      'Premium features unlocked',
      'AI-powered matching',
      'Real-time alerts'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 149,
    features: [
      'All premium features',
      'DAT LoadBoard access',
      'Truckstop.com access',
      '800K+ daily loads',
      'White-label solution',
      'Dedicated account manager',
      'Custom integrations'
    ],
    loadBoardAccess: [
      'All premium load boards',
      'DAT LoadBoard (500K+ loads)',
      'Truckstop.com (300K+ loads)',
      'CH Robinson API',
      'Enterprise-grade features'
    ]
  }
];

const CheckoutForm = ({ planId }: { planId: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!stripe || !elements) {
      setIsProcessing(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payments?success=true`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Your subscription has been activated!",
      });
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
      >
        {isProcessing ? 'Processing...' : 'Subscribe Now'}
      </Button>
    </form>
  );
};

export default function PaymentsPage() {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success')) {
      toast({
        title: "Payment Successful!",
        description: "Your subscription has been activated. You now have access to premium load boards.",
      });
    }
  }, [toast]);

  const handlePlanSelect = async (planId: string) => {
    if (planId === 'free') {
      toast({
        title: "Free Tier Activated",
        description: "You now have access to 10 free load boards with daily limits.",
      });
      return;
    }

    setIsLoading(true);
    setSelectedPlan(planId);

    try {
      const response = await apiRequest('POST', '/api/payments/create-subscription', {
        planId,
        priceId: planId === 'premium' ? 'price_premium' : 'price_enterprise'
      });
      
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
      setSelectedPlan(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedPlan && clientSecret) {
    const plan = subscriptionPlans.find(p => p.id === selectedPlan);
    
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedPlan(null);
              setClientSecret(null);
            }}
          >
            ← Back to Plans
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Complete Your {plan?.name} Subscription
            </CardTitle>
            <p className="text-muted-foreground">
              ${plan?.price}/month - {plan?.features.length} premium features included
            </p>
          </CardHeader>
          <CardContent>
            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance: {
                  theme: 'stripe'
                }
              }}
            >
              <CheckoutForm planId={selectedPlan} />
            </Elements>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Choose Your Load Board Plan</h1>
        <p className="text-muted-foreground">
          Get access to premium load boards and AI-powered features
        </p>
        {!stripePublicKey && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Payment processing is currently disabled. Configure Stripe keys to enable subscriptions.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {subscriptionPlans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${plan.recommended ? 'border-primary shadow-lg scale-105' : ''}`}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  Recommended
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Truck className="w-5 h-5" />
                {plan.name}
              </CardTitle>
              <div className="text-3xl font-bold">
                ${plan.price}
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Features:</h4>
                <ul className="space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Load Board Access:</h4>
                <ul className="space-y-1">
                  {plan.loadBoardAccess.map((board, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {board}
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                className="w-full" 
                onClick={() => handlePlanSelect(plan.id)}
                disabled={isLoading || (!stripePublicKey && plan.price > 0)}
                variant={plan.recommended ? 'default' : 'outline'}
              >
                {!stripePublicKey && plan.price > 0 ? 'Payment Setup Required' :
                 isLoading && selectedPlan === plan.id ? 'Loading...' : `Select ${plan.name}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Load Board Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Free Load Boards (10 boards)</h4>
                <ul className="space-y-2 text-sm">
                  <li>• 123LoadBoard - API access, 15min updates</li>
                  <li>• FreeFreightSearch - 30min updates</li>
                  <li>• NextLOAD - Embeddable widgets</li>
                  <li>• TruckSmarter - AI-compatible</li>
                  <li>• Shiply - European marketplace</li>
                  <li>• FreightCenter - Free quotes</li>
                  <li>• uShip - Marketplace model</li>
                  <li>• Cargomatic - Local freight</li>
                  <li>• Convoy - Tech-forward</li>
                  <li>• Trucker Path - Mobile-first</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Premium Load Boards</h4>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>DAT LoadBoard</strong> - 500K+ loads/day ($149 retail)</li>
                  <li>• <strong>Truckstop.com</strong> - 300K+ loads/day ($129 retail)</li>
                  <li>• <strong>CH Robinson</strong> - 200K+ loads/day ($299 retail)</li>
                  <li>• <strong>Your Cost:</strong> $79-149/month vs $577 individually</li>
                  <li>• <strong>Savings:</strong> Up to 86% cost reduction</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}