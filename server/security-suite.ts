import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { storage } from './storage';

export interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: 'login_attempt' | 'data_access' | 'api_call' | 'file_access' | 'suspicious_activity' | 'breach_attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: number;
  ipAddress: string;
  userAgent: string;
  details: {
    action: string;
    resource: string;
    success: boolean;
    failureReason?: string;
    riskScore: number;
  };
  geolocation?: {
    country: string;
    region: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  blocked: boolean;
  resolved: boolean;
}

export interface ThreatDetection {
  id: string;
  timestamp: Date;
  threatType: 'malware' | 'phishing' | 'brute_force' | 'data_exfiltration' | 'insider_threat' | 'ddos';
  confidence: number;
  indicators: string[];
  affectedSystems: string[];
  recommendations: string[];
  automaticResponse: string[];
  status: 'active' | 'investigating' | 'contained' | 'resolved';
}

export interface ComplianceCheck {
  id: string;
  regulation: 'GDPR' | 'CCPA' | 'HIPAA' | 'SOX' | 'PCI_DSS' | 'FMCSA' | 'DOT';
  checkType: 'data_retention' | 'access_control' | 'audit_trail' | 'encryption' | 'backup' | 'incident_response';
  status: 'compliant' | 'non_compliant' | 'partial' | 'review_needed';
  lastChecked: Date;
  nextCheck: Date;
  findings: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    remediation: string;
    deadline: Date;
  }>;
  evidence: string[];
}

export interface DataEncryption {
  id: string;
  dataType: 'customer_data' | 'financial' | 'driver_records' | 'load_details' | 'communications';
  encryptionMethod: 'AES-256' | 'RSA-2048' | 'ChaCha20' | 'Elliptic_Curve';
  keyRotationSchedule: string;
  lastRotation: Date;
  nextRotation: Date;
  backupStrategy: string;
  accessLevel: 'public' | 'internal' | 'confidential' | 'restricted';
}

export class SecuritySuiteService {
  private securityEvents: Map<string, SecurityEvent> = new Map();
  private threatDetections: Map<string, ThreatDetection> = new Map();
  private complianceChecks: Map<string, ComplianceCheck> = new Map();
  private dataEncryption: Map<string, DataEncryption> = new Map();
  private encryptionKey: Buffer;

  constructor() {
    this.encryptionKey = this.generateEncryptionKey();
    this.initializeComplianceFramework();
    this.initializeDataEncryption();
    this.startSecurityMonitoring();
  }

  private generateEncryptionKey(): Buffer {
    return randomBytes(32); // 256-bit key for AES-256
  }

  private initializeComplianceFramework() {
    const regulations = ['GDPR', 'CCPA', 'FMCSA', 'DOT'];
    const checkTypes = ['data_retention', 'access_control', 'audit_trail', 'encryption'];

    regulations.forEach(regulation => {
      checkTypes.forEach(checkType => {
        const check: ComplianceCheck = {
          id: this.generateComplianceId(),
          regulation: regulation as any,
          checkType: checkType as any,
          status: 'compliant',
          lastChecked: new Date(),
          nextCheck: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          findings: [],
          evidence: []
        };
        this.complianceChecks.set(check.id, check);
      });
    });
  }

  private initializeDataEncryption() {
    const dataTypes = ['customer_data', 'financial', 'driver_records', 'load_details', 'communications'];
    
    dataTypes.forEach(dataType => {
      const encryption: DataEncryption = {
        id: this.generateEncryptionId(),
        dataType: dataType as any,
        encryptionMethod: 'AES-256',
        keyRotationSchedule: 'monthly',
        lastRotation: new Date(),
        nextRotation: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        backupStrategy: 'encrypted_offsite_backup',
        accessLevel: dataType === 'financial' ? 'restricted' : 'confidential'
      };
      this.dataEncryption.set(encryption.id, encryption);
    });
  }

