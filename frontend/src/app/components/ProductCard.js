export default function ProductCard({ product, onBuy, buying }) {
  const isOutOfStock = product.quantity === 0;

  return (
    <div className="bg-white/40 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">

      {/* STOCK BADGE */}
      <div className="flex justify-between items-center mb-3">
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            isOutOfStock
              ? "bg-gray-200 text-gray-500"
              : product.quantity <= 5
              ? "bg-orange-100 text-orange-600"
              : "bg-green-100 text-green-600"
          }`}
        >
          {isOutOfStock
            ? "Out of stock"
            : product.quantity <= 5
            ? `Only ${product.quantity} left`
            : `${product.quantity} in stock`}
        </span>
      </div>

      {/* NAME */}
      <h2 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-blue-500 transition">
        {product.name}
      </h2>

      {/* DESCRIPTION */}
      <p className="text-sm text-gray-500 mb-4 line-clamp-2">
        {product.description || "No description available"}
      </p>

      {/* PRICE */}
      <div className="mb-4">
        <span className="text-2xl font-bold text-gray-900">
          {Number(product.price).toFixed(2)}
        </span>
        <span className="text-sm text-gray-500 ml-1">DT</span>
      </div>

      {/* BUTTON */}
      <button
        onClick={() => onBuy(product.id)}
        disabled={isOutOfStock || buying}
        className={
          isOutOfStock
            ? "mt-auto py-2.5 rounded-xl text-sm font-semibold bg-gray-200 text-gray-400 cursor-not-allowed"
            : buying
            ? "mt-auto py-2.5 rounded-xl text-sm font-semibold bg-blue-400 text-white cursor-not-allowed"
            : "mt-auto py-2.5 rounded-xl text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.98] transition shadow-md"
        }
      >
        {buying ? "Processing..." : isOutOfStock ? "Unavailable" : "Buy Now"}
      </button>
    </div>
  );
}