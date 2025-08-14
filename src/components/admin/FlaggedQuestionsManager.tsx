import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, CheckCircle, Eye, Edit, Star } from "lucide-react";
import QuestionPreview from "./QuestionPreview";
import QuestionForm from "./QuestionForm";

interface FlaggedQuestion {
  id: string;
  text: string;
  average_rating: number;
  total_ratings: number;
  flagged_at: string;
  is_flagged: boolean;
  categories?: { name: string };
  reviewed_by?: string;
  reviewed_at?: string;
}

interface FlaggedQuestionsManagerProps {
  onStatsUpdate: () => void;
}

const FlaggedQuestionsManager = ({ onStatsUpdate }: FlaggedQuestionsManagerProps) => {
  const [flaggedQuestions, setFlaggedQuestions] = useState<FlaggedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<FlaggedQuestion | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadFlaggedQuestions();
  }, []);

  const loadFlaggedQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          categories (name)
        `)
        .eq('is_flagged', true)
        .order('flagged_at', { ascending: false });

      if (error) throw error;
      setFlaggedQuestions((data as any) || []);
    } catch (error: any) {
      toast({
        title: "Error loading flagged questions",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsReviewed = async (questionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('questions')
        .update({
          is_flagged: false,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', questionId);

      if (error) throw error;

      toast({
        title: "Question Reviewed",
        description: "Question has been marked as reviewed and unflagged.",
      });

      loadFlaggedQuestions();
      onStatsUpdate();
    } catch (error: any) {
      toast({
        title: "Error reviewing question",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePreview = (question: FlaggedQuestion) => {
    setSelectedQuestion(question);
    setIsPreviewOpen(true);
  };

  const handleEdit = (question: FlaggedQuestion) => {
    setSelectedQuestion(question);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedQuestion(null);
    loadFlaggedQuestions();
    onStatsUpdate();
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= Math.round(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <Card className="jeopardy-card">
        <CardHeader>
          <CardTitle>Loading flagged questions...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="jeopardy-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <div>
              <CardTitle>Flagged Questions ({flaggedQuestions.length})</CardTitle>
              <CardDescription>
                Questions with average ratings below 2.0 stars (minimum 3 ratings required)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {flaggedQuestions.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No Flagged Questions</h3>
              <p className="text-sm text-muted-foreground mt-2">
                All questions are currently performing well!
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Flagged Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flaggedQuestions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell className="max-w-md">
                      <div className="space-y-1">
                        <div className="truncate font-medium">{question.text}</div>
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Low Rating
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {question.categories?.name || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          {renderStars(question.average_rating)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {question.average_rating?.toFixed(1)}/5 ({question.total_ratings} ratings)
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(question.flagged_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePreview(question)}
                          className="jeopardy-button"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(question)}
                          className="jeopardy-button"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleMarkAsReviewed(question.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Reviewed
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <QuestionPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        question={selectedQuestion as any}
      />

      <QuestionForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        editingQuestion={selectedQuestion as any}
      />
    </div>
  );
};

export default FlaggedQuestionsManager;