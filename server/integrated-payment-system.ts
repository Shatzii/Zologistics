export interface PaymentTransaction {
  id: string;
  driverId: number;
  loadId: string;
  amount: number;
  type: 'load_payment' | 'factoring' | 'fuel_advance' | 'subscription';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'disputed';
  method: 'ach' | 'wire' | 'check' | 'card' | 'crypto';
  initiatedAt: Date;
  completedAt?: Date;
  fees: {
    platform: number;
    processing: number;
    expedite?: number;
  };
  brokerInfo?: {
    name: string;
    mcNumber: string;
    paymentTerms: string;
  };
  factoring?: {
    company: string;
    rate: number;
    advance: number;
  };
}

export interface FactoringPartner {
  id: string;
  name: string;
  rating: number;
  rates: {
    standard: number; // percentage
    expedite: number;
    recourse: number;
    nonRecourse: number;
  };
  minimumLoad: number;
  paymentSpeed: {
    standard: number; // hours
    expedite: number;
  };
  approvalCriteria: {
    creditScore: number;
    timeInBusiness: number; // months
    brokerApproval: boolean;
  };
  fees: {
    setup: number;
    monthly: number;
    wire: number;
    ach: number;
  };
  specialties: string[];
}

export interface FuelCardProgram {
  id: string;
  provider: string;
  discountRate: number; // cents per gallon
  networkSize: number;
  monthlyFee: number;
  cashbackRate: number; // percentage
  features: {
    realTimeReporting: boolean;
    expenseTracking: boolean;
    routeOptimization: boolean;
    fraudProtection: boolean;
  };
  restrictions: string[];
}

export class IntegratedPaymentSystem {
  private transactions: Map<string, PaymentTransaction> = new Map();
  private factoringPartners: Map<string, FactoringPartner> = new Map();
  private fuelCardPrograms: Map<string, FuelCardProgram> = new Map();
  private driverPaymentMethods: Map<number, any> = new Map();
  private paymentSchedules: Map<string, any> = new Map();

  constructor() {
    this.initializePaymentSystem();
  }

  private initializePaymentSystem() {
    this.setupFactoringPartners();
    this.setupFuelCardPrograms();
    this.initializeDriverPaymentMethods();
    this.generateSampleTransactions();

    // Process pending payments every hour
    setInterval(() => {
      this.processPendingPayments();
    }, 60 * 60 * 1000);

    // Update payment statuses every 15 minutes
    setInterval(() => {
      this.updatePaymentStatuses();
    }, 15 * 60 * 1000);

    console.log('💳 Integrated payment system initialized');
  }

  private setupFactoringPartners() {
    const partners: FactoringPartner[] = [
      {
        id: 'triumph-capital',
        name: 'Triumph Business Capital',
        rating: 4.6,
        rates: {
          standard: 2.5,
          expedite: 3.5,
          recourse: 2.0,
          nonRecourse: 3.0
        },
        minimumLoad: 500,
        paymentSpeed: {
          standard: 24,
          expedite: 2
        },
        approvalCriteria: {
          creditScore: 600,
          timeInBusiness: 6,
          brokerApproval: true
        },
        fees: {
          setup: 0,
          monthly: 50,
          wire: 25,
          ach: 0
        },
        specialties: ['Transportation', 'Logistics', 'Emergency Funding']
      },
      {
        id: 'porter-freight',
        name: 'Porter Freight Funding',
        rating: 4.4,
        rates: {
          standard: 2.8,
          expedite: 3.8,
          recourse: 2.2,
          nonRecourse: 3.2
        },
        minimumLoad: 300,
        paymentSpeed: {
          standard: 12,
          expedite: 1
        },
        approvalCriteria: {
          creditScore: 580,
          timeInBusiness: 3,
          brokerApproval: false
        },
        fees: {
          setup: 100,
          monthly: 35,
          wire: 30,
          ach: 5
        },
        specialties: ['Small Carriers', 'Fast Funding', 'No Minimums']
      },
      {
        id: 'rts-financial',
        name: 'RTS Financial',
        rating: 4.7,
        rates: {
          standard: 2.3,
          expedite: 3.2,
          recourse: 1.8,
          nonRecourse: 2.8
        },
        minimumLoad: 1000,
        paymentSpeed: {
          standard: 24,
          expedite: 4
        },
        approvalCriteria: {
          creditScore: 650,
          timeInBusiness: 12,
          brokerApproval: true
        },
        fees: {
          setup: 0,
          monthly: 75,
          wire: 20,
          ach: 0
        },
        specialties: ['Established Carriers', 'Volume Discounts', 'Tech Integration']
      }
    ];

    partners.forEach(partner => {
      this.factoringPartners.set(partner.id, partner);
    });
  }

