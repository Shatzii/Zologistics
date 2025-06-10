import { createHash } from 'crypto';
import { storage } from './storage';

export interface DocumentAnalysis {
  id: string;
  documentType: 'bill_of_lading' | 'delivery_receipt' | 'inspection_report' | 'damage_report' | 'invoice';
  imageUrl: string;
  extractedData: {
    loadNumber?: string;
    pickupDate?: Date;
    deliveryDate?: Date;
    weight?: number;
    pieces?: number;
    commodity?: string;
    origin?: string;
    destination?: string;
    carrier?: string;
    shipper?: string;
    receiver?: string;
    rate?: number;
    damages?: string[];
    signatures?: boolean;
  };
  confidence: number;
  status: 'processing' | 'completed' | 'error';
  processedAt: Date;
  verificationHash: string;
}

export interface LoadInspection {
  id: string;
  loadId: number;
  driverId: number;
  inspectionType: 'pre_pickup' | 'post_pickup' | 'pre_delivery' | 'post_delivery';
  timestamp: Date;
  images: {
    id: string;
    url: string;
    analysis: {
      damages: Array<{
        type: string;
        severity: 'minor' | 'major' | 'critical';
        location: string;
        confidence: number;
      }>;
      cargo: {
        secured: boolean;
        properly_loaded: boolean;
        count_verified: boolean;
        condition: 'excellent' | 'good' | 'fair' | 'poor';
      };
      vehicle: {
        clean: boolean;
        defects: string[];
        maintenance_needed: boolean;
      };
    };
  }[];
  overallScore: number;
  flaggedIssues: string[];
  autoApproved: boolean;
}

export class ComputerVisionService {
  private documentAnalyses: Map<string, DocumentAnalysis> = new Map();
  private inspections: Map<string, LoadInspection> = new Map();

  async analyzeDocument(imageUrl: string, expectedType?: string): Promise<DocumentAnalysis> {
    const analysis: DocumentAnalysis = {
      id: this.generateAnalysisId(),
      documentType: this.detectDocumentType(imageUrl, expectedType),
      imageUrl,
      extractedData: {},
      confidence: 0,
      status: 'processing',
      processedAt: new Date(),
      verificationHash: this.generateVerificationHash(imageUrl)
    };

    this.documentAnalyses.set(analysis.id, analysis);

    // Simulate processing with realistic extracted data
    setTimeout(() => {
      this.processDocument(analysis.id);
    }, 2000);

    return analysis;
  }

  private async processDocument(analysisId: string): Promise<void> {
    const analysis = this.documentAnalyses.get(analysisId);
    if (!analysis) return;

    // Simulate OCR and data extraction based on document type
    switch (analysis.documentType) {
      case 'bill_of_lading':
        analysis.extractedData = {
          loadNumber: `BOL-${Math.floor(Math.random() * 10000)}`,
          pickupDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
          deliveryDate: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000),
          weight: Math.floor(Math.random() * 40000) + 5000,
          pieces: Math.floor(Math.random() * 50) + 1,
          commodity: ['Electronics', 'Food Products', 'Machinery', 'Textiles'][Math.floor(Math.random() * 4)],
          origin: 'Chicago, IL',
          destination: 'Dallas, TX',
          shipper: 'ABC Manufacturing Corp',
          receiver: 'XYZ Distribution Inc',
          rate: Math.floor(Math.random() * 3000) + 1500
        };
        break;
      
      case 'delivery_receipt':
        analysis.extractedData = {
          loadNumber: `DR-${Math.floor(Math.random() * 10000)}`,
          deliveryDate: new Date(),
          pieces: Math.floor(Math.random() * 50) + 1,
          receiver: 'Customer Signature',
          signatures: Math.random() > 0.3,
          damages: Math.random() > 0.8 ? ['Minor scratches on packaging'] : []
        };
        break;

      case 'inspection_report':
        analysis.extractedData = {
          damages: Math.random() > 0.7 ? ['Cargo shift detected', 'Container door seal broken'] : [],
          commodity: ['Electronics', 'Food Products', 'Machinery'][Math.floor(Math.random() * 3)]
        };
        break;
    }

