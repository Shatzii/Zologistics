import { Request, Response } from 'express';

export interface ComplianceRegion {
  code: string;
  name: string;
  currency: string;
  language: string;
  timezone: string;
  regulations: RegulationSet;
  taxRules: TaxConfiguration;
  dataPrivacy: PrivacyConfiguration;
}

export interface RegulationSet {
  drivingHours: {
    dailyLimit: number;
    weeklyLimit: number;
    mandatoryBreaks: BreakRule[];
    restPeriods: RestPeriod[];
  };
  documentation: {
    required: string[];
    digitalFormats: string[];
    retention: number; // days
  };
  crossBorder: {
    allowed: boolean;
    cabotageLimit?: number;
    permits: string[];
  };
  equipment: {
    eldRequired: boolean;
    tachographRequired: boolean;
    specifications: string[];
  };
}

export interface BreakRule {
  afterHours: number;
  duration: number;
  type: 'rest' | 'meal' | 'sleep';
}

export interface RestPeriod {
  type: 'daily' | 'weekly';
  duration: number;
  consecutive: boolean;
}

export interface TaxConfiguration {
  vatRate: number;
  fuelTax: number;
  roadTax: number;
  invoiceFormat: 'EU_VAT' | 'MEXICO_SAT' | 'US_STANDARD';
  digitalInvoicing: boolean;
  crossBorderTax: number;
}

export interface PrivacyConfiguration {
  gdprCompliant: boolean;
  dataRetention: number; // days
  consentRequired: boolean;
  rightToForgotten: boolean;
  dataLocalization: boolean;
  auditLogging: boolean;
}

export class InternationalComplianceEngine {
  private regions: Map<string, ComplianceRegion> = new Map();
  private currentRegion: string = 'US';

  constructor() {
    this.initializeRegions();
  }

