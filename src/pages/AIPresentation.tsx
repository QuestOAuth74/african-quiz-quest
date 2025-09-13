import { useState, useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { PresentationSyncManager } from "@/components/admin/PresentationSyncManager";
import { LogOut, ArrowLeft, Play } from "lucide-react";

const AIPresentation = () => {
  const [user, setUser] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Set page title
  usePageTitle("AI Presentation Sync - Admin");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/admin/login");
      return;
    }

    // Check if user is admin
    const { data: adminData, error } = await supabase
      .rpc("is_admin", { user_uuid: user.id });

    if (error || !adminData) {
      await supabase.auth.signOut();
      navigate("/admin/login");
      return;
    }

    setUser(user);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleBackToDashboard = () => {
    navigate("/admin/dashboard");
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleBackToDashboard} 
              variant="outline" 
              className="jeopardy-button"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
                <Play className="h-8 w-8 text-accent" />
                AI Presentation Sync
              </h1>
              <p className="text-muted-foreground">Synchronize presentations with AI-powered audio analysis</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" className="jeopardy-button">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <PresentationSyncManager />
      </div>
    </div>
  );
};

export default AIPresentation;