  private setupFuelCardPrograms() {
    const programs: FuelCardProgram[] = [
      {
        id: 'pilot-fleet',
        provider: 'Pilot Flying J Fleet Card',
        discountRate: 7, // cents per gallon
        networkSize: 750,
        monthlyFee: 0,
        cashbackRate: 2.0,
        features: {
          realTimeReporting: true,
          expenseTracking: true,
          routeOptimization: true,
          fraudProtection: true
        },
        restrictions: ['Pilot/Flying J locations only']
      },
      {
        id: 'loves-fleet',
        provider: 'Love\'s Fleet Card',
        discountRate: 6,
        networkSize: 580,
        monthlyFee: 5,
        cashbackRate: 1.5,
        features: {
          realTimeReporting: true,
          expenseTracking: true,
          routeOptimization: false,
          fraudProtection: true
        },
        restrictions: ['Love\'s locations only']
      },
      {
        id: 'comdata-universal',
        provider: 'Comdata Universal Fleet Card',
        discountRate: 4,
        networkSize: 3500,
        monthlyFee: 12,
        cashbackRate: 1.0,
        features: {
          realTimeReporting: true,
          expenseTracking: true,
          routeOptimization: true,
          fraudProtection: true
        },
        restrictions: ['Minimum purchase requirements']
      }
    ];

    programs.forEach(program => {
      this.fuelCardPrograms.set(program.id, program);
    });
  }

  private initializeDriverPaymentMethods() {
    // Sample payment methods for driver 1
    this.driverPaymentMethods.set(1, {
      primaryMethod: 'ach',
      accounts: {
        ach: {
          bankName: 'Wells Fargo',
          accountType: 'checking',
          lastFour: '3456',
          verified: true
        },
        wire: {
          bankName: 'Wells Fargo',
          routingNumber: '121000248',
          verified: true
        }
      },
      preferences: {
        defaultMethod: 'ach',
        expediteThreshold: 5000, // Use expedite for loads over $5000
        autoFactoring: false,
        notifications: {
          email: true,
          sms: true,
          push: true
        }
      },
      factoringSetup: {
        partnerId: 'triumph-capital',
        approved: true,
        creditLimit: 50000,
        rates: {
          standard: 2.3, // negotiated rate
          expedite: 3.3
        }
      },
      fuelCard: {
        programId: 'pilot-fleet',
        cardNumber: '**** **** **** 7890',
        monthlySpend: 2500,
        savingsToDate: 180
      }
    });
  }

  private generateSampleTransactions() {
    const sampleTransactions: PaymentTransaction[] = [
      {
        id: 'PAY001',
        driverId: 1,
        loadId: 'LOAD001',
        amount: 2800,
        type: 'load_payment',
        status: 'completed',
        method: 'ach',
        initiatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        fees: {
          platform: 56, // 2% of load value
          processing: 15
        },
        brokerInfo: {
          name: 'C.H. Robinson',
          mcNumber: 'MC-15055',
          paymentTerms: 'Net 30'
        }
      },
      {
        id: 'PAY002',
        driverId: 1,
        loadId: 'LOAD002',
        amount: 3200,
        type: 'factoring',
        status: 'completed',
        method: 'ach',
        initiatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 22 * 60 * 60 * 1000),
        fees: {
          platform: 64,
          processing: 0
        },
        factoring: {
          company: 'Triumph Business Capital',
          rate: 2.3,
          advance: 3126 // 97.7% of load value
        }
      },
      {
        id: 'PAY003',
        driverId: 1,
        loadId: 'LOAD003',
        amount: 1500,
        type: 'fuel_advance',
        status: 'processing',
        method: 'card',
        initiatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        fees: {
          platform: 30,
          processing: 5,
          expedite: 25
        }
      }
    ];