  private initializeRegions() {
    // United States (baseline)
    this.regions.set('US', {
      code: 'US',
      name: 'United States',
      currency: 'USD',
      language: 'en-US',
      timezone: 'America/New_York',
      regulations: {
        drivingHours: {
          dailyLimit: 11,
          weeklyLimit: 70,
          mandatoryBreaks: [
            { afterHours: 8, duration: 30, type: 'rest' }
          ],
          restPeriods: [
            { type: 'daily', duration: 10, consecutive: true },
            { type: 'weekly', duration: 34, consecutive: true }
          ]
        },
        documentation: {
          required: ['DVIR', 'Bills of Lading', 'Hours of Service'],
          digitalFormats: ['ELD', 'AOBRD'],
          retention: 180
        },
        crossBorder: {
          allowed: true,
          permits: ['USDOT', 'MC Authority']
        },
        equipment: {
          eldRequired: true,
          tachographRequired: false,
          specifications: ['FMCSA ELD Standard']
        }
      },
      taxRules: {
        vatRate: 0,
        fuelTax: 0.184,
        roadTax: 0,
        invoiceFormat: 'US_STANDARD',
        digitalInvoicing: false,
        crossBorderTax: 0
      },
      dataPrivacy: {
        gdprCompliant: false,
        dataRetention: 1095,
        consentRequired: false,
        rightToForgotten: false,
        dataLocalization: false,
        auditLogging: true
      }
    });

    // Mexico
    this.regions.set('MX', {
      code: 'MX',
      name: 'Mexico',
      currency: 'MXN',
      language: 'es-MX',
      timezone: 'America/Mexico_City',
      regulations: {
        drivingHours: {
          dailyLimit: 8,
          weeklyLimit: 48,
          mandatoryBreaks: [
            { afterHours: 4, duration: 30, type: 'rest' },
            { afterHours: 8, duration: 60, type: 'meal' }
          ],
          restPeriods: [
            { type: 'daily', duration: 8, consecutive: true },
            { type: 'weekly', duration: 24, consecutive: true }
          ]
        },
        documentation: {
          required: ['Carta Porte', 'Licencia Federal', 'Tarjeta Circulacion'],
          digitalFormats: ['CFDI 4.0', 'Complemento Carta Porte'],
          retention: 1460 // 4 years for SAT
        },
        crossBorder: {
          allowed: true,
          permits: ['SCT Permit', 'CAAT Authorization']
        },
        equipment: {
          eldRequired: false,
          tachographRequired: false,
          specifications: ['NOM-087 Compliance']
        }
      },
      taxRules: {
        vatRate: 16,
        fuelTax: 0.15,
        roadTax: 0.02,
        invoiceFormat: 'MEXICO_SAT',
        digitalInvoicing: true,
        crossBorderTax: 0.05
      },
      dataPrivacy: {
        gdprCompliant: false,
        dataRetention: 730,
        consentRequired: true,
        rightToForgotten: false,
        dataLocalization: true,
        auditLogging: true
      }
    });

    // Germany (EU baseline)
    this.regions.set('DE', {
      code: 'DE',
      name: 'Germany',
      currency: 'EUR',
      language: 'de-DE',
      timezone: 'Europe/Berlin',
      regulations: {
        drivingHours: {
          dailyLimit: 9,
          weeklyLimit: 56,
          mandatoryBreaks: [
            { afterHours: 4.5, duration: 45, type: 'rest' }
          ],
          restPeriods: [
            { type: 'daily', duration: 11, consecutive: true },
            { type: 'weekly', duration: 45, consecutive: true }
          ]
        },
        documentation: {
          required: ['CMR', 'Tachograph Data', 'Driver Certificate'],
          digitalFormats: ['Digital Tachograph', 'e-CMR'],
          retention: 1095
        },
        crossBorder: {
          allowed: true,
          cabotageLimit: 3,
          permits: ['EU License', 'Community Authorization']
        },
        equipment: {
          eldRequired: false,
          tachographRequired: true,
          specifications: ['EU Regulation 165/2014']
        }
      },
      taxRules: {
        vatRate: 19,
        fuelTax: 0.47,
        roadTax: 0.08,
        invoiceFormat: 'EU_VAT',
        digitalInvoicing: true,
        crossBorderTax: 0
      },
      dataPrivacy: {
        gdprCompliant: true,
        dataRetention: 730,
        consentRequired: true,
        rightToForgotten: true,
        dataLocalization: true,
        auditLogging: true
      }
    });

    // France
    this.regions.set('FR', {
      code: 'FR',
      name: 'France',
      currency: 'EUR',
      language: 'fr-FR',
      timezone: 'Europe/Paris',
      regulations: {
        drivingHours: {
          dailyLimit: 9,
          weeklyLimit: 56,
          mandatoryBreaks: [
            { afterHours: 4.5, duration: 45, type: 'rest' }
          ],
          restPeriods: [
            { type: 'daily', duration: 11, consecutive: true },
            { type: 'weekly', duration: 45, consecutive: true }
          ]
        },
        documentation: {
          required: ['CMR', 'Tachograph Data', 'Attestation Conducteur'],
          digitalFormats: ['Chronotachygraphe Numérique'],
          retention: 1095
        },
        crossBorder: {
          allowed: true,
          cabotageLimit: 3,
          permits: ['Licence Communautaire']
        },
        equipment: {
          eldRequired: false,
          tachographRequired: true,
          specifications: ['Règlement UE 165/2014']
        }
      },
      taxRules: {
        vatRate: 20,
        fuelTax: 0.59,
        roadTax: 0.15,
        invoiceFormat: 'EU_VAT',
        digitalInvoicing: true,
        crossBorderTax: 0
      },
      dataPrivacy: {
        gdprCompliant: true,
        dataRetention: 730,
        consentRequired: true,
        rightToForgotten: true,
        dataLocalization: true,
        auditLogging: true
      }
    });

    // Spain
    this.regions.set('ES', {
      code: 'ES',
      name: 'Spain',
      currency: 'EUR',
      language: 'es-ES',
      timezone: 'Europe/Madrid',
      regulations: {
        drivingHours: {
          dailyLimit: 9,
          weeklyLimit: 56,
          mandatoryBreaks: [
            { afterHours: 4.5, duration: 45, type: 'rest' }
          ],
          restPeriods: [
            { type: 'daily', duration: 11, consecutive: true },
            { type: 'weekly', duration: 45, consecutive: true }
          ]
        },
        documentation: {
          required: ['CMR', 'Tacógrafo Digital', 'CAP Conductor'],
          digitalFormats: ['Tacógrafo Digital', 'e-CMR'],
          retention: 1095
        },
        crossBorder: {
          allowed: true,
          cabotageLimit: 3,
          permits: ['Licencia Comunitaria']
        },
        equipment: {
          eldRequired: false,
          tachographRequired: true,
          specifications: ['Reglamento UE 165/2014']
        }
      },
      taxRules: {
        vatRate: 21,
        fuelTax: 0.307,
        roadTax: 0.12,
        invoiceFormat: 'EU_VAT',
        digitalInvoicing: true,
        crossBorderTax: 0
      },
      dataPrivacy: {
        gdprCompliant: true,
        dataRetention: 730,
        consentRequired: true,
        rightToForgotten: true,
        dataLocalization: true,
        auditLogging: true
      }
    });

    // Poland
    this.regions.set('PL', {
      code: 'PL',
      name: 'Poland',
      currency: 'PLN',
      language: 'pl-PL',
      timezone: 'Europe/Warsaw',
      regulations: {
        drivingHours: {
          dailyLimit: 9,
          weeklyLimit: 56,
          mandatoryBreaks: [
            { afterHours: 4.5, duration: 45, type: 'rest' }
          ],
          restPeriods: [
            { type: 'daily', duration: 11, consecutive: true },
            { type: 'weekly', duration: 45, consecutive: true }
          ]
        },
        documentation: {
          required: ['CMR', 'Tachograf Cyfrowy', 'Świadectwo Kompetencji'],
          digitalFormats: ['Tachograf Cyfrowy'],
          retention: 1095
        },
        crossBorder: {
          allowed: true,
          cabotageLimit: 3,
          permits: ['Licencja Wspólnotowa']
        },
        equipment: {
          eldRequired: false,
          tachographRequired: true,
          specifications: ['Rozporządzenie UE 165/2014']
        }
      },
      taxRules: {
        vatRate: 23,
        fuelTax: 0.41,
        roadTax: 0.06,
        invoiceFormat: 'EU_VAT',
        digitalInvoicing: true,
        crossBorderTax: 0
      },
      dataPrivacy: {
        gdprCompliant: true,
        dataRetention: 730,
        consentRequired: true,
        rightToForgotten: true,
        dataLocalization: true,
        auditLogging: true
      }
    });

    // Netherlands
    this.regions.set('NL', {
      code: 'NL',
      name: 'Netherlands',
      currency: 'EUR',
      language: 'nl-NL',
      timezone: 'Europe/Amsterdam',
      regulations: {
        drivingHours: {
          dailyLimit: 9,
          weeklyLimit: 56,
          mandatoryBreaks: [
            { afterHours: 4.5, duration: 45, type: 'rest' }
          ],
          restPeriods: [
            { type: 'daily', duration: 11, consecutive: true },
            { type: 'weekly', duration: 45, consecutive: true }
          ]
        },
        documentation: {
          required: ['CMR', 'Digitale Tachograaf', 'Getuigschrift Vakbekwaamheid'],
          digitalFormats: ['Digitale Tachograaf'],
          retention: 1095
        },
        crossBorder: {
          allowed: true,
          cabotageLimit: 3,
          permits: ['Communautaire Vergunning']
        },
        equipment: {
          eldRequired: false,
          tachographRequired: true,
          specifications: ['EU Verordening 165/2014']
        }
      },
      taxRules: {
        vatRate: 21,
        fuelTax: 0.48,
        roadTax: 0.18,
        invoiceFormat: 'EU_VAT',
        digitalInvoicing: true,
        crossBorderTax: 0
      },
      dataPrivacy: {
        gdprCompliant: true,
        dataRetention: 730,
        consentRequired: true,
        rightToForgotten: true,
        dataLocalization: true,
        auditLogging: true
      }
    });
  }

