import { useState, useEffect } from 'react'

interface CustomerProduct {
  customer_product_id: number
  product_id: number
  product_name: string
  product_type: string | null
  status: string
  start_date: string
  end_date: string | null
  actual_price: string | null
  notes: string | null
}

interface Product {
  id: number
  name: string
  product_type: string | null
  base_price: string | null
  status: string
}

interface CustomerProductsSectionProps {
  contactId: number
}

export default function CustomerProductsSection({ contactId }: CustomerProductsSectionProps) {
  const [customerProducts, setCustomerProducts] = useState<CustomerProduct[]>([])
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [startDate, setStartDate] = useState('')
  const [actualPrice, setActualPrice] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomerProducts()
  }, [contactId])

  const fetchCustomerProducts = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/contacts/${contactId}/products`)
      const data = await response.json()
      setCustomerProducts(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching customer products:', error)
      setLoading(false)
    }
  }

  const fetchAvailableProducts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/products?status=active')
      const data = await response.json()

      // Filter out products already assigned to this customer
      const assignedProductIds = customerProducts
        .filter(cp => cp.status === 'active')
        .map(cp => cp.product_id)
      const available = data.filter((p: Product) => !assignedProductIds.includes(p.id))

      setAvailableProducts(available)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleShowAddForm = () => {
    fetchAvailableProducts()
    setStartDate(new Date().toISOString().split('T')[0])
    setShowAddForm(true)
  }

  const handleAddProduct = async () => {
    if (!selectedProductId) {
      alert('Please select a product')
      return
    }

    try {
      await fetch('http://localhost:8000/api/customer-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_id: contactId,
          product_id: selectedProductId,
          status: 'active',
          start_date: new Date(startDate).toISOString(),
          actual_price: actualPrice || null,
          notes: notes || null
        })
      })

      setShowAddForm(false)
      setSelectedProductId(null)
      setActualPrice('')
      setNotes('')
      fetchCustomerProducts()
    } catch (error) {
      console.error('Error adding product:', error)
      alert('Failed to add product')
    }
  }

  const handleEndProduct = async (customerProductId: number, productName: string) => {
    if (!window.confirm(`End ${productName} for this customer?`)) {
      return
    }

    try {
      await fetch(`http://localhost:8000/api/customer-products/${customerProductId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ended',
          end_date: new Date().toISOString()
        })
      })
      fetchCustomerProducts()
    } catch (error) {
      console.error('Error ending product:', error)
      alert('Failed to end product')
    }
  }

  const handleRemoveProduct = async (customerProductId: number, productName: string) => {
    if (!window.confirm(`Remove ${productName} from this customer? This cannot be undone.`)) {
      return
    }

    try {
      await fetch(`http://localhost:8000/api/customer-products/${customerProductId}`, {
        method: 'DELETE'
      })
      fetchCustomerProducts()
    } catch (error) {
      console.error('Error removing product:', error)
      alert('Failed to remove product')
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading products...</div>
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Products & Services</h3>
        <button
          onClick={handleShowAddForm}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          Add Product
        </button>
      </div>

      {showAddForm && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Add Product/Service</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">
                Select Product
              </label>
              <select
                id="product"
                value={selectedProductId || ''}
                onChange={(e) => setSelectedProductId(Number(e.target.value))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Choose a product...</option>
                {availableProducts.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                    {product.base_price && ` (£${product.base_price})`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="actualPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Custom Price (optional)
              </label>
              <input
                type="text"
                id="actualPrice"
                value={actualPrice}
                onChange={(e) => setActualPrice(e.target.value)}
                placeholder="500.00"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <input
                type="text"
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special terms, discounts, etc."
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleAddProduct}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              Add Product
            </button>
            <button
              onClick={() => {
                setShowAddForm(false)
                setSelectedProductId(null)
                setActualPrice('')
                setNotes('')
              }}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {customerProducts.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-gray-500">No products assigned to this customer yet.</p>
          <p className="text-sm text-gray-500 mt-1">Click "Add Product" to assign a product or service.</p>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
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
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customerProducts.map((cp) => (
              <tr key={cp.customer_product_id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{cp.product_name}</div>
                  {cp.notes && (
                    <div className="text-xs text-gray-500 truncate max-w-xs">{cp.notes}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{cp.product_type || '-'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    cp.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : cp.status === 'ended'
                      ? 'bg-gray-100 text-gray-800'
                      : cp.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {cp.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(cp.start_date).toLocaleDateString()}
                  </div>
                  {cp.end_date && (
                    <div className="text-xs text-gray-500">
                      Ended: {new Date(cp.end_date).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {cp.actual_price ? `£${cp.actual_price}` : '-'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {cp.status === 'active' && (
                    <>
                      <button
                        onClick={() => handleEndProduct(cp.customer_product_id, cp.product_name)}
                        className="text-yellow-600 hover:text-yellow-900 mr-4"
                      >
                        End
                      </button>
                      <button
                        onClick={() => handleRemoveProduct(cp.customer_product_id, cp.product_name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </>
                  )}
                  {cp.status !== 'active' && (
                    <button
                      onClick={() => handleRemoveProduct(cp.customer_product_id, cp.product_name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
