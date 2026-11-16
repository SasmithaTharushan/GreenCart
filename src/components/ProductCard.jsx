import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';

export const Stars = ({ rating = 4, className = 'md:w-3.5 w-3' }) =>
  Array.from({ length: 5 }, (_, i) => (
    <img key={i} className={className} src={i < rating ? assets.star_icon : assets.star_dull_icon} alt="" />
  ));

const ProductCard = ({ product }) => {
  const { currency, addToCart, removeFromCart, cartItems, navigate } = useAppContext();
  if (!product) return null;
  const url = `/products/${product.category.toLowerCase()}/${product._id}`;

  return (
    <div onClick={() => navigate(url)}
      className="border border-gray-500/20 rounded-md md:px-4 px-3 py-2 bg-white w-full min-w-0 cursor-pointer hover:shadow-sm transition">
      <div className="group flex items-center justify-center px-2 aspect-square">
        <img className="group-hover:scale-105 transition max-w-26 md:max-w-36" src={product.image[0]} alt={product.name} loading="lazy" />
      </div>
      <div className="text-gray-500/60 text-sm">
        <p>{product.category}</p>
        <p className="text-gray-700 font-medium text-lg truncate w-full">{product.name}</p>
        <div className="flex items-center gap-0.5">
          <Stars />
          <p>(4)</p>
        </div>
        <div className="flex flex-wrap items-end justify-between mt-3 gap-2">
          <p className="md:text-xl text-base font-medium text-primary whitespace-nowrap">
            {currency}{product.offerPrice}{' '}
            <span className="text-gray-500/60 md:text-sm text-xs line-through">{currency}{product.price}</span>
          </p>
          <div onClick={(e) => e.stopPropagation()} className="text-primary">
            {!product.inStock ? (
              <span className="text-xs text-gray-400">Out of stock</span>
            ) : !cartItems[product._id] ? (
              <button className="flex items-center justify-center gap-1 bg-primary/10 border border-primary/40 md:w-[80px] w-[64px] h-[34px] rounded cursor-pointer"
                onClick={() => addToCart(product._id)}>
                <img src={assets.cart_icon} alt="" />
                Add
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 md:w-20 w-16 h-[34px] bg-primary/25 rounded select-none">
                <button onClick={() => removeFromCart(product._id)} className="cursor-pointer text-md px-2 h-full" aria-label="Decrease quantity">-</button>
                <span className="w-5 text-center">{cartItems[product._id]}</span>
                <button onClick={() => addToCart(product._id)} className="cursor-pointer text-md px-2 h-full" aria-label="Increase quantity">+</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
