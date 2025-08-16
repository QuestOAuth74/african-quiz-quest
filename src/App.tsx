import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import LeaderboardPage from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import { Blog } from "./pages/Blog";
import { BlogPost } from "./pages/BlogPost";
import Forum from "./pages/Forum";
import Profile from "./pages/Profile";
import Quiz from "./pages/Quiz";
import QuizSetup from "./pages/QuizSetup";
import { Crossword } from "./pages/Crossword";
import { CrosswordPlay } from "./pages/CrosswordPlay";
import WheelOfDestiny from "./pages/WheelOfDestiny";
import WheelPlay from "./pages/WheelPlay";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Footer from "./components/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="min-h-screen flex flex-col">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/forum" element={<ProtectedRoute><Forum /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
            <Route path="/quiz-setup" element={<ProtectedRoute><QuizSetup /></ProtectedRoute>} />
            <Route path="/crossword" element={<ProtectedRoute><Crossword /></ProtectedRoute>} />
            <Route path="/crossword/play/:puzzleId" element={<ProtectedRoute><CrosswordPlay /></ProtectedRoute>} />
            <Route path="/wheel" element={<ProtectedRoute><WheelOfDestiny /></ProtectedRoute>} />
            {/* Removed /wheel/play without :sessionId to prevent ambiguous routing */}
            <Route path="/wheel/play/:sessionId" element={<ProtectedRoute><WheelPlay /></ProtectedRoute>} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            {/* Catch-all route must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;