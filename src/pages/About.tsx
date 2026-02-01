import { Mail } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageTitle';
import TopNavigation from '@/components/TopNavigation';

const About = () => {
  usePageMeta("About Us", "Learn about Historia Africana's mission to educate and empower through African history and heritage.");
  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <div className="container mx-auto px-4 py-12 pt-20 max-w-4xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-primary">About Us</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-accent to-accent/80 mx-auto rounded-full"></div>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none">
            <div className="space-y-6 text-foreground">
              <p className="text-lg leading-relaxed">
                Welcome to <strong>HistoriaAfricana.org</strong>, a vibrant space dedicated to unveiling African history, long overshadowed by Eurocentric narratives. Our mission extends beyond mere storytelling; it is a profound commitment to resurrecting the essence of African antiquity, presenting it in its true, unadulterated glory.
              </p>

              <p className="text-lg leading-relaxed">
                We stand as a beacon for those eager to explore the depths of Africa's past, from the dawn of civilization to its unparalleled contributions to the world's cultural, scientific, and political landscapes.
              </p>

              <p className="text-lg leading-relaxed">
                At HistoriaAfricana.org, we confront the Eurocentric views that have historically minimized Africa's role in the annals of global history. Our approach is unique—we strive not only to educate but also to challenge and inspire.
              </p>

              <p className="text-lg leading-relaxed">
                We're driven by a vision to dismantle the deeply ingrained mindset of white supremacy in African consciousness, employing peaceful and intellectually honest methods to achieve our goals. Our content is crafted to enlighten, empower, and evoke a sense of pride in the heritage and accomplishments of African civilizations.
              </p>

              <p className="text-lg leading-relaxed">
                Our commitment is to be the last generation of black people who endure the extreme humiliation and destruction wrought by the erasure of our history. We are determined to ensure that the cycles of indignity and injustice faced by our ancestors end with us. Future generations will inherit a legacy of strength, knowledge, and pride in their African roots, free from the shadows of misrepresentation and marginalization.
              </p>

              <p className="text-lg leading-relaxed">
                HistoriaAfricana.org is a sanctuary for the empowerment of black people both in Africa and across the African diaspora. It is a platform for all who are ready to embrace the truth about the racist world we live in and are seeking to make a change. Our content is designed to challenge, educate, and inspire our audience with the wonders of Africa's past, the realities of its present, and the possibilities of its future.
              </p>

              <p className="text-lg leading-relaxed">
                Our YouTube channel serves as the cornerstone of our mission, offering a wide array of content that shatters the conventional Eurocentric narrative of African history. Through meticulously researched documentaries, insightful analyses, and engaging discussions, we bring to light the stories that have been neglected or misrepresented for far too long.
              </p>

              <p className="text-lg leading-relaxed">
                As we embark on this journey together, we invite you to join us with an open mind and a willing heart. If you are not ready to challenge the status quo and confront the realities of a biased historical perspective, then we bid you <em>Nibe nosulu ulohle</em>—have a nice day. For those who are prepared to dive deep into the truth of African history and celebrate its richness, welcome to HistoriaAfricana.org.
              </p>

              <p className="text-lg leading-relaxed">
                Together, we will rewrite the narrative, ensuring that the beauty, depth, and complexity of African antiquity are recognized and revered by all. Join us in this crucial mission to educate, empower, and transform the African consciousness for generations to come.
              </p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-card rounded-lg border p-8 text-center">
            <h2 className="text-2xl font-semibold text-primary mb-4">Contact Us</h2>
            <a 
              href="mailto:subscribe@historiaafricana.org"
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors text-lg"
            >
              <Mail className="h-5 w-5" />
              subscribe@historiaafricana.org
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;