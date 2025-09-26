export default function Custom500() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">500</h1>
        <p className="text-lg text-gray-600 mb-8">Server Error</p>
        <a
          href="/"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  )
}