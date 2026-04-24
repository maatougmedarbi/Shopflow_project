import Image from "next/image";
import Link from "next/link";
import PropTypes from "prop-types";

export default function ProductCard({ product, onBuy, buying }) {
  const isOutOfStock = product.quantity === 0;
  let stockBadgeClass = "bg-green-100 text-green-600";
  let stockLabel = `${product.quantity} in stock`;

  if (isOutOfStock) {
    stockBadgeClass = "bg-gray-200 text-gray-500";
    stockLabel = "Out of stock";
  } else if (product.quantity <= 5) {
    stockBadgeClass = "bg-orange-100 text-orange-600";
    stockLabel = `Only ${product.quantity} left`;
  }

  let buttonClass = "mt-auto py-2.5 rounded-xl text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.98] transition shadow-md";
  let buttonLabel = "Buy Now";

  if (isOutOfStock) {
    buttonClass = "mt-auto py-2.5 rounded-xl text-sm font-semibold bg-gray-200 text-gray-400 cursor-not-allowed";
    buttonLabel = "Unavailable";
  } else if (buying) {
    buttonClass = "mt-auto py-2.5 rounded-xl text-sm font-semibold bg-blue-400 text-white cursor-not-allowed";
    buttonLabel = "Processing...";
  }

  return (
    <div className="bg-white/40 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">

      {product.imageUrl ? (
        <Image
          src={product.imageUrl}
          alt={product.name || "Product image"}
          width={800}
          height={440}
          unoptimized
          className="w-full h-44 object-cover rounded-xl mb-4 border border-white/30"
        />
      ) : (
        <div className="w-full h-44 rounded-xl mb-4 border border-dashed border-gray-300 bg-gray-100/70 flex items-center justify-center text-sm text-gray-500">
          No image
        </div>
      )}

      {/* STOCK & CATEGORY BADGE */}
      <div className="flex flex-wrap gap-2 items-center mb-3">
        <span
          className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-lg ${stockBadgeClass}`}
        >
          {stockLabel}
        </span>
        {product.categoryNames && (
          <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-500 border border-blue-100">
            {product.categoryNames}
          </span>
        )}
      </div>

      {/* NAME */}
      <Link href={`/products/${product.id}`} className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-blue-500 transition">
        {product.name}
      </Link>

      {/* DESCRIPTION */}
      <p className="text-sm text-gray-500 mb-4 line-clamp-2">
        {product.description || "No description available"}
      </p>

      {/* PRICE */}
      <div className="mb-4">
        {product.prixPromo && product.prixPromo < product.price ? (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-red-600">
              {Number(product.prixPromo).toFixed(2)}
            </span>
            <span className="text-sm text-gray-400 line-through">
              {Number(product.price).toFixed(2)}
            </span>
            <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded ml-auto">
              -{Math.round((1 - product.prixPromo / product.price) * 100)}%
            </span>
          </div>
        ) : (
          <div>
            <span className="text-2xl font-bold text-gray-900">
              {Number(product.price).toFixed(2)}
            </span>
          </div>
        )}
        <span className="text-xs text-gray-400 font-medium">DT</span>
      </div>

      {/* BUTTON */}
      <button
        onClick={() => onBuy(product.id)}
        disabled={isOutOfStock || buying}
        className={buttonClass}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    quantity: PropTypes.number.isRequired,
    imageUrl: PropTypes.string,
  }).isRequired,
  onBuy: PropTypes.func.isRequired,
  buying: PropTypes.bool,
};