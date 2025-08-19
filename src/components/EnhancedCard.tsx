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
      default: "bg-card hover-lift soft-shadow",
      glass: "glass-card border-white/10 hover-glow",
      elevated: "bg-card elegant-shadow hover:shadow-2xl hover:scale-[1.02] transition-all duration-500",
      premium: "bg-gradient-to-br from-card via-card/95 to-muted/30 elegant-shadow hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-shimmer before:opacity-0 hover:before:opacity-100"
    };

    return (
      <Card
        ref={ref}
        className={cn(
          "rounded-2xl border transition-all duration-300",
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