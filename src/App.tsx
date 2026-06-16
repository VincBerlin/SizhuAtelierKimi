import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Shop from './pages/Shop'
import Product from './pages/Product'
import Checkout from './pages/Checkout'
import Article from './pages/Article'
import Faq from './pages/Faq'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import ProductConfigurator from './components/ProductConfigurator'
import { ShopProvider } from './components/ShopProvider'
import Blog from './pages/Blog'

export default function App() {
  return (
    <ShopProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/produkt/:id" element={<Product />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/atelier" element={<About />} />
        <Route path="/kontakt" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<Article />} />
        <Route path="/faq" element={<Faq />} />
      </Routes>
      <Footer />
      <CartDrawer />
      <ProductConfigurator />
    </ShopProvider>
  )
}
