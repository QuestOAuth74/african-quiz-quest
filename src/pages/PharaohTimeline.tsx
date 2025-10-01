import { useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import TopNavigation from "@/components/TopNavigation";

const PharaohTimeline = () => {
  usePageTitle("Ancient Egyptian Pharaohs Timeline - Historia Africana");

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <div className="pt-16">
        <iframe
          src="/pharaoh-timeline.html"
          className="w-full border-0"
          title="Ancient Egyptian Pharaohs Timeline"
          style={{ height: 'calc(100vh - 4rem)' }}
        />
      </div>
    </div>
  );
};

export default PharaohTimeline;