  setRegion(regionCode: string): boolean {
    if (this.regions.has(regionCode)) {
      this.currentRegion = regionCode;
      return true;
    }
    return false;
  }

  getCurrentRegion(): ComplianceRegion | undefined {
    return this.regions.get(this.currentRegion);
  }

  getAllRegions(): ComplianceRegion[] {
    return Array.from(this.regions.values());
  }

  validateComplianceForRoute(route: any, driverHours: number): {
    compliant: boolean;
    violations: string[];
    recommendations: string[];
  } {
    const region = this.getCurrentRegion();
    if (!region) {
      return {
        compliant: false,
        violations: ['Invalid region configuration'],
        recommendations: ['Set valid operating region']
      };
    }

    const violations: string[] = [];
    const recommendations: string[] = [];

    // Check driving hours compliance
    if (driverHours > region.regulations.drivingHours.dailyLimit) {
      violations.push(`Exceeds daily driving limit of ${region.regulations.drivingHours.dailyLimit} hours`);
      recommendations.push('Schedule mandatory rest period');
    }

    // Check break requirements
    for (const breakRule of region.regulations.drivingHours.mandatoryBreaks) {
      if (driverHours >= breakRule.afterHours) {
        recommendations.push(`${breakRule.duration} minute ${breakRule.type} break required after ${breakRule.afterHours} hours`);
      }
    }

    // Check cross-border requirements
    if (route.crossBorder && !region.regulations.crossBorder.allowed) {
      violations.push('Cross-border transport not permitted in this region');
    }

    return {
      compliant: violations.length === 0,
      violations,
      recommendations
    };
  }

