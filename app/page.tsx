import { getSiteConfig } from '@/lib/store';
import RailHero from './components/RailHero';
import Night26Section from './components/Night26Section';
import SablonSections from './components/SablonSections';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const siteConfig = await getSiteConfig();
  return (
    <main>
      <RailHero config={siteConfig} />
      <Night26Section config={siteConfig} />
      <SablonSections config={siteConfig} />
    </main>
  );
}
