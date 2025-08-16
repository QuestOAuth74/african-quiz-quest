import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GameModeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  onClick: () => void;
  disabled?: boolean;
  featured?: boolean;
}

export const GameModeCard = ({ 
  title, 
  description, 
  icon, 
  buttonText, 
  onClick, 
  disabled = false,
  featured = false 
}: GameModeCardProps) => {
  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-lg",
      featured && "ring-2 ring-primary/20",
      disabled && "opacity-50"
    )}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 text-4xl">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={onClick} 
          disabled={disabled}
          className="w-full"
          variant={featured ? "default" : "outline"}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};