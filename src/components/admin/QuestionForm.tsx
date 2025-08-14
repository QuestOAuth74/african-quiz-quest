import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Category {
  id: string;
  name: string;
}

interface Question {
  id: string;
  text: string;
  points: number;
  explanation?: string;
  historical_context?: string;
  image_url?: string;
  has_image: boolean;
  category_id: string;
}

interface QuestionFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingQuestion?: Question | null;
  isRealtimeMode?: boolean;
}

const QuestionForm = ({ isOpen, onClose, editingQuestion, isRealtimeMode = false }: QuestionFormProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    text: "",
    categoryId: "",
    points: 100,
    explanation: "",
    historicalContext: "",
    imageUrl: "",
    hasImage: false,
    options: ["", "", "", ""],
    correctAnswer: 0,
  });
  const soundEffects = useSoundEffects();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      if (editingQuestion) {
        loadQuestionData();
      } else {
        resetForm();
      }
    }
  }, [isOpen, editingQuestion]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading categories",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadQuestionData = async () => {
    if (!editingQuestion) return;

    try {
      // Load question options
      const { data: options, error } = await supabase
        .from("question_options")
        .select("*")
        .eq("question_id", editingQuestion.id)
        .order("created_at");

      if (error) throw error;

      const optionTexts = options?.map(opt => opt.text) || ["", "", "", ""];
      const correctIndex = options?.findIndex(opt => opt.option_type === 'correct') || 0;

      setFormData({
        text: editingQuestion.text,
        categoryId: editingQuestion.category_id,
        points: editingQuestion.points,
        explanation: editingQuestion.explanation || "",
        historicalContext: editingQuestion.historical_context || "",
        imageUrl: editingQuestion.image_url || "",
        hasImage: editingQuestion.has_image,
        options: optionTexts,
        correctAnswer: correctIndex,
      });

      // Set image preview if editing question has image
      if (editingQuestion.image_url) {
        setImagePreview(editingQuestion.image_url);
      }
    } catch (error: any) {
      toast({
        title: "Error loading question data",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      text: "",
      categoryId: "",
      points: 100,
      explanation: "",
      historicalContext: "",
      imageUrl: "",
      hasImage: false,
      options: ["", "", "", ""],
      correctAnswer: 0,
    });
    setSelectedFile(null);
    setImagePreview(null);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('question-images')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('question-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormData({ ...formData, hasImage: true });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form
      if (!formData.text || !formData.categoryId || formData.options.some(opt => !opt.trim())) {
        throw new Error("Please fill in all required fields");
      }

      let imageUrl = formData.imageUrl;
      
      // Upload new image if selected
      if (selectedFile) {
        setUploadingImage(true);
        imageUrl = await uploadImage(selectedFile);
        setUploadingImage(false);
      }

      let questionId = editingQuestion?.id;

      if (editingQuestion) {
        // Update existing question
        const { error } = await supabase
          .from("questions")
          .update({
            text: formData.text,
            category_id: formData.categoryId,
            points: formData.points,
            explanation: formData.explanation || null,
            historical_context: formData.historicalContext || null,
            image_url: imageUrl || null,
            has_image: formData.hasImage && !!imageUrl,
          })
          .eq("id", editingQuestion.id);

        if (error) throw error;

        // Delete existing options
        await supabase
          .from("question_options")
          .delete()
          .eq("question_id", editingQuestion.id);
      } else {
        // Create new question
        const { data: userData } = await supabase.auth.getUser();
        const { data: questionData, error } = await supabase
          .from("questions")
          .insert({
            text: formData.text,
            category_id: formData.categoryId,
            points: formData.points,
            explanation: formData.explanation || null,
            historical_context: formData.historicalContext || null,
            image_url: imageUrl || null,
            has_image: formData.hasImage && !!imageUrl,
            created_by: userData.user?.id,
          })
          .select()
          .single();

        if (error) throw error;
        questionId = questionData.id;
      }

      // Insert new options
      const optionsData = formData.options.map((option, index) => ({
        question_id: questionId,
        text: option,
        option_type: (index === formData.correctAnswer ? 'correct' : 'incorrect') as 'correct' | 'incorrect',
      }));

      const { error: optionsError } = await supabase
        .from("question_options")
        .insert(optionsData);

      if (optionsError) throw optionsError;

      const successMessage = editingQuestion 
        ? isRealtimeMode 
          ? "Question updated in real-time!" 
          : "Question updated successfully"
        : "Question created successfully";

      toast({
        title: successMessage,
        ...(isRealtimeMode && { description: "Changes are live for all quiz participants" })
      });
      soundEffects.playSuccess();

      onClose();
    } catch (error: any) {
      soundEffects.playError();
      toast({
        title: editingQuestion ? "Error updating question" : "Error creating question",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setUploadingImage(false);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] jeopardy-card">
        <DialogHeader>
          <DialogTitle>
            {editingQuestion ? "Edit Question" : "Create New Question"}
            {isRealtimeMode && (
              <Badge variant="destructive" className="ml-2 text-xs">
                LIVE EDITING
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {isRealtimeMode 
              ? "⚡ Changes will be applied immediately to the active quiz"
              : "Fill in all the details for the question"
            }
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="questionText">Question Text *</Label>
              <Textarea
                id="questionText"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                placeholder="Enter the question text..."
                required
                rows={3}
                className="bg-input border-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="points">Points *</Label>
                <Select value={formData.points.toString()} onValueChange={(value) => setFormData({ ...formData, points: parseInt(value) })}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="200">200</SelectItem>
                    <SelectItem value="300">300</SelectItem>
                    <SelectItem value="400">400</SelectItem>
                    <SelectItem value="500">500</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Answer Options *</Label>
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={formData.correctAnswer === index}
                    onChange={() => setFormData({ ...formData, correctAnswer: index })}
                    className="w-4 h-4 text-accent bg-input border-border focus:ring-accent"
                  />
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    required
                    className="bg-input border-border"
                  />
                </div>
              ))}
              <p className="text-sm text-muted-foreground">Select the radio button next to the correct answer</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="explanation">Explanation</Label>
              <Textarea
                id="explanation"
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                placeholder="Explain why this is the correct answer..."
                rows={3}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="historicalContext">Historical Context</Label>
              <Textarea
                id="historicalContext"
                value={formData.historicalContext}
                onChange={(e) => setFormData({ ...formData, historicalContext: e.target.value })}
                placeholder="Provide historical background..."
                rows={3}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasImage"
                  checked={formData.hasImage}
                  onCheckedChange={(checked) => {
                    setFormData({ ...formData, hasImage: !!checked });
                    if (!checked) {
                      setSelectedFile(null);
                      setImagePreview(null);
                    }
                  }}
                />
                <Label htmlFor="hasImage">This question has an image</Label>
              </div>

              {formData.hasImage && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="imageFile">Upload Image</Label>
                    <input
                      id="imageFile"
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  
                  {imagePreview && (
                    <div className="space-y-2">
                      <Label>Image Preview</Label>
                      <div className="border border-border rounded-lg p-2">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-w-full h-48 object-contain mx-auto rounded"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Or paste Image URL</Label>
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => {
                        setFormData({ ...formData, imageUrl: e.target.value });
                        if (e.target.value && !selectedFile) {
                          setImagePreview(e.target.value);
                        }
                      }}
                      placeholder="https://example.com/image.jpg"
                      className="bg-input border-border"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="jeopardy-button"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || uploadingImage} className="jeopardy-button">
                {isLoading ? (
                  uploadingImage ? "Uploading Image..." : "Saving..."
                ) : editingQuestion ? "Update Question" : "Create Question"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionForm;