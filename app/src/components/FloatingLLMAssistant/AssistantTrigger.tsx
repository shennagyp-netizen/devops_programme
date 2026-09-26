import React from 'react';

interface AssistantTriggerProps {
  isOpen: boolean;
  onClick: () => void;
  position: 'bottom-right' | 'right' | 'bottom-left';
  'aria-label': string;
}

const AssistantTrigger: React.FC<AssistantTriggerProps> = ({
  isOpen,
  onClick,
  position,
  'aria-label': ariaLabel
}) => {
  // Determine CSS classes based on position
  const getPositionClasses = () => {
    const baseClasses = 'assistant-trigger fixed z-50 transition-all duration-200';
    
    switch (position) {
      case 'bottom-right':
        return `${baseClasses} bottom-6 right-6`;
      case 'bottom-left':
        return `${baseClasses} bottom-6 left-6`;
      case 'right':
      default:
        return `${baseClasses} top-1/2 right-6 -translate-y-1/2`;
    }
  };

  return (
    <button
      className={getPositionClasses()}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-expanded={isOpen}
      data-testid="assistant-trigger"
    >
      <div className="relative">
        {/* Assistant icon */}
        <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors">
          {isOpen ? (
            <span className="text-white text-xl font-bold">×</span>
          ) : (
            <span className="text-white text-xl font-bold">AI</span>
          )}
        </div>
        
        {/* Pulsing animation when not open */}
        {!isOpen && (
          <div className="absolute inset-0 border-2 border-blue-400 rounded-full animate-ping opacity-75" />
        )}
      </div>
    </button>
  );
};

export default AssistantTrigger;