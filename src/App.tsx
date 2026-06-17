import { Routes, Route, useLocation } from 'react-router'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import ProductView from './pages/ProductView'
import Checkout from './pages/Checkout'
import Blog from './pages/Blog'
import Article from './pages/Article'
import TcmOverview from './pages/TcmOverview'
import BundlesPage from './pages/BundlesPage'
import DigitalPage from './pages/DigitalPage'
import Kollektion from './pages/Kollektion'
import Navbar from './components/Navbar'
import AnnouncementBar, { ANNOUNCEMENT_HEIGHT } from './components/shop/AnnouncementBar'
import SiteFooter from './components/shop/SiteFooter'
import CartDrawer from './components/shop/CartDrawer'
import ArticleOverlay from './components/shop/ArticleOverlay'
import Toast from './components/shop/Toast'
import { ShopStoreProvider } from './store/ShopStore'

const NAV_HEIGHT = 72

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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produkt/:id" element={<ProductView />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<Article />} />
          <Route path="/kollektion" element={<Kollektion />} />
          <Route path="/tcm" element={<TcmOverview />} />
          <Route path="/bundles" element={<BundlesPage />} />
          <Route path="/digital" element={<DigitalPage />} />
          <Route path="/atelier" element={<About />} />
          <Route path="/kontakt" element={<Contact />} />
        </Routes>
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
    <ShopStoreProvider>
      <AppShell />
    </ShopStoreProvider>
  )
}
