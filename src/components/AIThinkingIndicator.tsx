import { useState, useEffect } from "react";
import { Brain, Cpu } from "lucide-react";

interface AIThinkingIndicatorProps {
  isActive: boolean;
  isSelectingQuestion: boolean;
  isAnswering: boolean;
}

export const AIThinkingIndicator = ({ 
  isActive, 
  isSelectingQuestion, 
  isAnswering 
}: AIThinkingIndicatorProps) => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (isActive && (isSelectingQuestion || isAnswering)) {
      const interval = setInterval(() => {
        setDots(prev => {
          if (prev === "...") return "";
          return prev + ".";
        });
      }, 500);

      return () => clearInterval(interval);
    } else {
      setDots("");
    }
  }, [isActive, isSelectingQuestion, isAnswering]);

  if (!isActive || (!isSelectingQuestion && !isAnswering)) {
    return null;
  }

  const getMessage = () => {
    if (isSelectingQuestion) return "AI is selecting a question";
    if (isAnswering) return "AI is analyzing the answer";
    return "AI is thinking";
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20 rounded-lg p-4 shadow-md">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Cpu className="h-5 w-5 text-blue-400 animate-pulse" />
          <span className="text-lg font-medium text-foreground">
            Computer Turn
          </span>
          <Brain className="h-5 w-5 text-purple-400 animate-pulse" />
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-sm text-muted-foreground">
              {getMessage()}{dots}
            </span>
          </div>
          
          <div className="text-xs text-blue-400 font-medium">
            Please wait...
          </div>
        </div>
        
        {/* Animated thinking dots */}
        <div className="flex justify-center space-x-1 mt-3">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};