  generateInvoice(loadData: any, amount: number): {
    invoiceNumber: string;
    format: string;
    taxAmount: number;
    totalAmount: number;
    documentStructure: any;
  } {
    const region = this.getCurrentRegion();
    if (!region) {
      throw new Error('Invalid region for invoice generation');
    }

    const taxAmount = amount * (region.taxRules.vatRate / 100);
    const totalAmount = amount + taxAmount;
    const invoiceNumber = this.generateInvoiceNumber(region.code);

    let documentStructure = {};

    switch (region.taxRules.invoiceFormat) {
      case 'MEXICO_SAT':
        documentStructure = {
          cfdi: {
            version: '4.0',
            folio: invoiceNumber,
            fecha: new Date().toISOString(),
            formaPago: '99', // Por definir
            metodoPago: 'PPD', // Pago en parcialidades o diferido
            tipoDeComprobante: 'I', // Ingreso
            emisor: {
              rfc: 'COMPANY_RFC',
              nombre: 'Company Name'
            },
            receptor: {
              rfc: loadData.customerRFC || 'XAXX010101000',
              nombre: loadData.customerName,
              usoCFDI: 'G03' // Gastos en general
            },
            conceptos: [{
              cantidad: 1,
              claveProdServ: '78101800', // Servicios de transporte
              descripcion: `Transporte de carga: ${loadData.origin} - ${loadData.destination}`,
              valorUnitario: amount,
              importe: amount
            }],
            impuestos: {
              totalImpuestosTrasladados: taxAmount,
              traslados: [{
                impuesto: '002', // IVA
                tipoFactor: 'Tasa',
                tasaOCuota: region.taxRules.vatRate / 100,
                importe: taxAmount
              }]
            }
          }
        };
        break;

      case 'EU_VAT':
        documentStructure = {
          invoice: {
            number: invoiceNumber,
            date: new Date().toISOString().split('T')[0],
            currency: region.currency,
            supplier: {
              name: 'Company Name',
              vatNumber: 'EU_VAT_NUMBER',
              address: 'Company Address'
            },
            customer: {
              name: loadData.customerName,
              vatNumber: loadData.customerVAT,
              address: loadData.customerAddress
            },
            items: [{
              description: `Transport service: ${loadData.origin} - ${loadData.destination}`,
              quantity: 1,
              unitPrice: amount,
              vatRate: region.taxRules.vatRate,
              vatAmount: taxAmount,
              totalAmount: totalAmount
            }],
            totals: {
              subtotal: amount,
              vatTotal: taxAmount,
              grandTotal: totalAmount
            }
          }
        };
        break;

      default:
        documentStructure = {
          invoice: {
            number: invoiceNumber,
            date: new Date().toISOString().split('T')[0],
            amount: amount,
            tax: taxAmount,
            total: totalAmount,
            description: `Transport service: ${loadData.origin} - ${loadData.destination}`
          }
        };
    }

    return {
      invoiceNumber,
      format: region.taxRules.invoiceFormat,
      taxAmount,
      totalAmount,
      documentStructure
    };
  }

  private generateInvoiceNumber(regionCode: string): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${regionCode}-${timestamp}-${random}`;
  }

  getDataPrivacyRequirements(): PrivacyConfiguration {
    const region = this.getCurrentRegion();
    return region?.dataPrivacy || {
      gdprCompliant: false,
      dataRetention: 365,
      consentRequired: false,
      rightToForgotten: false,
      dataLocalization: false,
      auditLogging: false
    };
  }

  validateGDPRCompliance(userData: any): {
    compliant: boolean;
    requiredActions: string[];
  } {
    const privacy = this.getDataPrivacyRequirements();
    const requiredActions: string[] = [];

    if (privacy.gdprCompliant) {
      if (privacy.consentRequired && !userData.consentGiven) {
        requiredActions.push('Obtain explicit user consent for data processing');
      }

      if (privacy.dataLocalization && userData.dataLocation !== this.currentRegion) {
        requiredActions.push('Ensure data is stored within regional boundaries');
      }

      if (privacy.auditLogging && !userData.auditTrail) {
        requiredActions.push('Enable comprehensive audit logging for data access');
      }
    }

    return {
      compliant: requiredActions.length === 0,
      requiredActions
    };
  }
}

export const complianceEngine = new InternationalComplianceEngine();