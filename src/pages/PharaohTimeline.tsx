import { useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";

const PharaohTimeline = () => {
  usePageTitle("Ancient Egyptian Pharaohs Timeline - Historia Africana");

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <iframe
        src="/pharaoh-timeline.html"
        className="w-full h-screen border-0"
        title="Ancient Egyptian Pharaohs Timeline"
        style={{ minHeight: '100vh' }}
      />
    </div>
  );
};

export default PharaohTimeline;
