import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CSVQuestion {
  question: string;
  category: string;
  points: number;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  historicalContext?: string;
  imageUrl?: string;
}

interface UploadResult {
  total: number;
  successful: number;
  failed: number;
  errors: string[];
}

export const CSVUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const csvTemplate = `question,category,points,optionA,optionB,optionC,optionD,correctAnswer,explanation,historicalContext,imageUrl
"What is the capital of France?","Geography",100,"London","Berlin","Paris","Madrid","C","Paris is the capital and most populous city of France.","Founded in the 3rd century BC by a Celtic people called the Parisii.",""
"Who wrote Romeo and Juliet?","Literature",200,"Charles Dickens","William Shakespeare","Jane Austen","Mark Twain","B","William Shakespeare wrote this famous tragedy in the early part of his career.","Written around 1594-1596, it is one of Shakespeare's most popular plays.",""`;

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast({
      title: "Template Downloaded",
      description: "CSV template has been downloaded to your device.",
    });
  };

  const parseCSV = (text: string): CSVQuestion[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('CSV must have header row and at least one data row');
    
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const expectedHeaders = ['question', 'category', 'points', 'optionA', 'optionB', 'optionC', 'optionD', 'correctAnswer', 'explanation', 'historicalContext', 'imageUrl'];
    
    // Validate headers
    for (const header of expectedHeaders.slice(0, 8)) { // First 8 are required
      if (!headers.includes(header)) {
        throw new Error(`Missing required column: ${header}`);
      }
    }

    const questions: CSVQuestion[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Simple CSV parsing (handles quotes)
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      if (values.length < 8) {
        throw new Error(`Row ${i + 1}: Insufficient columns`);
      }

      const question: CSVQuestion = {
        question: values[0] || '',
        category: values[1] || '',
        points: parseInt(values[2]) || 100,
        optionA: values[3] || '',
        optionB: values[4] || '',
        optionC: values[5] || '',
        optionD: values[6] || '',
        correctAnswer: (values[7] as 'A' | 'B' | 'C' | 'D') || 'A',
        explanation: values[8] || '',
        historicalContext: values[9] || '',
        imageUrl: values[10] || ''
      };

      // Validate required fields
      if (!question.question) throw new Error(`Row ${i + 1}: Question text is required`);
      if (!question.category) throw new Error(`Row ${i + 1}: Category is required`);
      if (!['A', 'B', 'C', 'D'].includes(question.correctAnswer)) {
        throw new Error(`Row ${i + 1}: Correct answer must be A, B, C, or D`);
      }
      if (!question.optionA || !question.optionB || !question.optionC || !question.optionD) {
        throw new Error(`Row ${i + 1}: All four options (A, B, C, D) are required`);
      }

      questions.push(question);
    }

    return questions;
  };

  const uploadQuestions = async (questions: CSVQuestion[]) => {
    const result: UploadResult = {
      total: questions.length,
      successful: 0,
      failed: 0,
      errors: []
    };

    // Get all categories first
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name');

    if (categoriesError) {
      throw new Error(`Failed to load categories: ${categoriesError.message}`);
    }

    const categoryMap = new Map(categories?.map(cat => [cat.name.toLowerCase(), cat.id]) || []);

    for (let i = 0; i < questions.length; i++) {
      try {
        const question = questions[i];
        setUploadProgress((i / questions.length) * 100);

        // Find category ID
        const categoryId = categoryMap.get(question.category.toLowerCase());
        if (!categoryId) {
          result.errors.push(`Row ${i + 2}: Category "${question.category}" not found`);
          result.failed++;
          continue;
        }

        // Insert question
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .insert({
            text: question.question,
            category_id: categoryId,
            points: question.points,
            explanation: question.explanation || null,
            historical_context: question.historicalContext || null,
            image_url: question.imageUrl || null,
            has_image: !!question.imageUrl
          })
          .select('id')
          .single();

        if (questionError) {
          result.errors.push(`Row ${i + 2}: Failed to insert question - ${questionError.message}`);
          result.failed++;
          continue;
        }

        // Insert options
        const options = [
          { text: question.optionA, option_type: question.correctAnswer === 'A' ? 'correct' : 'incorrect' },
          { text: question.optionB, option_type: question.correctAnswer === 'B' ? 'correct' : 'incorrect' },
          { text: question.optionC, option_type: question.correctAnswer === 'C' ? 'correct' : 'incorrect' },
          { text: question.optionD, option_type: question.correctAnswer === 'D' ? 'correct' : 'incorrect' }
        ];

        const { error: optionsError } = await supabase
          .from('question_options')
          .insert(
            options.map(opt => ({
              question_id: questionData.id,
              text: opt.text,
              option_type: opt.option_type
            }))
          );

        if (optionsError) {
          result.errors.push(`Row ${i + 2}: Failed to insert options - ${optionsError.message}`);
          result.failed++;
          // Try to clean up the question
          await supabase.from('questions').delete().eq('id', questionData.id);
          continue;
        }

        result.successful++;
      } catch (error) {
        result.errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        result.failed++;
      }
    }

    setUploadProgress(100);
    return result;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      const text = await file.text();
      const questions = parseCSV(text);
      
      toast({
        title: "File Parsed",
        description: `Found ${questions.length} questions. Starting upload...`,
      });

      const result = await uploadQuestions(questions);
      setUploadResult(result);

      if (result.successful > 0) {
        toast({
          title: "Upload Complete",
          description: `Successfully uploaded ${result.successful} questions.`,
        });
      }

      if (result.failed > 0) {
        toast({
          title: "Some Questions Failed",
          description: `${result.failed} questions failed to upload. Check the results below.`,
          variant: "destructive",
        });
      }

    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload size={20} />
            Bulk Upload Questions via CSV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Make sure all categories exist in the system before uploading questions. 
              You can create categories in the Category Manager if needed.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Step 1: Download Template</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Download the CSV template to see the required format and example data.
              </p>
              <Button onClick={downloadTemplate} variant="outline" className="gap-2">
                <Download size={16} />
                Download CSV Template
              </Button>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Step 2: Upload Your CSV</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Upload your completed CSV file with questions. Make sure to follow the template format exactly.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="csv-upload"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="gap-2"
              >
                <Upload size={16} />
                {isUploading ? "Uploading..." : "Choose CSV File"}
              </Button>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading questions...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {uploadResult && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Upload Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle size={14} className="text-green-500" />
                      {uploadResult.successful} Successful
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <XCircle size={14} className="text-red-500" />
                      {uploadResult.failed} Failed
                    </Badge>
                    <Badge variant="secondary">
                      {uploadResult.total} Total
                    </Badge>
                  </div>

                  {uploadResult.errors.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Errors:</h4>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {uploadResult.errors.map((error, index) => (
                          <Alert key={index} variant="destructive" className="py-2">
                            <AlertDescription className="text-xs">{error}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CSV Format Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Required Columns (in order):</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>question</strong> - The question text</li>
                <li><strong>category</strong> - Category name (must exist in system)</li>
                <li><strong>points</strong> - Point value (number)</li>
                <li><strong>optionA</strong> - First answer option</li>
                <li><strong>optionB</strong> - Second answer option</li>
                <li><strong>optionC</strong> - Third answer option</li>
                <li><strong>optionD</strong> - Fourth answer option</li>
                <li><strong>correctAnswer</strong> - Correct option (A, B, C, or D)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Optional Columns:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>explanation</strong> - Explanation of the answer</li>
                <li><strong>historicalContext</strong> - Historical context or background</li>
                <li><strong>imageUrl</strong> - URL to question image</li>
              </ul>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Tips:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Use double quotes around text that contains commas</li>
                  <li>Make sure category names match exactly (case-insensitive)</li>
                  <li>Points should be positive numbers</li>
                  <li>All four options must be provided</li>
                  <li>Correct answer must be exactly A, B, C, or D</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};