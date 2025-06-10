// 3. Real-Time Collaboration Platform for Multi-User Dispatch Operations
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';

export interface CollaborationSession {
  id: string;
  name: string;
  participants: Participant[];
  activeLoad: number | null;
  sharedView: 'dashboard' | 'map' | 'loads' | 'analytics';
  createdAt: Date;
  lastActivity: Date;
}

export interface Participant {
  id: string;
  name: string;
  role: 'dispatcher' | 'manager' | 'owner' | 'driver';
  isActive: boolean;
  cursor: { x: number; y: number } | null;
  currentAction: string | null;
  joinedAt: Date;
}

export interface RealtimeUpdate {
  type: 'cursor_move' | 'load_update' | 'driver_status' | 'user_action' | 'system_alert';
  sessionId: string;
  userId: string;
  data: any;
  timestamp: Date;
}

export interface SharedAnnotation {
  id: string;
  sessionId: string;
  userId: string;
  type: 'note' | 'highlight' | 'decision' | 'concern';
  position: { x: number; y: number };
  content: string;
  attachedTo: 'load' | 'driver' | 'route' | 'general';
  entityId: string | null;
  createdAt: Date;
  resolved: boolean;
}

export class RealtimeCollaboration {
  private sessions: Map<string, CollaborationSession> = new Map();
  private connections: Map<string, WebSocket> = new Map();
  private annotations: Map<string, SharedAnnotation> = new Map();
  private wss: WebSocketServer | null = null;

  constructor() {
    this.initializeCollaboration();
    this.createDemoSession();
  }

  private initializeCollaboration() {
    // WebSocket server will be integrated with main server
    console.log('Collaboration system initialized');
  }

  private createDemoSession() {
    const demoSession: CollaborationSession = {
      id: `session_${Date.now()}`,
      name: "Morning Dispatch Coordination",
      participants: [
        {
          id: "user_1",
          name: "Sarah Chen",
          role: "manager",
          isActive: true,
          cursor: { x: 450, y: 320 },
          currentAction: "Reviewing load assignments",
          joinedAt: new Date(Date.now() - 1800000) // 30 minutes ago
        },
        {
          id: "user_2",
          name: "Mike Rodriguez",
          role: "dispatcher",
          isActive: true,
          cursor: { x: 680, y: 150 },
          currentAction: "Optimizing routes",
          joinedAt: new Date(Date.now() - 900000) // 15 minutes ago
        }
      ],
      activeLoad: 1,
      sharedView: 'loads',
      createdAt: new Date(Date.now() - 1800000),
      lastActivity: new Date()
    };

    this.sessions.set(demoSession.id, demoSession);
    this.createDemoAnnotations(demoSession.id);
  }

  private createDemoAnnotations(sessionId: string) {
    const annotations: SharedAnnotation[] = [
      {
        id: `annotation_${Date.now()}_1`,
        sessionId,
        userId: "user_1",
        type: "concern",
        position: { x: 400, y: 200 },
        content: "Weather alert for this route - consider alternative",
        attachedTo: "load",
        entityId: "1",
        createdAt: new Date(Date.now() - 600000),
        resolved: false
      },
      {
        id: `annotation_${Date.now()}_2`,
        sessionId,
        userId: "user_2",
        type: "decision",
        position: { x: 600, y: 350 },
        content: "Assigned to Driver Johnson - high performance rating",
        attachedTo: "driver",
        entityId: "1",
        createdAt: new Date(Date.now() - 300000),
        resolved: true
      }
    ];

    annotations.forEach(annotation => 
      this.annotations.set(annotation.id, annotation)
    );
  }

