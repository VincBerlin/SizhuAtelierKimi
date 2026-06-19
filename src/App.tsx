import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useParams, useLocation } from 'react-router'

// Route-level code splitting: each page ships as its own chunk and is only
// downloaded when the user navigates to it. Keeps the initial bundle small.
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const ProductView = lazy(() => import('./pages/ProductView'))
const Personalize = lazy(() => import('./pages/Personalize'))
const Legal = lazy(() => import('./pages/Legal'))
const Faq = lazy(() => import('./pages/Faq'))
const Account = lazy(() => import('./pages/Account'))
const Gifts = lazy(() => import('./pages/Gifts'))
const HowItWorks = lazy(() => import('./pages/HowItWorks'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderResult = lazy(() => import('./pages/OrderResult'))
const Blog = lazy(() => import('./pages/Blog'))
const Article = lazy(() => import('./pages/Article'))
const TcmOverview = lazy(() => import('./pages/TcmOverview'))
const BundlesPage = lazy(() => import('./pages/BundlesPage'))
const DigitalPage = lazy(() => import('./pages/DigitalPage'))
const Kollektion = lazy(() => import('./pages/Kollektion'))
import Navbar from './components/Navbar'
import AnnouncementBar, { ANNOUNCEMENT_HEIGHT } from './components/shop/AnnouncementBar'
import SiteFooter from './components/shop/SiteFooter'
import CartDrawer from './components/shop/CartDrawer'
import ArticleOverlay from './components/shop/ArticleOverlay'
import Toast from './components/shop/Toast'
import { ShopStoreProvider } from './store/ShopStore'
import { AuthProvider } from './store/AuthProvider'
import { I18nProvider } from './i18n/I18nProvider'

const NAV_HEIGHT = 72

// Legacy German slugs redirect to the English routes (preserves existing links/SEO).
function LegacyProductRedirect() {
  const { id } = useParams()
  return <Navigate to={`/product/${id}`} replace />
}

function AppShell() {
  const { pathname } = useLocation()
  // Home keeps a full-viewport hero under the transparent fixed chrome;
  // every other route needs clearance below the announcement bar + navbar.
  const isHome = pathname === '/'

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <div style={{ paddingTop: isHome ? 0 : ANNOUNCEMENT_HEIGHT + NAV_HEIGHT }}>
        <Suspense fallback={<div style={{ minHeight: '60vh' }} aria-busy="true" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductView />} />
          {/* Dedicated multi-product personalization flow (Iteration 3). */}
          <Route path="/personalize" element={<Personalize />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/success" element={<OrderResult success />} />
          <Route path="/checkout/cancel" element={<OrderResult success={false} />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<Article />} />
          <Route path="/collections" element={<Kollektion />} />
          <Route path="/gifts" element={<Gifts />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/tcm" element={<TcmOverview />} />
          <Route path="/bundles" element={<BundlesPage />} />
          <Route path="/digital" element={<DigitalPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          {/* Legal + info pages (Iteration 8) */}
          <Route path="/faq" element={<Faq />} />
          <Route path="/account" element={<Account />} />
          <Route path="/impressum" element={<Legal docKey="impressum" />} />
          <Route path="/privacy" element={<Legal docKey="privacy" />} />
          <Route path="/terms" element={<Legal docKey="terms" />} />
          <Route path="/returns" element={<Legal docKey="returns" />} />
          <Route path="/shipping" element={<Legal docKey="shipping" />} />
          {/* Legacy German-slug redirects (kept so old links/bookmarks keep working) */}
          <Route path="/produkt/:id" element={<LegacyProductRedirect />} />
          <Route path="/kollektion" element={<Navigate to="/collections" replace />} />
          <Route path="/atelier" element={<Navigate to="/about" replace />} />
          <Route path="/kontakt" element={<Navigate to="/contact" replace />} />
        </Routes>
        </Suspense>
      </div>
      <SiteFooter />
      <CartDrawer />
      <ArticleOverlay />
      <Toast />
    </>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <ShopStoreProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </ShopStoreProvider>
    </I18nProvider>
  )
}
