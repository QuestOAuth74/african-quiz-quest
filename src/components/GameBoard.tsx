import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  questions: Question[];
}

interface Question {
  id: string;
  points: number;
  isAnswered: boolean;
}

interface GameBoardProps {
  categories: Category[];
  onQuestionSelect: (categoryId: string, questionId: string) => void;
  isGameActive: boolean;
}

const POINT_VALUES = [100, 200, 300, 400, 500];

export function GameBoard({ categories, onQuestionSelect, isGameActive }: GameBoardProps) {
  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-6 gap-2">
        {/* Category Headers */}
        {categories.map((category) => (
          <Card key={category.id} className="bg-primary text-primary-foreground">
            <CardHeader className="p-3">
              <CardTitle className="text-center text-sm font-bold uppercase tracking-wide">
                {category.name}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
        
        {/* Question Grid */}
        {POINT_VALUES.map((points) => (
          categories.map((category) => {
            const question = category.questions.find(q => q.points === points);
            const isAnswered = question?.isAnswered || false;
            
            return (
              <Card 
                key={`${category.id}-${points}`}
                className={`aspect-square ${isAnswered ? 'bg-muted' : 'bg-card hover:bg-accent'} transition-colors`}
              >
                <CardContent className="p-0 h-full">
                  <Button
                    variant="ghost"
                    className="w-full h-full text-2xl font-bold text-foreground"
                    onClick={() => question && !isAnswered && onQuestionSelect(category.id, question.id)}
                    disabled={!isGameActive || isAnswered || !question}
                  >
                    {isAnswered ? '' : `$${points}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })
        ))}
      </div>
    </div>
  );
}