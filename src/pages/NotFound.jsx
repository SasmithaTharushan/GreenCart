import { Link } from 'react-router-dom';
import Seo from '../components/Seo';

const NotFound = ({ message = "The page you're looking for doesn't exist." }) => (
  <div className="flex flex-col items-center justify-center text-center h-[60vh] gap-4">
    <Seo title="Page not found" noindex />
    <p className="text-6xl font-semibold text-primary">404</p>
    <p className="text-lg text-gray-500">{message}</p>
    <Link to="/products" className="px-8 py-2.5 bg-primary hover:bg-primary-dull text-white rounded transition">
      Keep shopping
    </Link>
  </div>
);

export default NotFound;
