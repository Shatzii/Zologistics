import { createHash } from 'crypto';
import { storage } from './storage';

export interface SmartContract {
  id: string;
  loadId: number;
  carrierId: number;
  shipperId: number;
  contractHash: string;
  status: 'pending' | 'active' | 'completed' | 'disputed' | 'cancelled';
  terms: {
    rate: number;
    pickupDate: Date;
    deliveryDate: Date;
    origin: string;
    destination: string;
    penalties: {
      latePickup: number;
      lateDelivery: number;
      damage: number;
    };
    escrowAmount: number;
  };
  milestones: ContractMilestone[];
  signatures: {
    carrier: string | null;
    shipper: string | null;
    timestamp: Date | null;
  };
  escrowStatus: 'pending' | 'locked' | 'released' | 'disputed';
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractMilestone {
  id: string;
  description: string;
  completed: boolean;
  completedAt: Date | null;
  verificationHash: string | null;
  paymentPercentage: number;
}

export interface BlockchainTransaction {
  id: string;
  contractId: string;
  type: 'payment' | 'milestone' | 'dispute' | 'penalty';
  amount: number;
  from: string;
  to: string;
  hash: string;
  timestamp: Date;
  confirmed: boolean;
}

export class BlockchainContractService {
  private contracts: Map<string, SmartContract> = new Map();
  private transactions: Map<string, BlockchainTransaction> = new Map();

  async createSmartContract(
    loadId: number,
    carrierId: number,
    shipperId: number,
    terms: SmartContract['terms']
  ): Promise<SmartContract> {
    const contract: SmartContract = {
      id: this.generateContractId(),
      loadId,
      carrierId,
      shipperId,
      contractHash: this.generateContractHash(loadId, carrierId, shipperId, terms),
      status: 'pending',
      terms,
      milestones: this.generateMilestones(terms),
      signatures: {
        carrier: null,
        shipper: null,
        timestamp: null
      },
      escrowStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.contracts.set(contract.id, contract);
    return contract;
  }

  private generateMilestones(terms: SmartContract['terms']): ContractMilestone[] {
    return [
      {
        id: 'pickup',
        description: 'Load picked up from origin',
        completed: false,
        completedAt: null,
        verificationHash: null,
        paymentPercentage: 25
      },
      {
        id: 'in_transit',
        description: 'Load in transit',
        completed: false,
        completedAt: null,
        verificationHash: null,
        paymentPercentage: 25
      },
      {
        id: 'delivered',
        description: 'Load delivered to destination',
        completed: false,
        completedAt: null,
        verificationHash: null,
        paymentPercentage: 50
      }
    ];
  }

  async signContract(contractId: string, party: 'carrier' | 'shipper', signature: string): Promise<SmartContract> {
    const contract = this.contracts.get(contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    contract.signatures[party] = signature;
    contract.updatedAt = new Date();

    // If both parties signed, activate contract and lock escrow
    if (contract.signatures.carrier && contract.signatures.shipper) {
      contract.status = 'active';
      contract.escrowStatus = 'locked';
      contract.signatures.timestamp = new Date();
      
      // Create escrow transaction
      await this.createTransaction({
        contractId,
        type: 'payment',
        amount: contract.terms.escrowAmount,
        from: 'shipper',
        to: 'escrow',
        hash: this.generateTransactionHash(contractId, 'escrow_lock'),
        timestamp: new Date(),
        confirmed: true
      });
    }

    this.contracts.set(contractId, contract);
    return contract;
  }

  async completeMilestone(contractId: string, milestoneId: string, verificationData: any): Promise<void> {
    const contract = this.contracts.get(contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    const milestone = contract.milestones.find(m => m.id === milestoneId);
    if (!milestone) {
      throw new Error('Milestone not found');
    }

    milestone.completed = true;
    milestone.completedAt = new Date();
    milestone.verificationHash = this.generateVerificationHash(verificationData);

    // Process payment for completed milestone
    const paymentAmount = (contract.terms.rate * milestone.paymentPercentage) / 100;
    
    await this.createTransaction({
      contractId,
      type: 'milestone',
      amount: paymentAmount,
      from: 'escrow',
      to: 'carrier',
      hash: this.generateTransactionHash(contractId, milestoneId),
      timestamp: new Date(),
      confirmed: true
    });

    // Check if all milestones completed
    const allCompleted = contract.milestones.every(m => m.completed);
    if (allCompleted) {
      contract.status = 'completed';
      contract.escrowStatus = 'released';
    }

    contract.updatedAt = new Date();
    this.contracts.set(contractId, contract);
  }

  async processAutomaticPayment(contractId: string): Promise<void> {
    const contract = this.contracts.get(contractId);
    if (!contract || contract.status !== 'completed') {
      return;
    }

    const remainingAmount = contract.terms.rate - this.getContractPayments(contractId);
    
    if (remainingAmount > 0) {
      await this.createTransaction({
        contractId,
        type: 'payment',
        amount: remainingAmount,
        from: 'escrow',
        to: 'carrier',
        hash: this.generateTransactionHash(contractId, 'final_payment'),
        timestamp: new Date(),
        confirmed: true
      });
    }
  }

  async handleDispute(contractId: string, disputeReason: string): Promise<void> {
    const contract = this.contracts.get(contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    contract.status = 'disputed';
    contract.escrowStatus = 'disputed';
    contract.updatedAt = new Date();

    // Create dispute transaction
    await this.createTransaction({
      contractId,
      type: 'dispute',
      amount: 0,
      from: 'system',
      to: 'dispute_handler',
      hash: this.generateTransactionHash(contractId, 'dispute'),
      timestamp: new Date(),
      confirmed: true
    });

    this.contracts.set(contractId, contract);
  }

  private async createTransaction(transaction: Omit<BlockchainTransaction, 'id'>): Promise<BlockchainTransaction> {
    const fullTransaction: BlockchainTransaction = {
      id: this.generateTransactionId(),
      ...transaction
    };

    this.transactions.set(fullTransaction.id, fullTransaction);
    return fullTransaction;
  }

  private getContractPayments(contractId: string): number {
    const contractTransactions = Array.from(this.transactions.values())
      .filter(t => t.contractId === contractId && t.type === 'payment' && t.to === 'carrier');
    
    return contractTransactions.reduce((sum, t) => sum + t.amount, 0);
  }

  private generateContractId(): string {
    return `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateContractHash(loadId: number, carrierId: number, shipperId: number, terms: any): string {
    const data = JSON.stringify({ loadId, carrierId, shipperId, terms });
    return createHash('sha256').update(data).digest('hex');
  }

  private generateTransactionHash(contractId: string, action: string): string {
    const data = `${contractId}_${action}_${Date.now()}`;
    return createHash('sha256').update(data).digest('hex');
  }

  private generateVerificationHash(data: any): string {
    return createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  getContract(contractId: string): SmartContract | undefined {
    return this.contracts.get(contractId);
  }

  getAllContracts(): SmartContract[] {
    return Array.from(this.contracts.values());
  }

  getContractTransactions(contractId: string): BlockchainTransaction[] {
    return Array.from(this.transactions.values())
      .filter(t => t.contractId === contractId);
  }
}

export const blockchainService = new BlockchainContractService();