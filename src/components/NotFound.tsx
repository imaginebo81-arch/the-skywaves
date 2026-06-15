import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <Helmet>
        <title>Page Not Found - Skywaves Educare</title>
      </Helmet>
      <h1 className="text-6xl md:text-8xl font-bold text-[#151b23] mb-4">404</h1>
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">Page Not Found</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-primary py-3 px-8 uppercase font-bold tracking-wider">
        Back to Home
      </Link>
    </div>
  );
}
