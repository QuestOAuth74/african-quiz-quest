import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Temporary function to create the initial admin user
  const createInitialAdmin = async () => {
    try {
      setIsLoading(true);
      
      // First, sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: "quemile@gmail.com",
        password: "144245",
        options: {
          emailRedirectTo: `${window.location.origin}/admin/login`
        }
      });

      if (signUpError) throw signUpError;

      if (signUpData.user) {
        // Now make them admin
        const { data: adminResult, error: adminError } = await supabase
          .rpc("make_user_admin_by_email", { user_email: "quemile@gmail.com" });

        if (adminError) throw adminError;

        toast({
          title: "Admin user created",
          description: "Admin user created successfully. You can now log in.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Failed to create admin",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user is admin
      const { data: adminData, error: adminError } = await supabase
        .rpc("is_admin", { user_uuid: data.user.id });

      if (adminError || !adminData) {
        await supabase.auth.signOut();
        throw new Error("You don't have admin privileges");
      }

      toast({
        title: "Login successful",
        description: "Welcome to the admin dashboard",
      });

      navigate("/admin/dashboard");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md jeopardy-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl gradient-text">Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-input border-border"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full jeopardy-button" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground text-center mb-2">
              Initial setup only:
            </p>
            <Button 
              onClick={createInitialAdmin}
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              Create Initial Admin User
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;