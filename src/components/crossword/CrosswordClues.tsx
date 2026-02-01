import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CrosswordClue, CrosswordWord } from '@/types/crossword';

interface CrosswordCluesProps {
  acrossClues: CrosswordClue[];
  downClues: CrosswordClue[];
  selectedWord: CrosswordWord | null;
  onClueClick: (wordId: string) => void;
  className?: string;
}

export function CrosswordClues({ 
  acrossClues, 
  downClues, 
  selectedWord, 
  onClueClick,
  className = '' 
}: CrosswordCluesProps) {
  
  const renderCluesList = (clues: CrosswordClue[], title: string) => (
    <Card className="jeopardy-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-orbitron text-accent flex items-center justify-between">
          {title}
          <Badge variant="outline" className="text-xs">
            {clues.filter(c => c.isCompleted).length}/{clues.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-64">
          <div className="space-y-2 p-4">
            {clues.map((clue) => (
              <div
                key={clue.wordId}
                onClick={() => onClueClick(clue.wordId)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedWord?.id === clue.wordId
                    ? 'bg-accent/20 border-l-4 border-accent'
                    : clue.isCompleted
                      ? 'bg-green-100/10 border-l-4 border-green-500 opacity-70'
                      : 'hover:bg-accent/10 border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`font-bold text-sm min-w-[2rem] ${
                    clue.isCompleted ? 'text-green-500' : 'text-accent'
                  }`}>
                    {clue.number}.
                  </span>
                  <span className={`text-sm leading-relaxed flex-1 ${
                    clue.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
                  }`}>
                    {clue.clue}
                  </span>
                  {clue.isCompleted && (
                    <span className="text-green-500 text-lg">✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  return (
    <div className={`crossword-clues ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {renderCluesList(acrossClues, 'ACROSS')}
        {renderCluesList(downClues, 'DOWN')}
      </div>
    </div>
  );
}