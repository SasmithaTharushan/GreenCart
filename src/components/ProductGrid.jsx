import ProductCard from './ProductCard';

export const gridClass = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 mt-6';

const ProductGrid = ({ products, loading, count = 10, empty = 'No products found.' }) => {
  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="h-64 rounded-md bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }
  if (!products.length) {
    return (
      <div className="flex items-center justify-center h-[40vh]">
        <p className="text-xl font-medium text-primary text-center">{empty}</p>
      </div>
    );
  }
  return (
    <div className={gridClass}>
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
};

export default ProductGrid;
