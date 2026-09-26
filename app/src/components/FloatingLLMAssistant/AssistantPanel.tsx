import React, { useState } from 'react';
import { LLMAssistantContext } from './types';

interface AssistantPanelProps {
  context?: LLMAssistantContext;
  onClose: () => void;
  position: 'bottom-right' | 'right' | 'bottom-left';
  viewport: 'mobile' | 'tablet' | 'desktop';
}

const AssistantPanel: React.FC<AssistantPanelProps> = ({
  context,
  onClose,
  position,
  viewport
}) => {
  const [query, setQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Handle query submission
    console.log('Submitting query:', query);
    setQuery('');
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    setIsRecording(true);
    // Implement speech recognition here
    setTimeout(() => {
      setIsRecording(false);
      setQuery('Hello, this is a voice input example');
    }, 2000);
  };

  // Determine panel size based on viewport
  const getPanelSize = () => {
    switch (viewport) {
      case 'mobile':
        return 'w-full h-3/4 max-h-[600px]';
      case 'tablet':
        return 'w-96 h-96';
      case 'desktop':
      default:
        return 'w-96 h-[500px]';
    }
  };

  // Determine position classes
  const getPositionClasses = () => {
    const baseClasses = 'assistant-panel fixed z-40 bg-white rounded-lg shadow-xl border border-gray-200';
    const sizeClasses = getPanelSize();
    
    switch (position) {
      case 'bottom-right':
        return `${baseClasses} ${sizeClasses} bottom-6 right-6`;
      case 'bottom-left':
        return `${baseClasses} ${sizeClasses} bottom-6 left-6`;
      case 'right':
      default:
        return `${baseClasses} ${sizeClasses} top-1/2 right-20 -translate-y-1/2`;
    }
  };

  return (
    <div 
      className={getPositionClasses()}
      role="dialog"
      aria-label="LLM Assistant Panel"
      data-testid="assistant-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">LLM Assistant</h2>
          {context?.lessonTitle && (
            <p className="text-sm text-gray-600 mt-1">
              Current lesson: {context.lessonTitle}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close assistant panel"
        >
          <span className="text-xl">×</span>
        </button>
      </div>

      {/* Context display */}
      {context && (
        <div className="p-4 bg-blue-50 border-b border-blue-100">
          <div className="text-sm text-gray-700">
            <p><strong>Lesson:</strong> {context.lessonTitle || 'No lesson selected'}</p>
            {context.lessonObjective && (
              <p className="mt-1"><strong>Objective:</strong> {context.lessonObjective}</p>
            )}
            {context.domain && (
              <p className="mt-1"><strong>Domain:</strong> {context.domain}</p>
            )}
          </div>
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="mb-4 p-3 bg-gray-100 rounded-lg">
          <p className="text-gray-700">
            Hi! I'm your DevOps learning assistant. Ask me anything about the current lesson or DevOps concepts.
          </p>
        </div>
        
        {/* Messages will be rendered here */}
        <div className="min-h-[200px]" />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about DevOps..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Question input"
            />
            {isRecording && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              </div>
            )}
          </div>
          
          <button
            type="button"
            onClick={handleVoiceInput}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            aria-label="Voice input"
            disabled={isRecording}
          >
            🎤
          </button>
          
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            aria-label="Submit question"
            disabled={!query.trim()}
          >
            Send
          </button>
        </form>
        
        <p className="text-xs text-gray-500 mt-2">
          Your questions are processed with context from the current lesson.
        </p>
      </div>
    </div>
  );
};

export default AssistantPanel;