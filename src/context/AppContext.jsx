import { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { site } from '../config';
import { track, toItem } from '../lib/analytics';

export const AppContext = createContext();

const CART_KEY = 'gc_cart';

const loadLocalCart = () => {
  try {
    const c = JSON.parse(localStorage.getItem(CART_KEY) || '{}');
    return c && typeof c === 'object' ? c : {};
  } catch {
    return {};
  }
};

export const AppContextProvider = ({ children }) => {
  const currency = site.currency;
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [sellerChecked, setSellerChecked] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [cartItems, setCartItems] = useState(loadLocalCart);
  const [searchQuery, setSearchQuery] = useState('');

  // Skip the server sync that would otherwise fire right after we load the cart from the server.
  const skipNextSync = useRef(false);

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    const data = await api('/product/list');
    if (data.success) setProducts(data.products);
    else toast.error(data.message);
    setProductsLoading(false);
  }, []);

  // Merge a guest cart into the account cart after login.
  const applyUser = useCallback((u) => {
    setUser(u);
    if (!u) return;
    setCartItems((local) => {
      const merged = { ...(u.cartItems || {}) };
      for (const [id, qty] of Object.entries(local)) merged[id] = Math.max(merged[id] || 0, qty);
      const sameAsServer = JSON.stringify(merged) === JSON.stringify(u.cartItems || {});
      skipNextSync.current = sameAsServer;
      return merged;
    });
  }, []);

  const fetchUser = useCallback(async () => {
    const data = await api('/user/is-auth');
    if (data.success) applyUser(data.user);
    setAuthChecked(true);
  }, [applyUser]);

  const fetchSeller = useCallback(async () => {
    const data = await api('/seller/is-auth');
    setIsSeller(Boolean(data.success));
    setSellerChecked(true);
  }, []);

  const logout = async () => {
    await api('/user/logout');
    setUser(null);
    setCartItems({});
    toast.success('Logged out');
    navigate('/');
  };

  useEffect(() => {
    fetchProducts();
    fetchUser();
    fetchSeller();
  }, [fetchProducts, fetchUser, fetchSeller]);

  // Persist cart locally, and to the account when logged in (debounced).
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    } catch {
      /* ignore */
    }
    if (!user) return;
    if (skipNextSync.current) {
      skipNextSync.current = false;
      return;
    }
    const t = setTimeout(() => {
      api('/cart/update', { method: 'POST', body: { cartItems } });
    }, 500);
    return () => clearTimeout(t);
  }, [cartItems, user]);

  // Drop cart entries for products that no longer exist.
  useEffect(() => {
    if (productsLoading || !products.length) return;
    setCartItems((prev) => {
      const ids = new Set(products.map((p) => p._id));
      const stale = Object.keys(prev).filter((id) => !ids.has(id));
      if (!stale.length) return prev;
      const next = { ...prev };
      stale.forEach((id) => delete next[id]);
      return next;
    });
  }, [products, productsLoading]);

  const findProduct = (id) => products.find((p) => p._id === id);

  const addToCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    toast.success('Added to cart');
    const p = findProduct(itemId);
    if (p) track('add_to_cart', { currency: site.currencyCode, value: p.offerPrice, items: [toItem(p)] });
  };

  const updateCartItem = (itemId, quantity) => {
    setCartItems((prev) => ({ ...prev, [itemId]: quantity }));
    toast.success('Cart updated');
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const next = { ...prev };
      if (next[itemId]) {
        next[itemId] -= 1;
        if (next[itemId] <= 0) delete next[itemId];
      }
      return next;
    });
    toast.success('Removed from cart');
  };

  const clearCart = () => setCartItems({});

  const getCartCount = () => Object.values(cartItems).reduce((s, q) => s + q, 0);

  const getCartAmount = () => {
    let total = 0;
    for (const id in cartItems) {
      const p = findProduct(id);
      if (p && cartItems[id] > 0) total += p.offerPrice * cartItems[id];
    }
    return Math.round(total * 100) / 100;
  };

  const value = {
    navigate,
    user,
    setUser: applyUser,
    authChecked,
    logout,
    isSeller,
    setIsSeller,
    sellerChecked,
    showUserLogin,
    setShowUserLogin,
    products,
    productsLoading,
    fetchProducts,
    currency,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    cartItems,
    searchQuery,
    setSearchQuery,
    getCartAmount,
    getCartCount,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = () => useContext(AppContext);
