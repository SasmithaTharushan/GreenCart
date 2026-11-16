import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import ProductCard, { Stars } from '../components/ProductCard';
import Seo from '../components/Seo';
import NotFound from './NotFound';
import { site, whatsappLink } from '../config';
import { track, toItem } from '../lib/analytics';

const ProductDetails = () => {
  const { products, productsLoading, navigate, currency, addToCart } = useAppContext();
  const { id } = useParams();
  const [thumbnail, setThumbnail] = useState(null);

  const product = products.find((item) => item._id === id);

  const relatedProducts = useMemo(
    () => (product ? products.filter((p) => p.category === product.category && p._id !== product._id && p.inStock).slice(0, 5) : []),
    [products, product]
  );

  useEffect(() => {
    setThumbnail(product?.image?.[0] ?? null);
    if (product) track('view_item', { currency: site.currencyCode, value: product.offerPrice, items: [toItem(product)] });
  }, [product]);

  if (productsLoading) return <div className="mt-12 h-96 rounded bg-gray-100 animate-pulse" />;
  if (!product) return <NotFound message="We couldn't find that product." />;

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied');
      }
      track('share', { method: navigator.share ? 'native' : 'copy', item_id: product._id });
    } catch {
      /* user cancelled */
    }
  };

  const discount = product.price > product.offerPrice ? Math.round((1 - product.offerPrice / product.price) * 100) : 0;
  const askLink = whatsappLink(`Hi! I'm interested in ${product.name} (${window.location.href})`);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image.map((i) => (i.startsWith('http') ? i : site.url + i)),
    description: product.description.join('. '),
    category: product.category,
    offers: {
      '@type': 'Offer',
      price: product.offerPrice,
      priceCurrency: site.currencyCode,
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: site.url + window.location.pathname,
    },
  };

  return (
    <div className="mt-12">
      <Seo title={product.name} description={`${product.name} – ${product.description.join(', ')}. Order online at ${site.name}.`} image={product.image[0]} />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>

      <p className="text-sm">
        <Link to="/">Home</Link> /<Link to="/products"> Products</Link> /
        <Link to={`/products/${product.category.toLowerCase()}`}> {product.category}</Link> /
        <span className="text-primary"> {product.name}</span>
      </p>

      <div className="flex flex-col md:flex-row gap-16 mt-4">
        <div className="flex gap-3">
          <div className="flex flex-col gap-3">
            {product.image.map((image, index) => (
              <button key={image} onClick={() => setThumbnail(image)}
                className={`border max-w-24 rounded overflow-hidden cursor-pointer ${thumbnail === image ? 'border-primary' : 'border-gray-500/30'}`}>
                <img src={image} alt={`${product.name} ${index + 1}`} />
              </button>
            ))}
          </div>
          <div className="border border-gray-500/30 max-w-100 rounded overflow-hidden">
            {thumbnail && <img src={thumbnail} alt={product.name} />}
          </div>
        </div>

        <div className="text-sm w-full md:w-1/2">
          <h1 className="text-3xl font-medium">{product.name}</h1>
          <div className="flex items-center gap-0.5 mt-1">
            <Stars className="md:w-4 w-3.5" />
            <p className="text-base ml-2">(4)</p>
          </div>

          <div className="mt-6">
            <p className="text-gray-500/70 line-through">MRP: {currency}{product.price}</p>
            <p className="text-2xl font-medium">
              {currency}{product.offerPrice}
              {discount > 0 && <span className="ml-3 text-sm text-primary bg-primary/10 px-2 py-0.5 rounded">{discount}% off</span>}
            </p>
            <span className="text-gray-500/70">(inclusive of all taxes)</span>
          </div>

          <p className="text-base font-medium mt-6">About Product</p>
          <ul className="list-disc ml-4 text-gray-500/70">
            {product.description.map((desc) => (
              <li key={desc}>{desc}</li>
            ))}
          </ul>

          {product.inStock ? (
            <div className="flex items-center mt-10 gap-4 text-base">
              <button onClick={() => addToCart(product._id)}
                className="w-full py-3.5 cursor-pointer font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition">
                Add to Cart
              </button>
              <button onClick={() => { addToCart(product._id); navigate('/cart'); }}
                className="w-full py-3.5 cursor-pointer font-medium bg-primary text-white hover:bg-primary-dull transition">
                Buy now
              </button>
            </div>
          ) : (
            <p className="mt-10 text-base font-medium text-red-500">Currently out of stock</p>
          )}

          <div className="flex items-center gap-5 mt-5 text-sm">
            <button onClick={share} className="text-primary hover:underline cursor-pointer">Share this product</button>
            {askLink && (
              <a href={askLink} target="_blank" rel="noopener noreferrer" onClick={() => track('contact', { method: 'whatsapp' })}
                className="text-primary hover:underline">
                Ask on WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="flex flex-col items-center mt-20">
          <div className="flex flex-col items-center w-max">
            <p className="text-3xl font-medium">Related Products</p>
            <div className="w-20 h-0.5 bg-primary rounded-full mt-2"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6 w-full">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
          <button onClick={() => navigate('/products')}
            className="mx-auto cursor-pointer px-12 my-16 py-2.5 border rounded text-primary hover:bg-primary/10 transition">
            See more
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
