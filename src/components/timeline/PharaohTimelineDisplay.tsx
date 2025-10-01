import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Pharaoh {
  id: string;
  name: string;
  dynasty: string;
  period: string;
  reign_start: number | null;
  reign_end: number | null;
  achievements: string | null;
  significance: string | null;
  burial_location: string | null;
  image_url: string | null;
  image_caption: string | null;
}

export const PharaohTimelineDisplay = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<string>("all");

  const { data: pharaohs, isLoading } = useQuery({
    queryKey: ["pharaohs-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pharaoh_timeline")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      
      if (error) throw error;
      return data as Pharaoh[];
    },
  });

  const periods = Array.from(new Set(pharaohs?.map(p => p.period) || []));
  const filteredPharaoh = filterPeriod === "all" 
    ? pharaohs 
    : pharaohs?.filter(p => p.period === filterPeriod);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading timeline...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0f0a] to-[#2d1810] text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-[hsl(var(--theme-yellow))]">
            Ancient Egyptian Pharaohs Timeline
          </h1>
          <p className="text-xl text-gray-300">
            3000+ Years of Egyptian History
          </p>
        </div>

        {/* Filter */}
        <div className="mb-8 flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setFilterPeriod("all")}
            className={cn(
              "px-4 py-2 rounded-lg transition-all",
              filterPeriod === "all"
                ? "bg-[hsl(var(--theme-yellow))] text-black font-semibold"
                : "bg-white/10 hover:bg-white/20"
            )}
          >
            All Periods
          </button>
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => setFilterPeriod(period)}
              className={cn(
                "px-4 py-2 rounded-lg transition-all",
                filterPeriod === period
                  ? "bg-[hsl(var(--theme-yellow))] text-black font-semibold"
                  : "bg-white/10 hover:bg-white/20"
              )}
            >
              {period}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          {filteredPharaoh?.map((pharaoh) => (
            <div
              key={pharaoh.id}
              className="bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden border border-[hsl(var(--theme-yellow))]/30 hover:border-[hsl(var(--theme-yellow))]/60 transition-all"
            >
              <button
                onClick={() => setExpandedId(expandedId === pharaoh.id ? null : pharaoh.id)}
                className="w-full p-6 text-left flex items-center justify-between"
              >
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-[hsl(var(--theme-yellow))] mb-2">
                    {pharaoh.name}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                    <span className="bg-white/10 px-3 py-1 rounded">
                      {pharaoh.dynasty}
                    </span>
                    <span className="bg-white/10 px-3 py-1 rounded">
                      {pharaoh.period}
                    </span>
                    {pharaoh.reign_start && pharaoh.reign_end && (
                      <span className="bg-white/10 px-3 py-1 rounded">
                        {pharaoh.reign_start} - {pharaoh.reign_end} BCE
                      </span>
                    )}
                  </div>
                </div>
                {expandedId === pharaoh.id ? (
                  <ChevronUp className="w-6 h-6 text-[hsl(var(--theme-yellow))]" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-[hsl(var(--theme-yellow))]" />
                )}
              </button>

              {expandedId === pharaoh.id && (
                <div className="px-6 pb-6 space-y-4">
                  {pharaoh.image_url && (
                    <div className="mb-4">
                      <img
                        src={pharaoh.image_url}
                        alt={pharaoh.name}
                        className="w-full max-w-md mx-auto rounded-lg border-4 border-[hsl(var(--theme-yellow))] shadow-lg shadow-[hsl(var(--theme-yellow))]/20"
                      />
                      {pharaoh.image_caption && (
                        <p className="text-center text-sm text-gray-400 mt-2 italic">
                          {pharaoh.image_caption}
                        </p>
                      )}
                    </div>
                  )}

                  {pharaoh.achievements && (
                    <div>
                      <h4 className="text-lg font-semibold text-[hsl(var(--theme-yellow))] mb-2">
                        Achievements
                      </h4>
                      <p className="text-gray-300 leading-relaxed">
                        {pharaoh.achievements}
                      </p>
                    </div>
                  )}

                  {pharaoh.significance && (
                    <div>
                      <h4 className="text-lg font-semibold text-[hsl(var(--theme-yellow))] mb-2">
                        Significance
                      </h4>
                      <p className="text-gray-300 leading-relaxed">
                        {pharaoh.significance}
                      </p>
                    </div>
                  )}

                  {pharaoh.burial_location && (
                    <div>
                      <h4 className="text-lg font-semibold text-[hsl(var(--theme-yellow))] mb-2">
                        Burial Location
                      </h4>
                      <p className="text-gray-300">
                        {pharaoh.burial_location}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {(!filteredPharaoh || filteredPharaoh.length === 0) && (
          <div className="text-center py-12 text-gray-400">
            No pharaohs found for this period.
          </div>
        )}
      </div>
    </div>
  );
};
