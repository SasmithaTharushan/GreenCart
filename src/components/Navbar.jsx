import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import { track } from '../lib/analytics';

const SearchBox = ({ className = '' }) => {
  const { searchQuery, setSearchQuery } = useAppContext();
  return (
    <div className={`items-center text-sm gap-2 border border-gray-300 px-3 rounded-full ${className}`}>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
        type="search"
        placeholder="Search products"
        aria-label="Search products"
      />
      <img src={assets.search_icon} alt="" className="w-4 h-4" />
    </div>
  );
};

const CartIcon = () => {
  const { navigate, getCartCount } = useAppContext();
  return (
    <button onClick={() => navigate('/cart')} className="relative cursor-pointer" aria-label="Open cart">
      <img src={assets.nav_cart_icon} alt="" className="w-6 opacity-80" />
      <span className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full flex items-center justify-center">
        {getCartCount()}
      </span>
    </button>
  );
};

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, logout, setShowUserLogin, navigate, searchQuery } = useAppContext();
  const { pathname } = useLocation();

  // Jump to the product list when the user starts searching.
  useEffect(() => {
    if (searchQuery.trim().length > 0 && pathname !== '/products') navigate('/products');
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (searchQuery.trim().length < 3) return;
    const t = setTimeout(() => track('search', { search_term: searchQuery.trim() }), 1200);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative transition-all">
      <NavLink to="/" aria-label="GreenCart home">
        <img className="h-9" src={assets.logo} alt="GreenCart" />
      </NavLink>

      {/* Desktop Menu */}
      <div className="hidden sm:flex items-center gap-8">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/products">All Products</NavLink>
        <NavLink to="/contact">Contact</NavLink>

        <SearchBox className="hidden lg:flex" />
        <CartIcon />

        {!user ? (
          <button onClick={() => setShowUserLogin(true)}
            className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition text-white rounded-full">
            Login
          </button>
        ) : (
          <div className="relative group">
            <img src={assets.profile_icon} className="w-10" alt="Account" />
            <ul className="hidden group-hover:block absolute top-10 right-0 bg-white shadow border border-gray-200 py-2.5 w-36 rounded-md text-sm z-40">
              <li className="px-3 pb-1.5 text-xs text-gray-400 truncate">Hi, {user.name.split(' ')[0]}</li>
              <li onClick={() => navigate('/my-orders')} className="p-1.5 pl-3 hover:bg-primary/10 cursor-pointer">My Orders</li>
              <li onClick={logout} className="p-1.5 pl-3 hover:bg-primary/10 cursor-pointer">Logout</li>
            </ul>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6 sm:hidden">
        <CartIcon />
        <button onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
          <img src={assets.menu_icon} alt="" />
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="flex absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex-col items-start gap-3 px-5 text-sm sm:hidden z-40">
          <SearchBox className="flex w-full" />
          <NavLink to="/">Home</NavLink>
          <NavLink to="/products">All Products</NavLink>
          {user && <NavLink to="/my-orders">My Orders</NavLink>}
          <NavLink to="/contact">Contact</NavLink>
          {!user ? (
            <button onClick={() => { setOpen(false); setShowUserLogin(true); }}
              className="cursor-pointer px-6 py-2 mt-2 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm">
              Login
            </button>
          ) : (
            <button onClick={() => { logout(); setOpen(false); }}
              className="cursor-pointer px-6 py-2 mt-2 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm">
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
