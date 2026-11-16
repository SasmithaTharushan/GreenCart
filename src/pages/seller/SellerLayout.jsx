import { Link, NavLink, Outlet } from 'react-router-dom';
import toast from 'react-hot-toast';
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../lib/api';
import Seo from '../../components/Seo';

const sidebarLinks = [
  { name: 'Add Product', path: '/seller', icon: assets.add_icon },
  { name: 'Product List', path: '/seller/product-list', icon: assets.product_list_icon },
  { name: 'Orders', path: '/seller/orders', icon: assets.order_icon },
  { name: 'Marketing', path: '/seller/marketing', icon: assets.box_icon },
];

const SellerLayout = () => {
  const { setIsSeller, navigate } = useAppContext();

  const logout = async () => {
    await api('/seller/logout');
    setIsSeller(false);
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <>
      <Seo title="Seller Dashboard" noindex />
      <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white">
        <Link to="/"><img src={assets.logo} alt="GreenCart" className="cursor-pointer w-34 md:w-38" /></Link>
        <div className="flex items-center gap-5 text-gray-500">
          <p>Hi! Admin</p>
          <button onClick={logout} className="border rounded-full text-sm px-4 py-1 cursor-pointer">Logout</button>
        </div>
      </div>
      <div className="flex">
        <div className="md:w-64 w-16 border-r min-h-[calc(100vh-61px)] text-base border-gray-300 pt-4 flex flex-col shrink-0">
          {sidebarLinks.map((item) => (
            <NavLink to={item.path} key={item.name} end={item.path === '/seller'}
              className={({ isActive }) =>
                `flex items-center py-3 px-4 gap-3 ${isActive ? 'border-r-4 md:border-r-[6px] bg-primary/10 border-primary text-primary' : 'hover:bg-gray-100/90 border-white'}`
              }>
              <img src={item.icon} alt="" className="w-7 h-7" />
              <p className="md:block hidden text-center">{item.name}</p>
            </NavLink>
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default SellerLayout;
