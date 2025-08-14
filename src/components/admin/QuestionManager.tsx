import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Eye } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import QuestionForm from "./QuestionForm";
import QuestionPreview from "./QuestionPreview";

interface Question {
  id: string;
  text: string;
  points: string;
  explanation?: string;
  historical_context?: string;
  image_url?: string;
  has_image: boolean;
  created_at: string;
  category_id?: string;
  categories?: { name: string };
}

interface QuestionManagerProps {
  onStatsUpdate: () => void;
}

const QuestionManager = ({ onStatsUpdate }: QuestionManagerProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadQuestions();
  }, [currentPage, pageSize]);

  const loadQuestions = async () => {
    try {
      // Get total count
      const { count, error: countError } = await supabase
        .from("questions")
        .select("*", { count: "exact", head: true });

      if (countError) throw countError;
      setTotalQuestions(count || 0);

      // Get paginated data
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error } = await supabase
        .from("questions")
        .select(`
          *,
          categories (name)
        `)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      setQuestions((data as any) || []);
    } catch (error: any) {
      toast({
        title: "Error loading questions",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("questions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast({ title: "Question deleted successfully" });
      loadQuestions();
      onStatsUpdate();
    } catch (error: any) {
      toast({
        title: "Error deleting question",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question as any);
    setIsFormOpen(true);
  };

  const handlePreview = (question: Question) => {
    setPreviewQuestion(question as any);
    setIsPreviewOpen(true);
  };

  const handleNewQuestion = () => {
    setEditingQuestion(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingQuestion(null);
    setCurrentPage(1); // Reset to first page when adding/editing
    loadQuestions();
    onStatsUpdate();
  };

  const totalPages = Math.ceil(totalQuestions / pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: string) => {
    setPageSize(parseInt(size));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  return (
    <div className="space-y-6">
      <Card className="jeopardy-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Questions ({totalQuestions} total)</CardTitle>
              <CardDescription>Manage game questions</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show:</span>
                <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleNewQuestion} className="jeopardy-button">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Has Image</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="max-w-md">
                    <div className="truncate">{question.text}</div>
                  </TableCell>
                  <TableCell>{question.categories?.name}</TableCell>
                  <TableCell>{question.points}</TableCell>
                  <TableCell>{question.has_image ? "Yes" : "No"}</TableCell>
                  <TableCell>{new Date(question.created_at).toLocaleDateString()}</TableCell>
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
                        variant="destructive"
                        onClick={() => handleDelete(question.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNumber)}
                          isActive={currentPage === pageNumber}
                          className="cursor-pointer"
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <QuestionForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        editingQuestion={editingQuestion as any}
      />

      <QuestionPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        question={previewQuestion as any}
      />
    </div>
  );
};

export default QuestionManager;