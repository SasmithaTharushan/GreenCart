import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './components/Login';
import WhatsAppButton from './components/WhatsAppButton';
import { useAppContext } from './context/AppContext';
import { trackPageView } from './lib/analytics';
import Home from './pages/Home';
import AllProducts from './pages/AllProducts';
import ProductsCategory from './pages/ProductsCategory';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import AddAddress from './pages/AddAddress';
import MyOrders from './pages/MyOrders';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import SellerLogin from './pages/seller/SellerLogin';
import SellerLayout from './pages/seller/SellerLayout';
import AddProduct from './pages/seller/AddProduct';
import ProductList from './pages/seller/ProductList';
import Orders from './pages/seller/Orders';
import Marketing from './pages/seller/Marketing';

const App = () => {
  const { pathname } = useLocation();
  const isSellerPath = pathname.startsWith('/seller');
  const { showUserLogin, isSeller, sellerChecked } = useAppContext();

  useEffect(() => {
    window.scrollTo(0, 0);
    // Let pages set their <title> first.
    const t = setTimeout(() => trackPageView(pathname), 50);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div className="text-default min-h-screen text-gray-700 bg-white">
      {isSellerPath ? null : <Navbar />}
      {showUserLogin ? <Login /> : null}
      <Toaster />

      <div className={isSellerPath ? '' : 'px-6 md:px-16 lg:px-24 xl:px-32'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<AllProducts />} />
          <Route path="/products/:category" element={<ProductsCategory />} />
          <Route path="/products/:category/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/add-address" element={<AddAddress />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/seller"
            element={!sellerChecked ? null : isSeller ? <SellerLayout /> : <SellerLogin />}
          >
            <Route index element={isSeller ? <AddProduct /> : null} />
            <Route path="product-list" element={<ProductList />} />
            <Route path="orders" element={<Orders />} />
            <Route path="marketing" element={<Marketing />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {!isSellerPath && <Footer />}
      {!isSellerPath && <WhatsAppButton />}
    </div>
  );
};

export default App;
