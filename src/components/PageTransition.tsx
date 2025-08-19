import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export const PageTransition = ({ children, className = "" }: PageTransitionProps) => {
  return (
    <div className={`animate-fade-in-up ${className}`}>
      {children}
    </div>
  );
};

export const StaggeredList = ({ children, className = "" }: PageTransitionProps) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.isArray(children) 
        ? children.map((child, index) => (
            <div key={index} className="stagger-animation" style={{ animationDelay: `${index * 0.1}s` }}>
              {child}
            </div>
          ))
        : <div className="stagger-animation">{children}</div>
      }
    </div>
  );
};

export const FadeInSection = ({ children, className = "", delay = 0 }: PageTransitionProps & { delay?: number }) => {
  return (
    <div 
      className={`animate-fade-in ${className}`} 
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};