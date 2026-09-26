export interface LLMAssistantContext {
  lessonId?: string;
  lessonTitle?: string;
  lessonObjective?: string;
  domain?: string;
}

export interface LLMQuery {
  id: string;
  text: string;
  timestamp: Date;
  response?: LLMResponse;
  isCached: boolean;
}

export interface LLMResponse {
  id: string;
  text: string;
  timestamp: Date;
  audioUrl?: string;
}

export interface AssistantState {
  isOpen: boolean;
  isRecording: boolean;
  isPlaying: boolean;
  currentQuery?: LLMQuery;
  queries: LLMQuery[];
}

export type ViewportSize = 'mobile' | 'tablet' | 'desktop';

export interface Position {
  x: number;
  y: number;
}

export interface FloatingAssistantConfig {
  position: 'bottom-right' | 'right' | 'bottom-left';
  triggerSize: number;
  panelSize: {
    width: number;
    height: number;
  };
}