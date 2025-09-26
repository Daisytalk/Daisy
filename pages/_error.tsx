import { NextPageContext } from 'next'

interface ErrorProps {
  statusCode?: number
  hasGetInitialProps?: boolean
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          {statusCode || 'Client'} Error
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          {statusCode
            ? `A ${statusCode} error occurred on server`
            : 'An error occurred on client'}
        </p>
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

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error