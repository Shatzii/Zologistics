import { db } from './db';
import { eq } from 'drizzle-orm';

export interface LoadBoardConfig {
  id: string;
  name: string;
  type: 'free' | 'paid' | 'open_source';
  apiUrl: string;
  apiKey?: string;
  authMethod: 'api_key' | 'oauth' | 'basic_auth' | 'none';
  enabled: boolean;
  rateLimit: number; // requests per minute
  endpoints: {
    loads: string;
    post_load: string;
    search: string;
    authenticate?: string;
  };
  dataMapping: {
    loadId: string;
    origin: string;
    destination: string;
    rate: string;
    equipment: string;
    pickupDate: string;
    deliveryDate: string;
    contactInfo: string;
  };
  lastSync: Date;
  status: 'active' | 'error' | 'rate_limited' | 'disabled';
  errorMessage?: string;
}

export interface RealDataSource {
  id: string;
  name: string;
  type: 'load_board' | 'carrier_directory' | 'shipper_directory' | 'broker_network';
  config: LoadBoardConfig | any;
  priority: number; // 1-10, higher = more priority
  costPerRequest: number;
  successRate: number;
  lastUpdated: Date;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export class ContentManagementSystem {
  private loadBoards: Map<string, LoadBoardConfig> = new Map();
  private dataSources: Map<string, RealDataSource> = new Map();

  constructor() {
    this.initializeFreeLoadBoards();
    this.initializeOpenSourceOptions();
  }

  private initializeFreeLoadBoards() {
    // Free and open-source load board options
    const freeLoadBoards: LoadBoardConfig[] = [
      {
        id: 'freightpost',
        name: 'FreightPost (Free Tier)',
        type: 'free',
        apiUrl: 'https://api.freightpost.com/v1',
        authMethod: 'api_key',
        enabled: false, // Requires user to add API key
        rateLimit: 100,
        endpoints: {
          loads: '/loads',
          post_load: '/loads',
          search: '/loads/search'
        },
        dataMapping: {
          loadId: 'id',
          origin: 'pickup.city',
          destination: 'delivery.city',
          rate: 'rate',
          equipment: 'equipment_type',
          pickupDate: 'pickup_date',
          deliveryDate: 'delivery_date',
          contactInfo: 'contact.phone'
        },
        lastSync: new Date(),
        status: 'disabled'
      },
      {
        id: 'loadlink',
        name: 'LoadLink Free API',
        type: 'free',
        apiUrl: 'https://api.loadlink.ca/v2',
        authMethod: 'api_key',
        enabled: false,
        rateLimit: 50,
        endpoints: {
          loads: '/loads',
          post_load: '/loads',
          search: '/loads/search'
        },
        dataMapping: {
          loadId: 'load_id',
          origin: 'origin_city',
          destination: 'dest_city',
          rate: 'rate_amount',
          equipment: 'equipment',
          pickupDate: 'pickup_date',
          deliveryDate: 'delivery_date',
          contactInfo: 'broker_phone'
        },
        lastSync: new Date(),
        status: 'disabled'
      },
      {
        id: 'freight_caviar',
        name: 'Freight Caviar Open API',
        type: 'open_source',
        apiUrl: 'https://api.freightcaviar.com/public/v1',
        authMethod: 'none',
        enabled: true, // No API key required
        rateLimit: 200,
        endpoints: {
          loads: '/loads/public',
          search: '/loads/search',
          post_load: '/loads' // Requires auth for posting
        },
        dataMapping: {
          loadId: 'id',
          origin: 'pickup_location',
          destination: 'delivery_location',
          rate: 'total_rate',
          equipment: 'equipment_type',
          pickupDate: 'pickup_datetime',
          deliveryDate: 'delivery_datetime',
          contactInfo: 'contact_phone'
        },
        lastSync: new Date(),
        status: 'active'
      },
      {
        id: 'truckloads_com',
        name: 'Truckloads.com Free Tier',
        type: 'free',
        apiUrl: 'https://api.truckloads.com/v1',
        authMethod: 'api_key',
        enabled: false,
        rateLimit: 75,
        endpoints: {
          loads: '/loads',
          search: '/search/loads',
          post_load: '/post/load'
        },
        dataMapping: {
          loadId: 'load_number',
          origin: 'origin',
          destination: 'destination',
          rate: 'rate',
          equipment: 'equipment',
          pickupDate: 'pickup',
          deliveryDate: 'delivery',
          contactInfo: 'contact'
        },
        lastSync: new Date(),
        status: 'disabled'
      }
    ];

    freeLoadBoards.forEach(board => {
      this.loadBoards.set(board.id, board);
    });
  }

  private initializeOpenSourceOptions() {
    // Open source and public data sources
    const openSources: RealDataSource[] = [
      {
        id: 'fmcsa_public',
        name: 'FMCSA Public Data (Free)',
        type: 'carrier_directory',
        config: {
          apiUrl: 'https://ai.fmcsa.dot.gov/SMS/Tools/CarrierRegistration',
          method: 'scraping', // Public data scraping
          rateLimit: 10
        },
        priority: 8,
        costPerRequest: 0,
        successRate: 95,
        lastUpdated: new Date(),
        dataQuality: 'excellent'
      },
      {
        id: 'freight_news_scraper',
        name: 'Freight News & Load Posts',
        type: 'load_board',
        config: {
          sources: [
            'https://www.freightwaves.com/loads',
            'https://www.freightpost.com/free-loads',
            'https://www.123loadboard.com/find-loads'
          ],
          method: 'web_scraping',
          rateLimit: 5
        },
        priority: 6,
        costPerRequest: 0,
        successRate: 70,
        lastUpdated: new Date(),
        dataQuality: 'good'
      },
      {
        id: 'linkedin_freight',
        name: 'LinkedIn Freight Groups',
        type: 'broker_network',
        config: {
          groups: [
            'Freight Brokers & Dispatchers',
            'Trucking & Logistics Network',
            'Load Board Community'
          ],
          method: 'api_scraping',
          rateLimit: 20
        },
        priority: 7,
        costPerRequest: 0,
        successRate: 80,
        lastUpdated: new Date(),
        dataQuality: 'good'
      }
    ];

    openSources.forEach(source => {
      this.dataSources.set(source.id, source);
    });
  }

  // Content Management Methods
  public getLoadBoardConfigs(): LoadBoardConfig[] {
    return Array.from(this.loadBoards.values());
  }

  public updateLoadBoardConfig(id: string, updates: Partial<LoadBoardConfig>): boolean {
    const existing = this.loadBoards.get(id);
    if (!existing) return false;

    const updated = { ...existing, ...updates, lastSync: new Date() };
    this.loadBoards.set(id, updated);
    return true;
  }

  public addCustomLoadBoard(config: LoadBoardConfig): boolean {
    if (this.loadBoards.has(config.id)) return false;
    
    this.loadBoards.set(config.id, config);
    return true;
  }

  public enableLoadBoard(id: string, apiKey?: string): boolean {
    const board = this.loadBoards.get(id);
    if (!board) return false;

    const updates: Partial<LoadBoardConfig> = {
      enabled: true,
      status: 'active'
    };

    if (apiKey && board.authMethod === 'api_key') {
      updates.apiKey = apiKey;
    }

    return this.updateLoadBoardConfig(id, updates);
  }

  public disableLoadBoard(id: string): boolean {
    return this.updateLoadBoardConfig(id, { 
      enabled: false, 
      status: 'disabled' 
    });
  }

  // Real Data Fetching Methods
  public async fetchRealLoads(sourceId?: string): Promise<any[]> {
    const activeSources = sourceId 
      ? [this.loadBoards.get(sourceId)].filter(Boolean)
      : Array.from(this.loadBoards.values()).filter(board => board.enabled && board.status === 'active');

    const allLoads: any[] = [];

    for (const source of activeSources) {
      try {
        const loads = await this.fetchFromSource(source);
        allLoads.push(...loads);
      } catch (error) {
        console.error(`Error fetching from ${source.name}:`, error);
        this.updateLoadBoardConfig(source.id, { 
          status: 'error', 
          errorMessage: error.message 
        });
      }
    }

    return allLoads;
  }

  private async fetchFromSource(source: LoadBoardConfig): Promise<any[]> {
    if (!source.enabled || !source.apiUrl) {
      throw new Error(`Source ${source.name} is not properly configured`);
    }

    // Check rate limiting
    const now = Date.now();
    const lastSyncTime = source.lastSync.getTime();
    const timeDiff = now - lastSyncTime;
    const minInterval = (60 * 1000) / source.rateLimit; // Convert rate limit to milliseconds

    if (timeDiff < minInterval) {
      throw new Error(`Rate limit exceeded for ${source.name}`);
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'TruckFlow-AI/1.0'
    };

    if (source.authMethod === 'api_key' && source.apiKey) {
      headers['Authorization'] = `Bearer ${source.apiKey}`;
    }

    const response = await fetch(`${source.apiUrl}${source.endpoints.loads}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Update last sync time
    this.updateLoadBoardConfig(source.id, { lastSync: new Date() });

    // Transform data using mapping configuration
    return this.transformLoadData(data, source.dataMapping);
  }

  private transformLoadData(rawData: any, mapping: LoadBoardConfig['dataMapping']): any[] {
    if (!Array.isArray(rawData)) {
      rawData = rawData.loads || rawData.data || [rawData];
    }

    return rawData.map((item: any) => ({
      id: this.getNestedValue(item, mapping.loadId),
      origin: this.getNestedValue(item, mapping.origin),
      destination: this.getNestedValue(item, mapping.destination),
      rate: this.getNestedValue(item, mapping.rate),
      equipment: this.getNestedValue(item, mapping.equipment),
      pickupDate: this.getNestedValue(item, mapping.pickupDate),
      deliveryDate: this.getNestedValue(item, mapping.deliveryDate),
      contactInfo: this.getNestedValue(item, mapping.contactInfo),
      source: 'real_load_board',
      rawData: item
    }));
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Statistics and Monitoring
  public getDataSourceStats(): any {
    const stats = {
      totalSources: this.loadBoards.size,
      activeSources: 0,
      errorSources: 0,
      freeSourcesAvailable: 0,
      totalRateLimit: 0,
      lastSync: new Date(0)
    };

    this.loadBoards.forEach(board => {
      if (board.enabled && board.status === 'active') stats.activeSources++;
      if (board.status === 'error') stats.errorSources++;
      if (board.type === 'free' || board.type === 'open_source') stats.freeSourcesAvailable++;
      stats.totalRateLimit += board.rateLimit;
      if (board.lastSync > stats.lastSync) stats.lastSync = board.lastSync;
    });

    return stats;
  }
}

export const contentManagement = new ContentManagementSystem();