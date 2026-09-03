import { useCallback } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollProgress from './components/ScrollProgress';
import Home from './pages/Home';
import Story from './pages/Story';
import Brewing from './pages/Brewing';
import Experiences from './pages/Experiences';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  const location = useLocation();

  // Reset scroll only once the outgoing page has finished leaving, otherwise
  // the exit animation plays while the page is yanked to the top.
  const handleExitComplete = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <ScrollProgress />
      <Navbar />

      <main id="main" className="app__main">
        <AnimatePresence mode="wait" initial={false} onExitComplete={handleExitComplete}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/story" element={<Story />} />
            <Route path="/brewing" element={<Brewing />} />
            <Route path="/experiences" element={<Experiences />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export default App;
