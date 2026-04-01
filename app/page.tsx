import { Navbar } from '@/components/navbar';
import { Hero } from '@/components/hero';
import { Features } from '@/components/features';
import { Services } from '@/components/services';
import { CTAStrip } from '@/components/cta-strip';
import { Advantages } from '@/components/advantages';
import { Portfolio } from '@/components/portfolio';
import { Contact } from '@/components/contact';
import { Footer } from '@/components/footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 selection:bg-purple-500 selection:text-white transition-colors duration-300">
      <Navbar />
      <Hero />
      <Features />
      <Services />
      <CTAStrip />
      <Advantages />
      <Portfolio />
      <div id="contact">
        <Contact />
      </div>
      <Footer />
    </main>
  );
}
