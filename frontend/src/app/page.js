import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-20">
      
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">

        {/* LEFT */}
        <div>
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-600 border border-blue-200">
            Modern E-Commerce Platform
          </span>

          <h1 className="mt-6 text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
            Shop smarter with{" "}
            <span className="bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent">
              ShopFlow
            </span>
          </h1>

          <p className="mt-6 text-lg text-gray-600 max-w-xl">
            Discover products, place orders instantly, and manage everything
            in one modern and intuitive platform.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/products"
              className="px-6 py-3 rounded-2xl bg-blue-500 text-white font-semibold hover:bg-blue-600 shadow-lg transition"
            >
              Browse Products
            </Link>

            <Link
              href="/signup"
              className="px-6 py-3 rounded-2xl bg-white/40 backdrop-blur-md border border-white/20 text-gray-800 font-semibold hover:bg-white/60 shadow transition"
            >
              Create account
            </Link>
          </div>
        </div>

        {/* RIGHT (GLASS CARD) */}
        <div className="relative">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-sky-300/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-52 h-52 bg-blue-300/30 rounded-full blur-3xl" />

          <div className="relative bg-white/40 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl p-8">
            <div className="grid grid-cols-2 gap-4">

              <div className="rounded-2xl bg-white/50 p-5 shadow">
                <p className="text-sm text-gray-500">Products</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">Smart</p>
              </div>

              <div className="rounded-2xl bg-white/50 p-5 shadow">
                <p className="text-sm text-gray-500">Orders</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">Fast</p>
              </div>

              <div className="rounded-2xl bg-white/50 p-5 shadow">
                <p className="text-sm text-gray-500">Security</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">JWT</p>
              </div>

              <div className="rounded-2xl bg-white/50 p-5 shadow">
                <p className="text-sm text-gray-500">Design</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">Modern</p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}