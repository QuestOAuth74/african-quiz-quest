import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import CategoryManager from "@/components/admin/CategoryManager";
import { CSVUpload } from "@/components/admin/CSVUpload";
import QuestionManager from "@/components/admin/QuestionManager";
import ForumModeration from "@/components/admin/ForumModeration";
import { LogOut, Users, FileQuestion, FolderOpen, Upload } from "lucide-react";

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalCategories: 0,
    totalAdmins: 0,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadStats();
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

  const loadStats = async () => {
    try {
      const [questionsRes, categoriesRes, adminsRes] = await Promise.all([
        supabase.from("questions").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_admin", true)
      ]);

      setStats({
        totalQuestions: questionsRes.count || 0,
        totalCategories: categoriesRes.count || 0,
        totalAdmins: adminsRes.count || 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your Jeopardy game content</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="jeopardy-button">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="jeopardy-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
              <FileQuestion className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{stats.totalQuestions}</div>
            </CardContent>
          </Card>
          
          <Card className="jeopardy-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <FolderOpen className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{stats.totalCategories}</div>
            </CardContent>
          </Card>
          
          <Card className="jeopardy-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{stats.totalAdmins}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="questions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-card">
            <TabsTrigger value="questions" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              Questions
            </TabsTrigger>
            <TabsTrigger value="upload" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              Categories
            </TabsTrigger>
            <TabsTrigger value="moderation" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              Moderation
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="questions">
            <QuestionManager onStatsUpdate={loadStats} />
          </TabsContent>
          
          <TabsContent value="upload">
            <CSVUpload />
          </TabsContent>
          
          <TabsContent value="categories">
            <CategoryManager onStatsUpdate={loadStats} />
          </TabsContent>
          
          <TabsContent value="moderation">
            <ForumModeration />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;