  setupWebSocketServer(server: any) {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws: WebSocket, request) => {
      const userId = this.extractUserIdFromRequest(request);
      this.connections.set(userId, ws);

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        this.handleRealtimeMessage(userId, message);
      });

      ws.on('close', () => {
        this.handleUserDisconnect(userId);
        this.connections.delete(userId);
      });

      // Send initial session data
      this.sendSessionUpdate(userId);
    });
  }

  private extractUserIdFromRequest(request: any): string {
    // Extract user ID from request headers or query params
    return `user_${Date.now()}`;
  }

  private handleRealtimeMessage(userId: string, message: any) {
    switch (message.type) {
      case 'cursor_move':
        this.handleCursorMove(userId, message.data);
        break;
      case 'join_session':
        this.handleJoinSession(userId, message.sessionId);
        break;
      case 'create_annotation':
        this.handleCreateAnnotation(userId, message.data);
        break;
      case 'resolve_annotation':
        this.handleResolveAnnotation(userId, message.annotationId);
        break;
      case 'change_view':
        this.handleViewChange(userId, message.sessionId, message.view);
        break;
      case 'load_action':
        this.handleLoadAction(userId, message.data);
        break;
    }
  }

  private handleCursorMove(userId: string, data: { x: number; y: number; sessionId: string }) {
    const session = this.sessions.get(data.sessionId);
    if (session) {
      const participant = session.participants.find(p => p.id === userId);
      if (participant) {
        participant.cursor = { x: data.x, y: data.y };
        this.broadcastToSession(data.sessionId, {
          type: 'cursor_update',
          userId,
          cursor: participant.cursor
        });
      }
    }
  }

  private handleJoinSession(userId: string, sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (session) {
      const existingParticipant = session.participants.find(p => p.id === userId);
      if (!existingParticipant) {
        const newParticipant: Participant = {
          id: userId,
          name: `User ${userId.slice(-4)}`,
          role: 'dispatcher',
          isActive: true,
          cursor: null,
          currentAction: null,
          joinedAt: new Date()
        };
        session.participants.push(newParticipant);
      } else {
        existingParticipant.isActive = true;
      }

      session.lastActivity = new Date();
      this.broadcastToSession(sessionId, {
        type: 'participant_joined',
        participant: session.participants.find(p => p.id === userId)
      });
    }
  }

  private handleCreateAnnotation(userId: string, data: any) {
    const annotation: SharedAnnotation = {
      id: `annotation_${Date.now()}`,
      sessionId: data.sessionId,
      userId,
      type: data.type,
      position: data.position,
      content: data.content,
      attachedTo: data.attachedTo,
      entityId: data.entityId,
      createdAt: new Date(),
      resolved: false
    };

    this.annotations.set(annotation.id, annotation);
    this.broadcastToSession(data.sessionId, {
      type: 'annotation_created',
      annotation
    });
  }

  private handleResolveAnnotation(userId: string, annotationId: string) {
    const annotation = this.annotations.get(annotationId);
    if (annotation) {
      annotation.resolved = true;
      this.broadcastToSession(annotation.sessionId, {
        type: 'annotation_resolved',
        annotationId,
        resolvedBy: userId
      });
    }
  }

  private handleViewChange(userId: string, sessionId: string, view: string) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.sharedView = view as any;
      session.lastActivity = new Date();
      this.broadcastToSession(sessionId, {
        type: 'view_changed',
        view,
        changedBy: userId
      });
    }
  }

  private handleLoadAction(userId: string, data: any) {
    // Handle collaborative load management actions
    this.broadcastToSession(data.sessionId, {
      type: 'load_action',
      action: data.action,
      loadId: data.loadId,
      userId,
      timestamp: new Date()
    });
  }

  private handleUserDisconnect(userId: string) {
    // Mark user as inactive in all sessions
    for (const session of this.sessions.values()) {
      const participant = session.participants.find(p => p.id === userId);
      if (participant) {
        participant.isActive = false;
        this.broadcastToSession(session.id, {
          type: 'participant_left',
          userId
        });
      }
    }
  }

  private broadcastToSession(sessionId: string, message: any) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.participants.forEach(participant => {
        if (participant.isActive) {
          const connection = this.connections.get(participant.id);
          if (connection && connection.readyState === WebSocket.OPEN) {
            connection.send(JSON.stringify({
              ...message,
              sessionId,
              timestamp: new Date()
            }));
          }
        }
      });
    }
  }

  private sendSessionUpdate(userId: string) {
    const connection = this.connections.get(userId);
    if (connection && connection.readyState === WebSocket.OPEN) {
      // Find sessions user is part of
      const userSessions = Array.from(this.sessions.values())
        .filter(session => 
          session.participants.some(p => p.id === userId)
        );

      connection.send(JSON.stringify({
        type: 'session_update',
        sessions: userSessions,
        annotations: Array.from(this.annotations.values())
          .filter(a => userSessions.some(s => s.id === a.sessionId))
      }));
    }
  }

  async createSession(name: string, creatorId: string): Promise<CollaborationSession> {
    const session: CollaborationSession = {
      id: `session_${Date.now()}`,
      name,
      participants: [{
        id: creatorId,
        name: `User ${creatorId.slice(-4)}`,
        role: 'manager',
        isActive: true,
        cursor: null,
        currentAction: 'Creating session',
        joinedAt: new Date()
      }],
      activeLoad: null,
      sharedView: 'dashboard',
      createdAt: new Date(),
      lastActivity: new Date()
    };

    this.sessions.set(session.id, session);
    return session;
  }

  async inviteToSession(sessionId: string, userId: string, role: Participant['role']): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (session && !session.participants.some(p => p.id === userId)) {
      const participant: Participant = {
        id: userId,
        name: `User ${userId.slice(-4)}`,
        role,
        isActive: false,
        cursor: null,
        currentAction: null,
        joinedAt: new Date()
      };

      session.participants.push(participant);
      
      // Send invitation notification
      const connection = this.connections.get(userId);
      if (connection) {
        connection.send(JSON.stringify({
          type: 'session_invitation',
          sessionId,
          sessionName: session.name,
          invitedBy: 'system'
        }));
      }

      return true;
    }
    return false;
  }

  getActiveSessions(): CollaborationSession[] {
    return Array.from(this.sessions.values())
      .filter(session => 
        session.participants.some(p => p.isActive) &&
        Date.now() - session.lastActivity.getTime() < 3600000 // Active in last hour
      );
  }

  getSessionAnnotations(sessionId: string): SharedAnnotation[] {
    return Array.from(this.annotations.values())
      .filter(annotation => annotation.sessionId === sessionId);
  }

  async getSessionById(sessionId: string): Promise<CollaborationSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  async updateParticipantAction(userId: string, sessionId: string, action: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      const participant = session.participants.find(p => p.id === userId);
      if (participant) {
        participant.currentAction = action;
        this.broadcastToSession(sessionId, {
          type: 'participant_action_update',
          userId,
          action
        });
      }
    }
  }

  getCollaborationMetrics(): {
    activeSessions: number;
    totalParticipants: number;
    averageSessionDuration: number;
    annotationsCreated: number;
  } {
    const activeSessions = this.getActiveSessions();
    const totalParticipants = activeSessions.reduce(
      (sum, session) => sum + session.participants.filter(p => p.isActive).length, 
      0
    );

    return {
      activeSessions: activeSessions.length,
      totalParticipants,
      averageSessionDuration: 45, // minutes
      annotationsCreated: this.annotations.size
    };
  }
}

export const collaborationManager = new RealtimeCollaboration();