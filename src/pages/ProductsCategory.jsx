import { useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { categories } from '../assets/assets';
import ProductGrid from '../components/ProductGrid';
import Seo from '../components/Seo';

const ProductsCategory = () => {
  const { products, productsLoading } = useAppContext();
  const { category } = useParams();

  const searchCategory = categories.find((item) => item.path.toLowerCase() === category);
  const filtered = products.filter((p) => p.category.toLowerCase() === category);

  return (
    <div className="mt-16">
      <Seo
        title={searchCategory?.text || 'Category'}
        description={`Shop ${searchCategory?.text?.toLowerCase() || 'groceries'} online at GreenCart – fresh, affordable and delivered to your door.`}
      />
      {searchCategory && (
        <div className="flex flex-col items-end w-max">
          <p className="text-2xl font-medium">{searchCategory.text.toUpperCase()}</p>
          <div className="w-16 h-0.5 bg-primary rounded-full"></div>
        </div>
      )}
      <ProductGrid products={filtered} loading={productsLoading} empty="No products found in this category." />
    </div>
  );
};

export default ProductsCategory;
