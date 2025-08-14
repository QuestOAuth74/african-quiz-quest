import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Question {
  id: string;
  text: string;
  points: string;
  explanation?: string;
  historical_context?: string;
  image_url?: string;
  has_image: boolean;
  categories: { name: string };
}

interface QuestionOption {
  id: string;
  text: string;
  option_type: 'correct' | 'incorrect';
}

interface QuestionPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
}

export const QuestionPreview = ({ isOpen, onClose, question }: QuestionPreviewProps) => {
  const [options, setOptions] = useState<QuestionOption[]>([]);

  useEffect(() => {
    if (question && isOpen) {
      loadOptions();
    }
  }, [question, isOpen]);

  const loadOptions = async () => {
    if (!question) return;

    try {
      const { data, error } = await supabase
        .from("question_options")
        .select("*")
        .eq("question_id", question.id)
        .order("created_at");

      if (error) throw error;
      setOptions(data as QuestionOption[] || []);
    } catch (error) {
      console.error("Error loading options:", error);
    }
  };

  if (!question) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] jeopardy-card">
        <DialogHeader>
          <DialogTitle>Question Preview</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Question Header */}
            <div className="flex justify-between items-start">
              <Badge variant="secondary" className="bg-accent text-accent-foreground">
                {question.categories?.name}
              </Badge>
              <Badge variant="outline" className="jeopardy-gold text-lg px-3 py-1">
                {question.points} points
              </Badge>
            </div>

            {/* Question Text */}
            <Card className="jeopardy-card">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4 text-accent">{question.text}</h3>
                
                {/* Image */}
                {question.has_image && question.image_url && (
                  <div className="mb-4">
                    <img
                      src={question.image_url}
                      alt="Question image"
                      className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                    />
                  </div>
                )}

                {/* Options */}
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div
                      key={option.id}
                    className={`p-3 rounded-lg border ${
                        option.option_type === 'correct'
                          ? "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300"
                          : "bg-muted border-border"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <span>{option.text}</span>
                        {option.option_type === 'correct' && (
                          <Badge variant="default" className="ml-auto bg-green-600">
                            Correct
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Explanation */}
            {question.explanation && (
              <Card className="jeopardy-card">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-accent mb-2">Explanation</h4>
                  <p className="text-muted-foreground">{question.explanation}</p>
                </CardContent>
              </Card>
            )}

            {/* Historical Context */}
            {question.historical_context && (
              <Card className="jeopardy-card">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-accent mb-2">Historical Context</h4>
                  <p className="text-muted-foreground">{question.historical_context}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};