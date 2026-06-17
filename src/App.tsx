import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import ProductView from './pages/ProductView'
import Checkout from './pages/Checkout'
import Navbar from './components/Navbar'
import SiteFooter from './components/shop/SiteFooter'
import CartDrawer from './components/shop/CartDrawer'
import ArticleOverlay from './components/shop/ArticleOverlay'
import Toast from './components/shop/Toast'
import { ShopStoreProvider } from './store/ShopStore'

export default function App() {
  return (
    <ShopStoreProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/produkt/:id" element={<ProductView />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/atelier" element={<About />} />
        <Route path="/kontakt" element={<Contact />} />
      </Routes>
      <SiteFooter />
      <CartDrawer />
      <ArticleOverlay />
      <Toast />
    </ShopStoreProvider>
  )
}
