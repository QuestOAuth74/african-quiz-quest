import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "elevated" | "premium";
  children: React.ReactNode;
}

export const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "bg-card shadow-soft hover:shadow-elevated",
      glass: "bg-card/80 backdrop-blur-sm border-border/50",
      elevated: "bg-card shadow-elevated hover:shadow-lg transition-shadow duration-300",
      premium: "bg-card shadow-elevated hover:shadow-lg transition-all duration-300 african-accent"
    };

    return (
      <Card
        ref={ref}
        className={cn(
          "rounded-lg border transition-all duration-200",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </Card>
    );
  }
);

EnhancedCard.displayName = "EnhancedCard";

// Export the original card components for backward compatibility
export { CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