    analysis.confidence = Math.random() * 0.3 + 0.7; // 70-100% confidence
    analysis.status = 'completed';
    this.documentAnalyses.set(analysisId, analysis);
  }

  async performLoadInspection(
    loadId: number, 
    driverId: number, 
    inspectionType: LoadInspection['inspectionType'],
    imageUrls: string[]
  ): Promise<LoadInspection> {
    const inspection: LoadInspection = {
      id: this.generateInspectionId(),
      loadId,
      driverId,
      inspectionType,
      timestamp: new Date(),
      images: [],
      overallScore: 0,
      flaggedIssues: [],
      autoApproved: false
    };

    // Process each image
    for (const imageUrl of imageUrls) {
      const imageAnalysis = await this.analyzeInspectionImage(imageUrl, inspectionType);
      inspection.images.push(imageAnalysis);
    }

    // Calculate overall score and determine auto-approval
    inspection.overallScore = this.calculateInspectionScore(inspection.images);
    inspection.flaggedIssues = this.identifyFlaggedIssues(inspection.images);
    inspection.autoApproved = inspection.overallScore >= 85 && inspection.flaggedIssues.length === 0;

    this.inspections.set(inspection.id, inspection);
    return inspection;
  }

  private async analyzeInspectionImage(imageUrl: string, inspectionType: string) {
    // Simulate computer vision analysis
    const damages = Math.random() > 0.8 ? [
      {
        type: ['scratch', 'dent', 'tear', 'stain'][Math.floor(Math.random() * 4)],
        severity: (['minor', 'major', 'critical'] as const)[Math.floor(Math.random() * 3)],
        location: ['front', 'side', 'rear', 'top'][Math.floor(Math.random() * 4)],
        confidence: Math.random() * 0.3 + 0.7
      }
    ] : [];

    return {
      id: this.generateImageAnalysisId(),
      url: imageUrl,
      analysis: {
        damages,
        cargo: {
          secured: Math.random() > 0.1,
          properly_loaded: Math.random() > 0.15,
          count_verified: Math.random() > 0.05,
          condition: (['excellent', 'good', 'fair', 'poor'] as const)[Math.floor(Math.random() * 4)]
        },
        vehicle: {
          clean: Math.random() > 0.2,
          defects: Math.random() > 0.7 ? ['Tire wear', 'Light malfunction'] : [],
          maintenance_needed: Math.random() > 0.8
        }
      }
    };
  }

  private calculateInspectionScore(images: LoadInspection['images']): number {
    let totalScore = 0;
    let factors = 0;

    images.forEach(image => {
      const analysis = image.analysis;
      
      // Damage penalties
      const damageScore = Math.max(0, 100 - (analysis.damages.length * 15));
      
      // Cargo score
      let cargoScore = 100;
      if (!analysis.cargo.secured) cargoScore -= 30;
      if (!analysis.cargo.properly_loaded) cargoScore -= 20;
      if (!analysis.cargo.count_verified) cargoScore -= 10;
      if (analysis.cargo.condition === 'poor') cargoScore -= 25;
      if (analysis.cargo.condition === 'fair') cargoScore -= 10;

      // Vehicle score
      let vehicleScore = 100;
      if (!analysis.vehicle.clean) vehicleScore -= 15;
      vehicleScore -= analysis.vehicle.defects.length * 10;
      if (analysis.vehicle.maintenance_needed) vehicleScore -= 20;

      totalScore += (damageScore + cargoScore + vehicleScore) / 3;
      factors++;
    });

    return factors > 0 ? Math.round(totalScore / factors) : 0;
  }

  private identifyFlaggedIssues(images: LoadInspection['images']): string[] {
    const issues: string[] = [];

    images.forEach(image => {
      const analysis = image.analysis;
      
      // Critical damages
      analysis.damages.forEach(damage => {
        if (damage.severity === 'critical') {
          issues.push(`Critical ${damage.type} detected at ${damage.location}`);
        }
      });

      // Cargo issues
      if (!analysis.cargo.secured) {
        issues.push('Cargo not properly secured');
      }
      if (analysis.cargo.condition === 'poor') {
        issues.push('Cargo condition rated as poor');
      }

      // Vehicle issues
      if (analysis.vehicle.maintenance_needed) {
        issues.push('Vehicle maintenance required');
      }
    });

    return issues;
  }

  private detectDocumentType(imageUrl: string, expectedType?: string): DocumentAnalysis['documentType'] {
    if (expectedType) {
      return expectedType as DocumentAnalysis['documentType'];
    }
    
    // Simulate document type detection based on visual analysis
    const types: DocumentAnalysis['documentType'][] = [
      'bill_of_lading', 'delivery_receipt', 'inspection_report', 'damage_report', 'invoice'
    ];
    return types[Math.floor(Math.random() * types.length)];
  }

  private generateAnalysisId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateInspectionId(): string {
    return `inspection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateImageAnalysisId(): string {
    return `img_analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateVerificationHash(data: string): string {
    return createHash('sha256').update(data + Date.now()).digest('hex');
  }

  getDocumentAnalysis(id: string): DocumentAnalysis | undefined {
    return this.documentAnalyses.get(id);
  }

  getLoadInspection(id: string): LoadInspection | undefined {
    return this.inspections.get(id);
  }

  getAllDocumentAnalyses(): DocumentAnalysis[] {
    return Array.from(this.documentAnalyses.values());
  }

  getAllInspections(): LoadInspection[] {
    return Array.from(this.inspections.values());
  }

  async getInspectionsByLoad(loadId: number): Promise<LoadInspection[]> {
    return Array.from(this.inspections.values()).filter(i => i.loadId === loadId);
  }
}

export const computerVisionService = new ComputerVisionService();