import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import ProductGrid from '../components/ProductGrid';
import Seo from '../components/Seo';

const AllProducts = () => {
  const { products, productsLoading, searchQuery, setSearchQuery } = useAppContext();
  const q = searchQuery.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      products.filter(
        (p) => p.inStock && (!q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      ),
    [products, q]
  );

  return (
    <div className="mt-16 flex flex-col">
      <Seo title="All Products" description="Browse fresh vegetables, fruits, dairy, bakery, drinks and pantry staples at GreenCart." />
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex flex-col items-end w-max">
          <p className="text-2xl font-medium uppercase">{q ? `Results for “${searchQuery.trim()}”` : 'All products'}</p>
          <div className="w-16 h-0.5 bg-primary rounded-full"></div>
        </div>
        {q && (
          <button onClick={() => setSearchQuery('')} className="text-sm text-primary hover:underline cursor-pointer">
            Clear search
          </button>
        )}
      </div>
      <ProductGrid products={filtered} loading={productsLoading} empty={q ? 'No products match your search.' : 'No products yet.'} />
    </div>
  );
};

export default AllProducts;
