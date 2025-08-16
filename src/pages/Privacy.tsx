import { Shield } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-primary flex items-center justify-center gap-3">
              <Shield className="h-10 w-10 text-theme-yellow" />
              Privacy Policy
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-theme-yellow to-theme-yellow-light mx-auto rounded-full"></div>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8 text-foreground">
              
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary">Who we are</h2>
                <p className="text-lg leading-relaxed">
                  Our website address is: <a href="http://historiaafricana.org" className="text-theme-yellow hover:text-theme-yellow-light underline">http://historiaafricana.org</a>.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary">Comments</h2>
                <p className="text-lg leading-relaxed">
                  When visitors leave comments on the site we collect the data shown in the comments form, and also the visitor's IP address and browser user agent string to help spam detection.
                </p>
                <p className="text-lg leading-relaxed">
                  An anonymized string created from your email address (also called a hash) may be provided to the Gravatar service to see if you are using it. The Gravatar service privacy policy is available here: <a href="https://automattic.com/privacy/" className="text-theme-yellow hover:text-theme-yellow-light underline" target="_blank" rel="noopener noreferrer">https://automattic.com/privacy/</a>. After approval of your comment, your profile picture is visible to the public in the context of your comment.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary">Media</h2>
                <p className="text-lg leading-relaxed">
                  If you upload images to the website, you should avoid uploading images with embedded location data (EXIF GPS) included. Visitors to the website can download and extract any location data from images on the website.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary">Cookies</h2>
                <p className="text-lg leading-relaxed">
                  If you leave a comment on our site you may opt-in to saving your name, email address and website in cookies. These are for your convenience so that you do not have to fill in your details again when you leave another comment. These cookies will last for one year.
                </p>
                <p className="text-lg leading-relaxed">
                  If you visit our login page, we will set a temporary cookie to determine if your browser accepts cookies. This cookie contains no personal data and is discarded when you close your browser.
                </p>
                <p className="text-lg leading-relaxed">
                  When you log in, we will also set up several cookies to save your login information and your screen display choices. Login cookies last for two days, and screen options cookies last for a year. If you select "Remember Me", your login will persist for two weeks. If you log out of your account, the login cookies will be removed.
                </p>
                <p className="text-lg leading-relaxed">
                  If you edit or publish an article, an additional cookie will be saved in your browser. This cookie includes no personal data and simply indicates the post ID of the article you just edited. It expires after 1 day.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary">Embedded content from other websites</h2>
                <p className="text-lg leading-relaxed">
                  Articles on this site may include embedded content (e.g. videos, images, articles, etc.). Embedded content from other websites behaves in the exact same way as if the visitor has visited the other website.
                </p>
                <p className="text-lg leading-relaxed">
                  These websites may collect data about you, use cookies, embed additional third-party tracking, and monitor your interaction with that embedded content, including tracking your interaction with the embedded content if you have an account and are logged in to that website.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary">Who we share your data with</h2>
                <p className="text-lg leading-relaxed">
                  If you request a password reset, your IP address will be included in the reset email.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary">How long we retain your data</h2>
                <p className="text-lg leading-relaxed">
                  If you leave a comment, the comment and its metadata are retained indefinitely. This is so we can recognize and approve any follow-up comments automatically instead of holding them in a moderation queue.
                </p>
                <p className="text-lg leading-relaxed">
                  For users that register on our website (if any), we also store the personal information they provide in their user profile. All users can see, edit, or delete their personal information at any time (except they cannot change their username). Website administrators can also see and edit that information.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary">What rights you have over your data</h2>
                <p className="text-lg leading-relaxed">
                  If you have an account on this site, or have left comments, you can request to receive an exported file of the personal data we hold about you, including any data you have provided to us. You can also request that we erase any personal data we hold about you. This does not include any data we are obliged to keep for administrative, legal, or security purposes.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary">Where your data is sent</h2>
                <p className="text-lg leading-relaxed">
                  Visitor comments may be checked through an automated spam detection service.
                </p>
              </section>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;