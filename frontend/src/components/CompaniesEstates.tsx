import { useState, useEffect } from 'react'
import OrganisationDetail from './OrganisationDetail'

interface Organisation {
  id: number
  full_name: string
  contact_type: string
  email: string | null
  phone: string | null
  notes: string | null
  linked_people_count: number
}

export default function CompaniesEstates() {
  const [organisations, setOrganisations] = useState<Organisation[]>([])
  const [filteredOrganisations, setFilteredOrganisations] = useState<Organisation[]>([])
  const [selectedOrg, setSelectedOrg] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'business' | 'estate'>('all')

  useEffect(() => {
    fetchOrganisations()
  }, [])

  useEffect(() => {
    filterOrganisations()
  }, [organisations, searchTerm, typeFilter])

  const fetchOrganisations = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/organisations')
      const data = await response.json()
      setOrganisations(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching organisations:', error)
      setLoading(false)
    }
  }

  const filterOrganisations = () => {
    let filtered = organisations

    if (typeFilter !== 'all') {
      filtered = filtered.filter(org => org.contact_type === typeFilter)
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(org =>
        org.full_name.toLowerCase().includes(search) ||
        (org.email && org.email.toLowerCase().includes(search))
      )
    }

    setFilteredOrganisations(filtered)
  }

  const handleViewOrganisation = (orgId: number) => {
    setSelectedOrg(orgId)
  }

  const handleBackToList = () => {
    setSelectedOrg(null)
    fetchOrganisations() // Refresh in case relationships changed
  }

  if (selectedOrg) {
    return <OrganisationDetail orgId={selectedOrg} onBack={handleBackToList} />
  }

  if (loading) {
    return <div className="text-center py-8">Loading organisations...</div>
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Companies & Estates</h2>
        <p className="mt-2 text-sm text-gray-700">
          View and manage business and estate contacts with their linked people.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                typeFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('business')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                typeFilter === 'business'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Business
            </button>
            <button
              onClick={() => setTypeFilter('estate')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                typeFilter === 'estate'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Estate
            </button>
          </div>
        </div>
      </div>

      {/* Organisation List */}
      {filteredOrganisations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No organisations found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || typeFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'No companies or estates in the system yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Linked People
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrganisations.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{org.full_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      org.contact_type === 'business'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {org.contact_type === 'business' ? 'Business' : 'Estate'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{org.email || 'No email'}</div>
                    <div className="text-sm text-gray-500">{org.phone || 'No phone'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {org.linked_people_count} {org.linked_people_count === 1 ? 'person' : 'people'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewOrganisation(org.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-700">
              Showing {filteredOrganisations.length} {filteredOrganisations.length === 1 ? 'organisation' : 'organisations'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
