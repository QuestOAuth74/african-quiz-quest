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
      <div className="grid grid-cols-5 gap-2 bg-jeopardy-blue-dark p-3 rounded-xl border border-jeopardy-gold/20 shadow-2xl">
        {/* Category Headers */}
        {categories.map((category, index) => (
          <Card 
            key={category.id} 
            className="jeopardy-gold border-none animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader className="p-3">
              <CardTitle className="text-center text-xs md:text-sm font-orbitron font-black uppercase tracking-wider text-jeopardy-blue-dark leading-tight">
                {category.name}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
        
        {/* Question Grid */}
        {POINT_VALUES.map((points, pointIndex) => (
          categories.map((category, catIndex) => {
            const question = category.questions.find(q => q.points === points);
            const isAnswered = question?.isAnswered || false;
            
            return (
              <Card 
                key={`${category.id}-${points}`}
                className={`aspect-square transition-all duration-300 animate-scale-in ${
                  isAnswered 
                    ? 'jeopardy-card opacity-30 cursor-not-allowed' 
                    : 'jeopardy-button hover:scale-105 cursor-pointer'
                }`}
                style={{ animationDelay: `${(pointIndex * 5 + catIndex) * 0.05 + 0.5}s` }}
              >
                <CardContent className="p-0 h-full">
                  <Button
                    variant="ghost"
                    className={`w-full h-full transition-all duration-300 font-orbitron font-black text-lg md:text-xl border-0 bg-transparent ${
                      isAnswered 
                        ? 'text-transparent cursor-not-allowed' 
                        : 'text-jeopardy-gold hover:text-jeopardy-gold-light hover:scale-110 jeopardy-text-glow hover:bg-transparent'
                    }`}
                    onClick={() => question && !isAnswered && onQuestionSelect(category.id, question.id)}
                    disabled={!isGameActive || isAnswered || !question}
                  >
                    {isAnswered ? '' : `$${points.toLocaleString()}`}
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