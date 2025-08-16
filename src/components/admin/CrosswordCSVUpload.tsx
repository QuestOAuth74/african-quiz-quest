import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CSVCrosswordWord {
  word: string;
  category: string;
  difficulty: number;
  clue: string;
}

interface UploadResult {
  total: number;
  successful: number;
  failed: number;
  errors: string[];
}

interface CrosswordCSVUploadProps {
  onUploadComplete?: () => void;
}

export const CrosswordCSVUpload = ({ onUploadComplete }: CrosswordCSVUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const csvTemplate = `word,category,difficulty,clue
MALI,"Ancient History",2,"Ancient West African empire known for its gold trade"
AXUM,"Ancient History",3,"Ancient Ethiopian kingdom that controlled Red Sea trade"
TIMBUKTU,"Medieval Africa",2,"Famous center of learning in the Mali Empire"
SUNDIATA,"Ancient History",4,"Founder of the Mali Empire, subject of famous epic"
NUBIA,"NubioKemetic",2,"Ancient civilization along the Nile south of Egypt"
KUSH,"NubioKemetic",3,"Kingdom that ruled Egypt as the 25th Dynasty"
EGYPT,"NubioKemetic",1,"Land of the pharaohs along the Nile River"
GHANA,"Nations",2,"First great West African trading empire"
SONGHAI,"Medieval Africa",3,"Last of the great West African trading empires"
MANSA,"Ancient History",4,"Title meaning king in Mandinka language"`;

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'crossword_words_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast({
      title: "Template Downloaded",
      description: "Crossword CSV template has been downloaded to your device.",
    });
  };

  const parseCSV = (text: string): CSVCrosswordWord[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('CSV must have header row and at least one data row');
    
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const expectedHeaders = ['word', 'category', 'difficulty', 'clue'];
    
    // Validate headers
    for (const header of expectedHeaders) {
      if (!headers.includes(header)) {
        throw new Error(`Missing required column: ${header}`);
      }
    }

    const words: CSVCrosswordWord[] = [];
    
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

      if (values.length < 4) {
        throw new Error(`Row ${i + 1}: Insufficient columns (need word, category, difficulty, clue)`);
      }

      const word: CSVCrosswordWord = {
        word: values[0].replace(/"/g, '').toUpperCase(),
        category: values[1].replace(/"/g, ''),
        difficulty: parseInt(values[2]) || 1,
        clue: values[3].replace(/"/g, '')
      };

      // Validate required fields
      if (!word.word) throw new Error(`Row ${i + 1}: Word is required`);
      if (!word.category) throw new Error(`Row ${i + 1}: Category is required`);
      if (!word.clue) throw new Error(`Row ${i + 1}: Clue is required`);
      if (word.difficulty < 1 || word.difficulty > 5) {
        throw new Error(`Row ${i + 1}: Difficulty must be between 1 and 5`);
      }
      if (!/^[A-Z]+$/.test(word.word)) {
        throw new Error(`Row ${i + 1}: Word must contain only letters (${word.word})`);
      }
      if (word.word.length < 3 || word.word.length > 15) {
        throw new Error(`Row ${i + 1}: Word must be between 3 and 15 letters (${word.word})`);
      }

      words.push(word);
    }

    return words;
  };

  const uploadWords = async (words: CSVCrosswordWord[]) => {
    const result: UploadResult = {
      total: words.length,
      successful: 0,
      failed: 0,
      errors: []
    };

    // Get existing categories from the quiz system
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('name');

    if (categoriesError) {
      throw new Error(`Failed to load categories: ${categoriesError.message}`);
    }

    const validCategories = new Set(categories?.map(cat => cat.name) || []);

    // Check for duplicate words in the database
    const { data: existingWords } = await supabase
      .from('crossword_words')
      .select('word, category');

    const existingWordSet = new Set(
      existingWords?.map(w => `${w.word}-${w.category}`) || []
    );

    for (let i = 0; i < words.length; i++) {
      try {
        const word = words[i];
        setUploadProgress((i / words.length) * 100);

        // Validate category exists
        if (!validCategories.has(word.category)) {
          result.errors.push(`Row ${i + 2}: Category "${word.category}" not found. Available: ${Array.from(validCategories).join(', ')}`);
          result.failed++;
          continue;
        }

        // Check for duplicates
        const wordKey = `${word.word}-${word.category}`;
        if (existingWordSet.has(wordKey)) {
          result.errors.push(`Row ${i + 2}: Word "${word.word}" in category "${word.category}" already exists`);
          result.failed++;
          continue;
        }

        // Insert word
        const { error: insertError } = await supabase
          .from('crossword_words')
          .insert({
            word: word.word,
            clue: word.clue,
            category: word.category,
            difficulty: word.difficulty,
            length: word.word.length
          });

        if (insertError) {
          result.errors.push(`Row ${i + 2}: Failed to insert word - ${insertError.message}`);
          result.failed++;
          continue;
        }

        result.successful++;
        existingWordSet.add(wordKey); // Add to set to prevent duplicates within this upload
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
      const words = parseCSV(text);
      
      toast({
        title: "File Parsed",
        description: `Found ${words.length} words. Starting upload...`,
      });

      const result = await uploadWords(words);
      setUploadResult(result);

      if (result.successful > 0) {
        toast({
          title: "Upload Complete",
          description: `Successfully uploaded ${result.successful} crossword words.`,
        });
        onUploadComplete?.();
      }

      if (result.failed > 0) {
        toast({
          title: "Some Words Failed",
          description: `${result.failed} words failed to upload. Check the results below.`,
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
      <Card className="jeopardy-card">
        <CardHeader>
          <CardTitle className="text-theme-yellow flex items-center gap-2">
            <Upload size={20} />
            Bulk Upload Crossword Words via CSV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> This will upload words using the same categories as the quiz system. 
              Available categories: Ancient History, Medieval Africa, Nations, NubioKemetic, Scholars.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Step 1: Download Template</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Download the CSV template with example African history crossword words.
              </p>
              <Button onClick={downloadTemplate} variant="outline" className="gap-2">
                <Download size={16} />
                Download CSV Template
              </Button>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Step 2: Upload Your CSV</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Upload your completed CSV file with crossword words. Duplicates will be skipped.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="crossword-csv-upload"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="gap-2 jeopardy-gold"
              >
                <Upload size={16} />
                {isUploading ? "Uploading..." : "Choose CSV File"}
              </Button>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading crossword words...</span>
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

      <Card className="jeopardy-card">
        <CardHeader>
          <CardTitle className="text-theme-yellow">CSV Format Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Required Columns (in order):</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>word</strong> - The crossword word (3-15 letters, A-Z only)</li>
                <li><strong>category</strong> - Category name (must match existing quiz categories)</li>
                <li><strong>difficulty</strong> - Difficulty level (1-5)</li>
                <li><strong>clue</strong> - The clue for this word</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Available Categories:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Ancient History</strong> - Ancient kingdoms, empires, and civilizations</li>
                <li><strong>Medieval Africa</strong> - Medieval period African history</li>
                <li><strong>Nations</strong> - Countries and nations</li>
                <li><strong>NubioKemetic</strong> - Nubian and Kemetic (Egyptian) history</li>
                <li><strong>Scholars</strong> - African scholars and intellectuals</li>
              </ul>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Tips:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Words must be 3-15 letters and contain only A-Z</li>
                  <li>Use double quotes around text that contains commas</li>
                  <li>Category names must match exactly (case-sensitive)</li>
                  <li>Difficulty should be 1 (easiest) to 5 (hardest)</li>
                  <li>Duplicate word+category combinations will be skipped</li>
                  <li>Focus on African history content for consistency</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};