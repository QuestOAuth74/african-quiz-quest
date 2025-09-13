import { useState, useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import CategoryManager from "@/components/admin/CategoryManager";
import { BlogManager } from "@/components/admin/BlogManager";
import { CSVUpload } from "@/components/admin/CSVUpload";
import QuestionManager from "@/components/admin/QuestionManager";
import ForumModeration from "@/components/admin/ForumModeration";
import FlaggedQuestionsManager from "@/components/admin/FlaggedQuestionsManager";
import UserManager from "@/components/admin/UserManager";
import { SecurityMonitor } from "@/components/admin/SecurityMonitor";
import { CrosswordAdminPanel } from "@/components/admin/CrosswordAdminPanel";
import { PresentationSyncManager } from "@/components/admin/PresentationSyncManager";
import { LogOut, Users, FileQuestion, FolderOpen, Upload, AlertTriangle, UserCheck, Activity, Shield, Puzzle, Play } from "lucide-react";

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalCategories: 0,
    totalAdmins: 0,
    flaggedQuestions: 0,
    totalUsers: 0,
    activeUsersLastHour: 0,
    onlineUsers: 0,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  // Set page title
  usePageTitle("Admin Dashboard");

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
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const [questionsRes, categoriesRes, adminsRes, flaggedRes, usersRes, activeUsersRes, onlineUsersRes] = await Promise.all([
        supabase.from("questions").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_admin", true),
        supabase.from("questions").select("id", { count: "exact", head: true }).eq("is_flagged", true),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("last_seen", oneHourAgo),
        supabase.from("profiles").select("id", { count: "exact", head: true }).neq("player_status", "offline").not("player_status", "is", null)
      ]);

      setStats({
        totalQuestions: questionsRes.count || 0,
        totalCategories: categoriesRes.count || 0,
        totalAdmins: adminsRes.count || 0,
        flaggedQuestions: flaggedRes.count || 0,
        totalUsers: usersRes.count || 0,
        activeUsersLastHour: activeUsersRes.count || 0,
        onlineUsers: onlineUsersRes.count || 0,
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
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
          
          <Card className="jeopardy-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flagged Questions</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{stats.flaggedQuestions}</div>
              <p className="text-xs text-muted-foreground">Need review</p>
            </CardContent>
          </Card>
          
          <Card className="jeopardy-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <UserCheck className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered</p>
            </CardContent>
          </Card>
          
          <Card className="jeopardy-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.activeUsersLastHour}</div>
              <p className="text-xs text-muted-foreground">Last hour</p>
            </CardContent>
          </Card>
          
          <Card className="jeopardy-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online Now</CardTitle>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.onlineUsers}</div>
              <p className="text-xs text-muted-foreground">Currently online</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="questions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-10 bg-card">
            <TabsTrigger value="questions" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              Questions
            </TabsTrigger>
            <TabsTrigger value="flagged" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Flagged ({stats.flaggedQuestions})
            </TabsTrigger>
            <TabsTrigger value="upload" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              Categories
            </TabsTrigger>
            <TabsTrigger value="blog" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              Blog
            </TabsTrigger>
            <TabsTrigger value="moderation" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              Moderation
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="crossword" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Puzzle className="h-4 w-4 mr-2" />
              Crossword
            </TabsTrigger>
            <TabsTrigger value="presentation" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Play className="h-4 w-4 mr-2" />
              AI Presentation
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="questions">
            <QuestionManager onStatsUpdate={loadStats} />
          </TabsContent>
          
          <TabsContent value="flagged">
            <FlaggedQuestionsManager onStatsUpdate={loadStats} />
          </TabsContent>
          
          <TabsContent value="upload">
            <CSVUpload />
          </TabsContent>
          
          <TabsContent value="categories">
            <CategoryManager onStatsUpdate={loadStats} />
          </TabsContent>
          
          <TabsContent value="blog">
            <BlogManager />
          </TabsContent>
          
          <TabsContent value="moderation">
            <ForumModeration />
          </TabsContent>
          
          <TabsContent value="users">
            <UserManager />
          </TabsContent>
          
          <TabsContent value="security">
            <SecurityMonitor />
          </TabsContent>
          
          <TabsContent value="crossword">
            <CrosswordAdminPanel />
          </TabsContent>
          
          <TabsContent value="presentation">
            <PresentationSyncManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;