// CBT Therapy API Types

export interface CBTMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  protocol?: string;
  diagnosis?: string[];
  persona?: string;
  createdAt: Date;
}

export interface CBTConversation {
  id: string;
  userId: string;
  sessionId?: string;
  persona: string;
  messages: CBTMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export type CBTPersona =
  | 'active_listener'
  | 'socratic_questioner'
  | 'compassionate_guide'
  | 'cognitive_coach'
  | 'mindfulness_teacher'
  | 'behavioral_strategist'
  | 'emotion_validator'
  | 'solution_focused'
  | 'trauma_informed'
  | 'motivational_interviewer'
  | 'acceptance_commitment'
  | 'dialectical_balance';

export type CBTTone =
  | 'empathetic'
  | 'supportive'
  | 'direct'
  | 'gentle'
  | 'encouraging'
  | 'professional'
  | 'warm'
  | 'calm'
  | 'motivational'
  | 'understanding'
  | 'reassuring'
  | 'balanced';