  private startSecurityMonitoring() {
    setInterval(() => {
      this.performThreatScanning();
      this.runComplianceChecks();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  async logSecurityEvent(
    type: SecurityEvent['type'],
    userId: number | undefined,
    ipAddress: string,
    userAgent: string,
    action: string,
    resource: string,
    success: boolean,
    details: any = {}
  ): Promise<SecurityEvent> {
    const riskScore = this.calculateRiskScore(type, action, success, ipAddress);
    const severity = this.determineSeverity(riskScore, type);
    
    const event: SecurityEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      type,
      severity,
      userId,
      ipAddress,
      userAgent,
      details: {
        action,
        resource,
        success,
        failureReason: success ? undefined : details.failureReason,
        riskScore
      },
      geolocation: await this.getGeolocation(ipAddress),
      blocked: riskScore > 80,
      resolved: false
    };

    this.securityEvents.set(event.id, event);

    // Trigger automatic response for high-risk events
    if (event.blocked || event.severity === 'critical') {
      await this.handleHighRiskEvent(event);
    }

    return event;
  }

  private calculateRiskScore(
    type: SecurityEvent['type'], 
    action: string, 
    success: boolean, 
    ipAddress: string
  ): number {
    let score = 0;

    // Base scores by event type
    const typeScores = {
      login_attempt: success ? 10 : 40,
      data_access: 20,
      api_call: 15,
      file_access: 25,
      suspicious_activity: 70,
      breach_attempt: 90
    };

    score += typeScores[type] || 30;

    // Increase score for failed actions
    if (!success) score += 30;

    // Check for suspicious patterns
    if (this.isKnownMaliciousIP(ipAddress)) score += 50;
    if (this.hasRecentFailedAttempts(ipAddress)) score += 25;
    if (this.isOffHours()) score += 15;

    return Math.min(100, score);
  }

  private determineSeverity(riskScore: number, type: SecurityEvent['type']): SecurityEvent['severity'] {
    if (riskScore >= 80 || type === 'breach_attempt') return 'critical';
    if (riskScore >= 60 || type === 'suspicious_activity') return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }

  private async getGeolocation(ipAddress: string) {
    // Simulate geolocation lookup
    const locations = [
      { country: 'US', region: 'California', city: 'Los Angeles', latitude: 34.0522, longitude: -118.2437 },
      { country: 'US', region: 'New York', city: 'New York', latitude: 40.7128, longitude: -74.0060 },
      { country: 'US', region: 'Texas', city: 'Dallas', latitude: 32.7767, longitude: -96.7970 }
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  private isKnownMaliciousIP(ipAddress: string): boolean {
    const maliciousIPs = ['192.168.1.100', '10.0.0.1', '172.16.0.1'];
    return maliciousIPs.includes(ipAddress);
  }

  private hasRecentFailedAttempts(ipAddress: string): boolean {
    const recentEvents = Array.from(this.securityEvents.values())
      .filter(event => 
        event.ipAddress === ipAddress && 
        !event.details.success &&
        Date.now() - event.timestamp.getTime() < 60 * 60 * 1000 // Last hour
      );
    return recentEvents.length >= 3;
  }

  private isOffHours(): boolean {
    const hour = new Date().getHours();
    return hour < 6 || hour > 22; // Outside 6 AM - 10 PM
  }

  private async handleHighRiskEvent(event: SecurityEvent) {
    // Create threat detection
    const threat: ThreatDetection = {
      id: this.generateThreatId(),
      timestamp: new Date(),
      threatType: this.mapEventToThreatType(event.type),
      confidence: event.details.riskScore,
      indicators: [
        `High risk ${event.type} from ${event.ipAddress}`,
        `Risk score: ${event.details.riskScore}`,
        `Action: ${event.details.action}`
      ],
      affectedSystems: [event.details.resource],
      recommendations: this.generateThreatRecommendations(event),
      automaticResponse: this.executeAutomaticResponse(event),
      status: 'active'
    };

    this.threatDetections.set(threat.id, threat);

    // Log the automatic response
    await this.logSecurityEvent(
      'suspicious_activity',
      undefined,
      'system',
      'security_suite',
      'automatic_response',
      event.id,
      true,
      { threat_id: threat.id }
    );
  }

  private mapEventToThreatType(eventType: SecurityEvent['type']): ThreatDetection['threatType'] {
    const mapping = {
      login_attempt: 'brute_force',
      data_access: 'data_exfiltration',
      api_call: 'data_exfiltration',
      file_access: 'insider_threat',
      suspicious_activity: 'malware',
      breach_attempt: 'malware'
    };
    return mapping[eventType] || 'malware';
  }

  private generateThreatRecommendations(event: SecurityEvent): string[] {
    const recommendations = [
      'Monitor IP address for continued suspicious activity',
      'Review user access permissions',
      'Verify legitimacy of the access attempt'
    ];

    if (event.severity === 'critical') {
      recommendations.push(
        'Consider blocking IP address',
        'Notify security team immediately',
        'Initiate incident response protocol'
      );
    }

    return recommendations;
  }

  private executeAutomaticResponse(event: SecurityEvent): string[] {
    const responses = [];

    if (event.details.riskScore > 90) {
      responses.push('IP address temporarily blocked');
      responses.push('User account locked pending review');
    } else if (event.details.riskScore > 70) {
      responses.push('Additional authentication required');
      responses.push('Activity flagged for manual review');
    }

    responses.push('Security event logged and analyzed');
    return responses;
  }

  private performThreatScanning() {
    // Simulate ongoing threat detection
    if (Math.random() > 0.95) { // 5% chance of detecting a threat
      this.generateSimulatedThreat();
    }
  }

  private generateSimulatedThreat() {
    const threatTypes: ThreatDetection['threatType'][] = ['malware', 'phishing', 'brute_force'];
    const threat: ThreatDetection = {
      id: this.generateThreatId(),
      timestamp: new Date(),
      threatType: threatTypes[Math.floor(Math.random() * threatTypes.length)],
      confidence: Math.random() * 40 + 60, // 60-100% confidence
      indicators: ['Suspicious network traffic detected', 'Unusual API access patterns'],
      affectedSystems: ['web_server', 'database'],
      recommendations: ['Investigate source of traffic', 'Review access logs'],
      automaticResponse: ['Traffic monitoring increased', 'Alerts sent to security team'],
      status: 'investigating'
    };

    this.threatDetections.set(threat.id, threat);
  }

  private runComplianceChecks() {
    // Simulate compliance monitoring
    this.complianceChecks.forEach((check, id) => {
      if (Date.now() - check.lastChecked.getTime() > 24 * 60 * 60 * 1000) { // Daily checks
        this.performComplianceCheck(id);
      }
    });
  }

  private performComplianceCheck(checkId: string) {
    const check = this.complianceChecks.get(checkId);
    if (!check) return;

    // Simulate compliance verification
    const isCompliant = Math.random() > 0.1; // 90% compliance rate
    
    check.status = isCompliant ? 'compliant' : 'non_compliant';
    check.lastChecked = new Date();
    check.nextCheck = new Date(Date.now() + 24 * 60 * 60 * 1000);

    if (!isCompliant) {
      check.findings.push({
        severity: 'medium',
        description: `${check.regulation} ${check.checkType} requirements not fully met`,
        remediation: 'Review and update security policies',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    }

    this.complianceChecks.set(checkId, check);
  }

  encryptSensitiveData(data: string, dataType: string): string {
    const algorithm = 'aes-256-gcm';
    const iv = randomBytes(16);
    const cipher = createCipheriv(algorithm, this.encryptionKey, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Store encryption metadata
    const encryptionRecord = Array.from(this.dataEncryption.values())
      .find(e => e.dataType === dataType);
    
    if (encryptionRecord) {
      encryptionRecord.lastRotation = new Date();
    }

    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  decryptSensitiveData(encryptedData: string, dataType: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
    const algorithm = 'aes-256-gcm';
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = createDecipheriv(algorithm, this.encryptionKey, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  async generateSecurityReport(): Promise<{
    summary: any;
    recentEvents: SecurityEvent[];
    activeThreats: ThreatDetection[];
    complianceStatus: any;
    recommendations: string[];
  }> {
    const recentEvents = Array.from(this.securityEvents.values())
      .filter(event => Date.now() - event.timestamp.getTime() < 24 * 60 * 60 * 1000)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const activeThreats = Array.from(this.threatDetections.values())
      .filter(threat => threat.status === 'active' || threat.status === 'investigating');

    const complianceIssues = Array.from(this.complianceChecks.values())
      .filter(check => check.status === 'non_compliant');

    return {
      summary: {
        totalEvents: this.securityEvents.size,
        recentEvents: recentEvents.length,
        activeThreats: activeThreats.length,
        complianceIssues: complianceIssues.length,
        riskLevel: this.calculateOverallRiskLevel()
      },
      recentEvents: recentEvents.slice(0, 10),
      activeThreats,
      complianceStatus: {
        total: this.complianceChecks.size,
        compliant: Array.from(this.complianceChecks.values()).filter(c => c.status === 'compliant').length,
        issues: complianceIssues.length
      },
      recommendations: this.generateSecurityRecommendations()
    };
  }

  private calculateOverallRiskLevel(): 'low' | 'medium' | 'high' | 'critical' {
    const activeThreats = Array.from(this.threatDetections.values())
      .filter(t => t.status === 'active');
    
    const recentHighRiskEvents = Array.from(this.securityEvents.values())
      .filter(e => e.severity === 'high' || e.severity === 'critical')
      .filter(e => Date.now() - e.timestamp.getTime() < 24 * 60 * 60 * 1000);

    if (activeThreats.length > 5 || recentHighRiskEvents.length > 10) return 'critical';
    if (activeThreats.length > 2 || recentHighRiskEvents.length > 5) return 'high';
    if (activeThreats.length > 0 || recentHighRiskEvents.length > 2) return 'medium';
    return 'low';
  }

  private generateSecurityRecommendations(): string[] {
    return [
      'Enable multi-factor authentication for all user accounts',
      'Implement regular security awareness training',
      'Conduct quarterly penetration testing',
      'Review and update access permissions monthly',
      'Implement automated backup and recovery procedures',
      'Deploy advanced threat detection and response tools',
      'Establish incident response procedures',
      'Regular security audits and compliance reviews'
    ];
  }

  private generateEventId(): string {
    return `sec_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateThreatId(): string {
    return `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateComplianceId(): string {
    return `compliance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEncryptionId(): string {
    return `encryption_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getSecurityEvents(limit: number = 100): SecurityEvent[] {
    return Array.from(this.securityEvents.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getThreatDetections(): ThreatDetection[] {
    return Array.from(this.threatDetections.values());
  }

  getComplianceChecks(): ComplianceCheck[] {
    return Array.from(this.complianceChecks.values());
  }

  getDataEncryptionStatus(): DataEncryption[] {
    return Array.from(this.dataEncryption.values());
  }
}

export const securitySuite = new SecuritySuiteService();