    sampleTransactions.forEach(transaction => {
      this.transactions.set(transaction.id, transaction);
    });
  }

  public async initiatePayment(
    driverId: number,
    loadId: string,
    amount: number,
    type: PaymentTransaction['type'],
    expedite: boolean = false
  ): Promise<PaymentTransaction> {
    
    const paymentMethods = this.driverPaymentMethods.get(driverId);
    if (!paymentMethods) {
      throw new Error('Driver payment methods not configured');
    }

    const transactionId = `PAY${Date.now()}`;
    const platformFee = amount * 0.02; // 2% platform fee
    const processingFee = expedite ? 25 : 15;
    const expediteFee = expedite ? 50 : 0;

    const transaction: PaymentTransaction = {
      id: transactionId,
      driverId,
      loadId,
      amount,
      type,
      status: 'pending',
      method: expedite ? 'wire' : paymentMethods.preferences.defaultMethod,
      initiatedAt: new Date(),
      fees: {
        platform: platformFee,
        processing: processingFee,
        expedite: expediteFee
      }
    };

    this.transactions.set(transactionId, transaction);

    // Start processing
    setTimeout(() => {
      this.processPayment(transactionId);
    }, 1000);

    return transaction;
  }

  private async processPayment(transactionId: string): Promise<void> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) return;

    transaction.status = 'processing';

    // Simulate processing time based on method
    const processingTime = transaction.method === 'wire' ? 2 * 60 * 60 * 1000 : // 2 hours for wire
                          transaction.method === 'ach' ? 24 * 60 * 60 * 1000 : // 24 hours for ACH
                          5 * 60 * 1000; // 5 minutes for card

    setTimeout(() => {
      transaction.status = 'completed';
      transaction.completedAt = new Date();
      
      console.log(`💰 Payment ${transactionId} completed: $${transaction.amount}`);
      
      // Send notification (simulated)
      this.sendPaymentNotification(transaction);
    }, processingTime);
  }

  private sendPaymentNotification(transaction: PaymentTransaction): void {
    const paymentMethods = this.driverPaymentMethods.get(transaction.driverId);
    if (paymentMethods?.preferences.notifications.push) {
      console.log(`📱 Payment notification sent to driver ${transaction.driverId}`);
    }
  }

  public async requestFactoring(
    driverId: number,
    loadId: string,
    amount: number,
    expedite: boolean = false
  ): Promise<PaymentTransaction> {
    
    const paymentMethods = this.driverPaymentMethods.get(driverId);
    if (!paymentMethods?.factoringSetup.approved) {
      throw new Error('Factoring not approved for this driver');
    }

    const factoringRate = expedite ? 
      paymentMethods.factoringSetup.rates.expedite : 
      paymentMethods.factoringSetup.rates.standard;

    const factoringFee = amount * (factoringRate / 100);
    const advanceAmount = amount - factoringFee;

    const transaction = await this.initiatePayment(driverId, loadId, advanceAmount, 'factoring', expedite);
    
    transaction.factoring = {
      company: this.factoringPartners.get(paymentMethods.factoringSetup.partnerId)?.name || 'Unknown',
      rate: factoringRate,
      advance: advanceAmount
    };

    return transaction;
  }

  public async requestFuelAdvance(
    driverId: number,
    amount: number,
    location: string
  ): Promise<PaymentTransaction> {
    
    const maxAdvance = 1000; // Maximum fuel advance
    const requestAmount = Math.min(amount, maxAdvance);
    
    const loadId = `FUEL${Date.now()}`;
    return await this.initiatePayment(driverId, loadId, requestAmount, 'fuel_advance', true);
  }

  private processPendingPayments(): void {
    for (const [id, transaction] of this.transactions) {
      if (transaction.status === 'pending') {
        this.processPayment(id);
      }
    }
  }

  private updatePaymentStatuses(): void {
    // Simulate status updates for processing payments
    for (const [id, transaction] of this.transactions) {
      if (transaction.status === 'processing') {
        const processingTime = Date.now() - transaction.initiatedAt.getTime();
        const expectedTime = transaction.method === 'wire' ? 2 * 60 * 60 * 1000 :
                            transaction.method === 'ach' ? 24 * 60 * 60 * 1000 :
                            5 * 60 * 1000;

        if (processingTime >= expectedTime) {
          transaction.status = 'completed';
          transaction.completedAt = new Date();
          this.sendPaymentNotification(transaction);
        }
      }
    }
  }

  public getDriverTransactions(driverId: number, limit: number = 20): PaymentTransaction[] {
    return Array.from(this.transactions.values())
      .filter(t => t.driverId === driverId)
      .sort((a, b) => b.initiatedAt.getTime() - a.initiatedAt.getTime())
      .slice(0, limit);
  }

  public getTransactionById(transactionId: string): PaymentTransaction | undefined {
    return this.transactions.get(transactionId);
  }

  public getFactoringPartners(): FactoringPartner[] {
    return Array.from(this.factoringPartners.values());
  }

  public getFuelCardPrograms(): FuelCardProgram[] {
    return Array.from(this.fuelCardPrograms.values());
  }

  public getDriverPaymentMethods(driverId: number): any {
    return this.driverPaymentMethods.get(driverId);
  }

  public calculatePaymentSavings(driverId: number, period: 'monthly' | 'yearly' = 'monthly'): any {
    const transactions = this.getDriverTransactions(driverId, 1000);
    const days = period === 'monthly' ? 30 : 365;
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    const recentTransactions = transactions.filter(t => t.initiatedAt.getTime() > cutoff);
    
    const totalVolume = recentTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalFees = recentTransactions.reduce((sum, t) => 
      sum + t.fees.platform + t.fees.processing + (t.fees.expedite || 0), 0);
    
    // Calculate savings vs traditional factoring (3.5% average)
    const traditionalFactoringCost = totalVolume * 0.035;
    const savings = traditionalFactoringCost - totalFees;
    
    const paymentMethods = this.driverPaymentMethods.get(driverId);
    const fuelSavings = paymentMethods?.fuelCard?.savingsToDate || 0;
    
    return {
      period,
      totalVolume,
      platformFees: totalFees,
      traditionalCost: traditionalFactoringCost,
      totalSavings: savings + fuelSavings,
      factoringAdvantage: savings,
      fuelSavings: fuelSavings,
      averageProcessingTime: this.calculateAverageProcessingTime(recentTransactions),
      fastestPayment: this.getFastestPayment(recentTransactions)
    };
  }

  private calculateAverageProcessingTime(transactions: PaymentTransaction[]): number {
    const completed = transactions.filter(t => t.completedAt);
    if (completed.length === 0) return 0;
    
    const totalTime = completed.reduce((sum, t) => {
      return sum + (t.completedAt!.getTime() - t.initiatedAt.getTime());
    }, 0);
    
    return Math.round(totalTime / completed.length / (60 * 60 * 1000)); // hours
  }

  private getFastestPayment(transactions: PaymentTransaction[]): number {
    const completed = transactions.filter(t => t.completedAt);
    if (completed.length === 0) return 0;
    
    const times = completed.map(t => t.completedAt!.getTime() - t.initiatedAt.getTime());
    return Math.round(Math.min(...times) / (60 * 60 * 1000)); // hours
  }

  public getPaymentAnalytics(driverId: number): any {
    const transactions = this.getDriverTransactions(driverId, 1000);
    
    return {
      totalTransactions: transactions.length,
      totalVolume: transactions.reduce((sum, t) => sum + t.amount, 0),
      averageLoadValue: transactions.length > 0 ? 
        transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length : 0,
      paymentMethods: this.analyzePaymentMethods(transactions),
      monthlyTrend: this.calculateMonthlyTrend(transactions),
      savings: this.calculatePaymentSavings(driverId, 'yearly')
    };
  }

  private analyzePaymentMethods(transactions: PaymentTransaction[]): any {
    const methods = transactions.reduce((acc, t) => {
      acc[t.method] = (acc[t.method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(methods).map(([method, count]) => ({
      method,
      count,
      percentage: (count / transactions.length) * 100
    }));
  }

  private calculateMonthlyTrend(transactions: PaymentTransaction[]): any {
    const monthlyData = new Map<string, { volume: number; count: number }>();
    
    transactions.forEach(t => {
      const month = t.initiatedAt.toISOString().slice(0, 7); // YYYY-MM
      const existing = monthlyData.get(month) || { volume: 0, count: 0 };
      existing.volume += t.amount;
      existing.count++;
      monthlyData.set(month, existing);
    });

    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months
  }

  public getStatus(): any {
    const transactions = Array.from(this.transactions.values());
    
    return {
      totalTransactions: transactions.length,
      pendingTransactions: transactions.filter(t => t.status === 'pending').length,
      processingTransactions: transactions.filter(t => t.status === 'processing').length,
      completedTransactions: transactions.filter(t => t.status === 'completed').length,
      factoringPartners: this.factoringPartners.size,
      fuelCardPrograms: this.fuelCardPrograms.size,
      driversWithPaymentMethods: this.driverPaymentMethods.size
    };
  }
}

export const paymentSystem = new IntegratedPaymentSystem();