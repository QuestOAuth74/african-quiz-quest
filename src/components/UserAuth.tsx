import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { User, LogOut, LogIn, UserPlus, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UserAuth = () => {
  const { user, isAuthenticated, signOut, loading } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    }
  };

  if (loading) {
    return (
      <Card className="jeopardy-card border-accent/30 animate-pulse">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent/20 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-accent/20 rounded w-3/4"></div>
              <div className="h-3 bg-accent/20 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isAuthenticated) {
    return (
      <Card className="jeopardy-card border-accent/30">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <User className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-semibold text-accent">Welcome back!</p>
              <p className="text-sm text-accent/80">
                {user?.email}
              </p>
              <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                Signed In
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/leaderboard" className="flex-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full jeopardy-button border-accent/50 text-xs"
              >
                <Trophy className="w-3 h-3 mr-1" />
                Leaderboard
              </Button>
            </Link>
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="flex-1 jeopardy-button border-accent/50 text-xs"
            >
              <LogOut className="w-3 h-3 mr-1" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="jeopardy-card border-accent/30">
      <CardContent className="p-4">
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
            <User className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-accent mb-1">Welcome to Historia Quiz!</h3>
            <p className="text-sm text-accent/80 mb-3">
              Sign in to track your progress and compete with others
            </p>
            <div className="flex gap-2 justify-center">
              <Link to="/auth">
                <Button variant="outline" size="sm" className="jeopardy-button border-accent/50 text-xs">
                  <LogIn className="w-3 h-3 mr-1" />
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="jeopardy-button text-xs">
                  <UserPlus className="w-3 h-3 mr-1" />
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserAuth;