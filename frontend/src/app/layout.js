import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "ShopFlow — Modern E-Commerce",
  description:
    "Buy and manage products with ShopFlow, the modern e-commerce platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="min-h-screen flex flex-col font-[Inter] bg-gradient-to-br from-blue-50 via-white to-sky-100 text-gray-800">

        <Navbar />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="mt-auto bg-white/30 backdrop-blur-md border-t border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            
            <span className="text-sm font-semibold text-gray-700">
              Shop<span className="text-blue-500">Flow</span>
            </span>

            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} ShopFlow. All rights reserved.
            </p>

          </div>
        </footer>

      </body>
    </html>
  );
}