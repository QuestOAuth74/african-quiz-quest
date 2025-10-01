import { useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import TopNavigation from "@/components/TopNavigation";
import { PharaohTimelineDisplay } from "@/components/timeline/PharaohTimelineDisplay";

const PharaohTimeline = () => {
  usePageTitle("Ancient Egyptian Pharaohs Timeline - Historia Africana");

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <PharaohTimelineDisplay />
    </div>
  );
};

export default PharaohTimeline;
