import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Zap, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const GPTStatusChecker = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState<{
    gpt: boolean;
    whisper: boolean;
    edge: boolean;
    message: string;
  } | null>(null);
  const { toast } = useToast();

  const checkGPTStatus = async () => {
    setIsChecking(true);
    
    try {
      toast({
        title: "Testing AI Services",
        description: "Checking GPT-4, Whisper, and Edge Function status...",
      });

      // Test the edge function with a simple GPT request
      const { data, error } = await supabase.functions.invoke('presentation-ai-analysis', {
        body: {
          analysis_type: 'test_gpt',
          test_message: 'Hello, please respond with "GPT is working" if you can see this.'
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      const gptWorking = data?.response?.includes('working') || data?.success;
      const whisperWorking = data?.whisper_status || false;
      const edgeWorking = !error;

      setStatus({
        gpt: gptWorking,
        whisper: whisperWorking,
        edge: edgeWorking,
        message: data?.message || 'Test completed'
      });

      toast({
        title: gptWorking ? "✅ AI Services Working" : "❌ Issues Detected",
        description: data?.message || "AI services test completed",
        variant: gptWorking ? "default" : "destructive"
      });

    } catch (error) {
      console.error('GPT status check error:', error);
      setStatus({
        gpt: false,
        whisper: false,
        edge: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });

      toast({
        title: "AI Service Test Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          AI Services Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={checkGPTStatus} 
          disabled={isChecking}
          className="w-full"
        >
          {isChecking ? "Testing..." : "Test AI Services"}
        </Button>

        {status && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-2">
                {status.gpt ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <Badge variant={status.gpt ? "default" : "destructive"}>
                  GPT-4
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                {status.whisper ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <Badge variant={status.whisper ? "default" : "destructive"}>
                  Whisper
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                {status.edge ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <Badge variant={status.edge ? "default" : "destructive"}>
                  Edge Function
                </Badge>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Status:</strong> {status.message}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
};