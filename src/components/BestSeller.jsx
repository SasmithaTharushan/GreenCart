import { useAppContext } from '../context/AppContext';
import ProductGrid from './ProductGrid';

const BestSeller = () => {
  const { products, productsLoading } = useAppContext();
  return (
    <div className="mt-16">
      <p className="text-2xl md:text-3xl font-medium">Best Sellers</p>
      <ProductGrid products={products.filter((p) => p.inStock).slice(0, 5)} loading={productsLoading} count={5} />
    </div>
  );
};

export default BestSeller;
