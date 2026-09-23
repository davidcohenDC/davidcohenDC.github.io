import BackToTop from '@/layout/BackToTop'
import Footer from '@/layout/Footer'
import Header from '@/layout/Header'
import useReveal from '@/motion/use-reveal'
import AchievementsSection from '@/sections/achievements/AchievementsSection'
import HeroSection from '@/sections/hero/HeroSection'
import ProjectsSection from '@/sections/projects/ProjectsSection'
import { menu } from '@/sections/registry'
import useTheme from '@/theme/use-theme'

export default function App() {
  const { dark, toggleTheme } = useTheme()
  useReveal()
  return (
    <div id="top" tabIndex={-1} className="portfolio">
      <Header menu={menu} dark={dark} onThemeChange={toggleTheme} />
      <main id="main" tabIndex={-1}>
        <HeroSection />
        <ProjectsSection />
        <AchievementsSection />
      </main>
      <Footer />
      <BackToTop />
    </div>
  )
}
