import { useState, useEffect } from 'react'

interface CustomerWithProduct {
  customer_product_id: number
  contact_id: number
  full_name: string
  contact_type: string
  email: string | null
  status: string
  start_date: string
  end_date: string | null
  actual_price: string | null
  notes: string | null
}

interface ProductDetailData {
  id: number
  name: string
  description: string | null
  status: string
  product_type: string | null
  version: number
  parent_product_id: number | null
  effective_date: string
  created_at: string
  updated_at: string
  base_price: string | null
  currency: string | null
  billing_frequency: string | null
  customers: CustomerWithProduct[]
}

interface ProductDetailProps {
  productId: number
  onBack: () => void
  onEdit: (product: any) => void
}

export default function ProductDetail({ productId, onBack, onEdit }: ProductDetailProps) {
  const [product, setProduct] = useState<ProductDetailData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProductDetail()
  }, [productId])

  const fetchProductDetail = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/products/${productId}`)
      const data = await response.json()
      setProduct(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching product:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading product details...</div>
  }

  if (!product) {
    return <div className="text-center py-8">Product not found</div>
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to list
      </button>

      {/* Product Details */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{product.name}</h2>
            <div className="mt-2 flex items-center space-x-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                product.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : product.status === 'inactive'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {product.status}
              </span>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                Version {product.version}
              </span>
            </div>
          </div>
          <button
            onClick={() => onEdit(product)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Edit Product
          </button>
        </div>

        {product.description && (
          <div className="mb-4">
            <span className="text-sm text-gray-500">Description:</span>
            <p className="text-base mt-1">{product.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {product.product_type && (
            <div>
              <span className="text-sm text-gray-500">Type:</span>
              <p className="text-base font-medium">{product.product_type}</p>
            </div>
          )}
          {product.base_price && (
            <div>
              <span className="text-sm text-gray-500">Price:</span>
              <p className="text-base font-medium">
                {product.currency === 'GBP' ? '£' : product.currency === 'USD' ? '$' : '€'}
                {product.base_price}
                {product.billing_frequency && ` (${product.billing_frequency})`}
              </p>
            </div>
          )}
          <div>
            <span className="text-sm text-gray-500">Effective Date:</span>
            <p className="text-base font-medium">{new Date(product.effective_date).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Created:</span>
            <p className="text-base font-medium">{new Date(product.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Customers */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Customers ({product.customers.length})
          </h3>
        </div>

        {product.customers.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-500">No customers are using this product yet.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {product.customers.map((customer) => (
                <tr key={customer.customer_product_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{customer.full_name}</div>
                    {customer.email && (
                      <div className="text-sm text-gray-500">{customer.email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      customer.contact_type === 'business'
                        ? 'bg-green-100 text-green-800'
                        : customer.contact_type === 'estate'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {customer.contact_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      customer.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : customer.status === 'ended'
                        ? 'bg-gray-100 text-gray-800'
                        : customer.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(customer.start_date).toLocaleDateString()}
                    </div>
                    {customer.end_date && (
                      <div className="text-xs text-gray-500">
                        Ended: {new Date(customer.end_date).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {customer.actual_price
                        ? `${product.currency === 'GBP' ? '£' : product.currency === 'USD' ? '$' : '€'}${customer.actual_price}`
                        : '-'}
                    </div>
                    {customer.notes && (
                      <div className="text-xs text-gray-500 truncate max-w-xs">{customer.notes}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
