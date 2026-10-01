import { Suspense, lazy, useCallback, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollProgress from './components/ScrollProgress';
import Seo from './components/Seo';
import { METHODS } from './data/brewing';
import './App.css';

// Each page is its own chunk, so a visitor landing on /brewing does not pay
// for the other five. The prerender resolves these at build time, so the HTML
// is complete either way — splitting only affects what JavaScript is fetched.
const loadHome = () => import('./pages/Home');
const loadStory = () => import('./pages/Story');
const loadClub = () => import('./pages/Club');
const loadBrewing = () => import('./pages/Brewing');
const loadExperiences = () => import('./pages/Experiences');
const loadContact = () => import('./pages/Contact');
const loadBrewMethod = () => import('./pages/BrewMethod');
const loadCoorgCoffee = () => import('./pages/CoorgCoffee');
const loadNotFound = () => import('./pages/NotFound');

const Home = lazy(loadHome);
const Story = lazy(loadStory);
const Club = lazy(loadClub);
const Brewing = lazy(loadBrewing);
const Experiences = lazy(loadExperiences);
const Contact = lazy(loadContact);
const BrewMethod = lazy(loadBrewMethod);
const CoorgCoffee = lazy(loadCoorgCoffee);
const NotFound = lazy(loadNotFound);

const ROUTE_CHUNKS = [
  loadHome,
  loadStory,
  loadClub,
  loadBrewing,
  loadExperiences,
  loadContact,
  loadBrewMethod,
  loadCoorgCoffee,
  loadNotFound,
];

function App() {
  const location = useLocation();

  // Reset scroll only once the outgoing page has finished leaving, otherwise
  // the exit animation plays while the page is yanked to the top.
  const handleExitComplete = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Pull the other pages down once this one is idle. Without this the first
  // click after landing would wait on a network round trip, and the page
  // transition would stall on an empty Suspense boundary.
  useEffect(() => {
    const schedule = window.requestIdleCallback ?? ((cb) => window.setTimeout(cb, 600));
    const handle = schedule(() => {
      for (const load of ROUTE_CHUNKS) load();
    });
    return () => window.cancelIdleCallback?.(handle);
  }, []);

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Seo />
      <ScrollProgress />
      <Navbar />

      <main id="main" className="app__main">
        {/* Suspense sits outside AnimatePresence so the keyed <Routes> stays
            its direct child — that key is what drives the page cross-fade.
            The boundary never shows during hydration (React keeps the
            prerendered markup until the chunk arrives) and the idle prefetch
            above leaves it nothing to wait for afterwards. */}
        <Suspense fallback={null}>
          <AnimatePresence mode="wait" initial={false} onExitComplete={handleExitComplete}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/story" element={<Story />} />
              <Route path="/club" element={<Club />} />
              <Route path="/brewing" element={<Brewing />} />
              <Route path="/experiences" element={<Experiences />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/coorg-coffee" element={<CoorgCoffee />} />
              {/* Registered one by one rather than as /brewing/:method, so an
                  unknown method falls through to the 404 instead of rendering
                  an empty recipe. */}
              {METHODS.map((method) => (
                <Route
                  key={method.id}
                  path={`/brewing/${method.id}`}
                  element={<BrewMethod methodId={method.id} />}
                />
              ))}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

export default App;
