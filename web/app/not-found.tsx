import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-pink-600">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-white">Page Not Found</h2>
        <p className="text-pink-300/70 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link 
          href="/"
          className="inline-block px-6 py-3 bg-gradient-to-r from-black to-pink-950/50 text-white rounded-lg hover:from-pink-950/30 hover:to-black transition-all duration-300 font-medium border-2 border-pink-300/50 shadow-lg shadow-pink-500/10"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
} 