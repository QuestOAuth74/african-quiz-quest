import React, { useState } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Crown, Mail, Lock, ArrowLeft } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Set page title
  usePageTitle("Admin Login");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Direct login with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Authentication failed - no user data');
      }

      // Wait a moment for the session to be fully established
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if user is admin using the profiles table directly
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', authData.user.id)
        .single();
      
      if (profileError) {
        console.error('Profile lookup error:', profileError);
        throw new Error('Failed to verify admin status');
      }
      
      if (!profile?.is_admin) {
        await supabase.auth.signOut();
        throw new Error('Access denied. Administrator privileges required.');
      }

      toast({
        title: "Login Successful",
        description: "Welcome to the admin dashboard",
      });

      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error('Admin login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-theme-brown-dark via-background to-theme-brown opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--theme-yellow)/0.1),transparent_70%)]" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back to Game Button */}
          <Link to="/" className="inline-flex items-center gap-2 text-theme-yellow hover:text-theme-yellow-light transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform" />
            Back to Game
          </Link>

          <Card className="jeopardy-card border-theme-yellow/20 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-theme-yellow to-theme-yellow-dark flex items-center justify-center">
                <Crown className="w-8 h-8 text-theme-brown" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold gradient-text">Admin Portal</CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  Access the administrative dashboard to manage questions and categories
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Administrator Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-background/50 border-border/50 focus:border-theme-yellow transition-colors"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 bg-background/50 border-border/50 focus:border-theme-yellow transition-colors"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 jeopardy-gold font-semibold text-lg hover:scale-[1.02] transform transition-all duration-200" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-theme-brown border-t-transparent rounded-full animate-spin" />
                      Authenticating...
                    </div>
                  ) : (
                    'Access Dashboard'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;