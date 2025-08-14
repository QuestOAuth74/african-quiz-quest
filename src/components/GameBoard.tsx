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
  hasQuestion?: boolean;
}

interface GameBoardProps {
  categories: Category[];
  onQuestionSelect: (categoryId: string, questionId: string) => void;
  isGameActive: boolean;
  rowCount?: number;
}

export function GameBoard({ categories, onQuestionSelect, isGameActive, rowCount = 5 }: GameBoardProps) {
  // Generate point values based on row count
  const pointValues = Array.from({ length: rowCount }, (_, index) => (index + 1) * 100);
  
  // Get the number of columns based on categories length
  const colCount = categories.length;
  const gridCols = colCount === 1 ? 'grid-cols-1' : 
                   colCount === 2 ? 'grid-cols-2' : 
                   colCount === 3 ? 'grid-cols-3' : 
                   colCount === 4 ? 'grid-cols-4' : 
                   colCount === 5 ? 'grid-cols-5' : 
                   colCount === 6 ? 'grid-cols-6' : 
                   'grid-cols-5'; // fallback

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className={`grid ${gridCols} gap-2 bg-jeopardy-blue-dark p-3 rounded-xl border border-jeopardy-gold/20 shadow-2xl`}>
        {/* Category Headers */}
        {categories.map((category, index) => (
          <Card 
            key={category.id} 
            className="bg-theme-brown-dark border-none animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader className="p-3">
              <CardTitle className="text-center text-xs md:text-sm font-orbitron font-black uppercase tracking-wider text-white leading-tight">
                {category.name}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
        
        {/* Question Grid */}
        {pointValues.map((points, pointIndex) => (
          categories.map((category, catIndex) => {
            const question = category.questions.find(q => q.points === points);
            const isAnswered = question?.isAnswered || false;
            const hasQuestion = question?.hasQuestion !== false; // Default to true for backwards compatibility
            
            return (
              <Card 
                key={`${category.id}-${points}`}
                className={`aspect-square transition-all duration-500 animate-scale-in ${
                  isAnswered 
                    ? 'bg-theme-brown-dark/50 border-theme-brown opacity-40 cursor-not-allowed' 
                    : !hasQuestion
                      ? 'bg-muted/30 border-muted opacity-50 cursor-not-allowed'
                      : 'jeopardy-button hover:scale-105 cursor-pointer'
                }`}
                style={{ animationDelay: `${(pointIndex * colCount + catIndex) * 0.05 + 0.5}s` }}
              >
                <CardContent className="p-0 h-full relative">
                  {/* Answered overlay */}
                  {isAnswered && (
                    <div className="absolute inset-0 bg-theme-brown-dark/80 flex items-center justify-center z-10 rounded-lg">
                      <div className="text-4xl text-theme-brown-light/60">✓</div>
                    </div>
                  )}
                  
                  {/* No question available overlay */}
                  {!hasQuestion && !isAnswered && (
                    <div className="absolute inset-0 bg-muted/60 flex items-center justify-center z-10 rounded-lg">
                      <div className="text-2xl text-muted-foreground/60">—</div>
                    </div>
                  )}
                  
                  <Button
                    variant="ghost"
                    className={`w-full h-full transition-all duration-300 font-orbitron font-black text-lg md:text-xl border-0 bg-transparent relative ${
                      isAnswered 
                        ? 'text-theme-brown-light/30 cursor-not-allowed pointer-events-none' 
                        : !hasQuestion
                          ? 'text-muted-foreground/40 cursor-not-allowed pointer-events-none'
                          : 'text-jeopardy-gold hover:text-jeopardy-gold-light hover:scale-110 jeopardy-text-glow hover:bg-transparent'
                    }`}
                    onClick={() => question && !isAnswered && hasQuestion && onQuestionSelect(category.id, question.id)}
                    disabled={!isGameActive || isAnswered || !question || !hasQuestion}
                  >
                    {`$${points.toLocaleString()}`}
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