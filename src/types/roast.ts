export type OvenId = 1 | 2 | 3;

export type RoastStatus = 'idle' | 'roasting' | 'completed' | 'paused';

export type RoastStage = 'cru' | 'clara' | 'quase' | 'ideal' | 'passou';

export type UserRole = 'operator' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  shift?: string;
}

export interface DetectedObject {
  class: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  timeInRoastSeconds: number;
  stage: RoastStage;
  confidence: number; // 0 - 100
  detectedObjects: DetectedObject[];
  imageUrl: string;
  ovenId: OvenId;
  operatorName: string;
  humanFeedback?: 'agreed' | 'disagreed';
  correctedStage?: RoastStage;
  roastSessionId?: string;
}

export interface RoastTimelineEvent {
  id: string;
  timestamp: string;
  type: 'started' | 'analysis' | 'alert' | 'completed' | 'note';
  title: string;
  description: string;
  stage?: RoastStage;
  analysisId?: string;
  severity?: 'info' | 'warning' | 'danger' | 'success';
}

export interface RoastSession {
  id: string;
  ovenId: OvenId;
  operatorId: string;
  operatorName: string;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  status: RoastStatus;
  targetQuantityKg?: number;
  notes?: string;
  analyses: AnalysisResult[];
  timeline: RoastTimelineEvent[];
  finalStage?: RoastStage;
}

export interface PredictiveAlert {
  id: string;
  timestamp: string;
  ovenId: OvenId;
  severity: 'info' | 'warning' | 'danger' | 'success';
  title: string;
  message: string;
  read: boolean;
  type: 'maintenance' | 'delay' | 'ideal_reached' | 'photo_reminder';
}

export interface OvenStats {
  ovenId: OvenId;
  totalRoasts: number;
  avgDurationSeconds: number;
  minDurationSeconds: number;
  maxDurationSeconds: number;
  efficiencyRating: number; // percentage
  status: RoastStatus;
  currentOperator?: string;
  isMaintenanceRequired: boolean;
  maintenanceReason?: string;
}

export interface AiModelMetrics {
  totalAnalyses: number;
  agreedCount: number;
  disagreedCount: number;
  perceivedAccuracy: number; // %
  avgConfidence: number; // %
  classDistribution: Record<RoastStage, number>;
  accuracyTrend: Array<{ date: string; accuracy: number }>;
}
