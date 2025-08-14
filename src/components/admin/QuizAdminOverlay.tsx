import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Settings, Edit, Eye, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QuestionForm from './QuestionForm';
import QuestionPreview from './QuestionPreview';

interface Question {
  id: string;
  text: string;
  points: number;
  explanation?: string;
  historical_context?: string;
  image_url?: string;
  has_image: boolean;
  category_id: string;
  categories?: { name: string };
}

interface QuizAdminOverlayProps {
  currentQuestionId?: string;
  onQuestionUpdate: () => void;
}

const QuizAdminOverlay = ({ currentQuestionId, onQuestionUpdate }: QuizAdminOverlayProps) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (currentQuestionId && isAdmin) {
      loadCurrentQuestion();
    }
  }, [currentQuestionId, isAdmin]);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: adminCheck, error } = await supabase
        .rpc('is_admin', { user_uuid: user.id });

      if (error) throw error;
      setIsAdmin(adminCheck || false);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const loadCurrentQuestion = async () => {
    if (!currentQuestionId) return;

    try {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          categories (name)
        `)
        .eq('id', currentQuestionId)
        .single();

      if (error) throw error;
      setCurrentQuestion(data as Question);
    } catch (error) {
      console.error('Error loading current question:', error);
    }
  };

  const handleEdit = () => {
    if (currentQuestion) {
      setEditingQuestion(currentQuestion);
      setIsFormOpen(true);
    }
  };

  const handlePreview = () => {
    if (currentQuestion) {
      setIsPreviewOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!currentQuestion) return;

    const confirmed = confirm(
      'Are you sure you want to delete this question? This will affect the current quiz!'
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', currentQuestion.id);

      if (error) throw error;

      toast({
        title: 'Question deleted',
        description: 'The question has been deleted and will be updated in the quiz.',
      });

      onQuestionUpdate();
      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error deleting question',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingQuestion(null);
    loadCurrentQuestion(); // Reload current question data
    onQuestionUpdate(); // Trigger quiz update
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <div className="fixed top-20 right-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-orange-600 text-white border-orange-700 hover:bg-orange-700 shadow-lg"
            >
              <Settings className="w-4 h-4 mr-2" />
              Admin
            </Button>
          </SheetTrigger>
          <SheetContent className="w-96 bg-card border-border">
            <SheetHeader>
              <SheetTitle className="text-accent">Quiz Admin Panel</SheetTitle>
            </SheetHeader>
            
            <div className="mt-6 space-y-6">
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                Live Quiz Mode
              </Badge>

              {currentQuestion ? (
                <Card className="jeopardy-card">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Current Question</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Category</p>
                      <p className="font-medium">{currentQuestion.categories?.name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Points</p>
                      <p className="font-medium">{currentQuestion.points}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Question</p>
                      <p className="text-sm line-clamp-3">{currentQuestion.text}</p>
                    </div>

                    {currentQuestion.has_image && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Has Image</p>
                        <Badge variant="outline" className="text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          Image attached
                        </Badge>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handlePreview}
                        className="flex-1"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleEdit}
                        className="flex-1"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleDelete}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="jeopardy-card">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground text-center">
                      No question is currently selected in the quiz.
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  ⚡ Changes made here will update the quiz in real-time for all participants.
                </p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <QuestionForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        editingQuestion={editingQuestion as any}
        isRealtimeMode={true}
      />

      <QuestionPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        question={currentQuestion as any}
      />
    </>
  );
};

export default QuizAdminOverlay;