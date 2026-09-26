import React, { useState, useEffect } from 'react';
import AssistantTrigger from './AssistantTrigger';
import AssistantPanel from './AssistantPanel';
import { LLMAssistantContext } from './types';

interface FloatingLLMAssistantProps {
  initialContext?: LLMAssistantContext;
  position?: 'bottom-right' | 'right' | 'bottom-left';
}

const FloatingLLMAssistant: React.FC<FloatingLLMAssistantProps> = ({
  initialContext,
  position = 'right'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState<LLMAssistantContext | undefined>(initialContext);
  const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // Detect viewport size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setViewport('mobile');
      } else if (width < 1200) {
        setViewport('tablet');
      } else {
        setViewport('desktop');
      }
    };

    handleResize(); // Initial detection
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Update context from lesson changes
  useEffect(() => {
    // This would be connected to the lesson context provider
    // For now, we'll just use the initial context
    setContext(initialContext);
  }, [initialContext]);

  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Determine final position based on viewport
  const finalPosition = viewport === 'mobile' ? 'bottom-right' : position;

  return (
    <div 
      className="floating-llm-assistant"
      role="region"
      aria-label="LLM Assistant"
      data-testid="floating-llm-assistant"
    >
      <AssistantTrigger 
        isOpen={isOpen}
        onClick={handleTriggerClick}
        position={finalPosition}
        aria-label={isOpen ? 'Close assistant' : 'Open assistant'}
      />
      
      {isOpen && (
        <AssistantPanel
          context={context}
          onClose={handleClose}
          position={finalPosition}
          viewport={viewport}
        />
      )}
    </div>
  );
};

export default FloatingLLMAssistant;