import { useNavigate } from "react-router-dom";
import { Leaderboard as LeaderboardComponent } from "@/components/Leaderboard";

const LeaderboardPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return <LeaderboardComponent onBack={handleBack} />;
};

export default LeaderboardPage;