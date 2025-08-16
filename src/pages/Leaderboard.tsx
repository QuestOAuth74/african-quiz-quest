import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Leaderboard as LeaderboardComponent } from "@/components/Leaderboard";

const LeaderboardPage = () => {
  usePageTitle("Leaderboard");
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return <LeaderboardComponent onBack={handleBack} />;
};

export default LeaderboardPage;