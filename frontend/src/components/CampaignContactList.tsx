import { useState, useEffect } from 'react'

interface Relationship {
  type: string
  organisation: string
}

interface CampaignContact {
  id: number
  full_name: string
  contact_type: string
  email: string | null
  phone: string | null
  response_status: string
  response_date: string | null
  relationships: Relationship[]
}

interface CampaignContactListProps {
  campaignId: number
  campaignName: string
  status: string
  onBack: () => void
}

export default function CampaignContactList({ campaignId, campaignName, status, onBack }: CampaignContactListProps) {
  const [contacts, setContacts] = useState<CampaignContact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContacts()
  }, [campaignId, status])

  const fetchContacts = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/campaigns/${campaignId}/contacts?status=${status}`
      )
      const data = await response.json()
      setContacts(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching campaign contacts:', error)
      setLoading(false)
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      converted: 'Converted',
      responded: 'Responded',
      not_interested: 'Not Interested',
      pending: 'Pending'
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      converted: 'bg-green-100 text-green-800',
      responded: 'bg-blue-100 text-blue-800',
      not_interested: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const formatRelationships = (relationships: Relationship[]) => {
    if (relationships.length === 0) return 'No relationships'
    return relationships.map(rel => `${rel.type.replace('_', ' ')} ${rel.organisation}`).join(', ')
  }

  if (loading) {
    return <div className="text-center py-8">Loading contacts...</div>
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
        Back to campaign
      </button>

      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">{campaignName}</h2>
        <div className="flex items-center">
          <span className="text-gray-600 mr-2">Contacts with status:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
            {getStatusLabel(status)}
          </span>
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No contacts found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No contacts with status "{getStatusLabel(status)}" for this campaign.
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
                  Relationships
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Response Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{contact.full_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                      {contact.contact_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{contact.email || 'No email'}</div>
                    <div className="text-sm text-gray-500">{contact.phone || 'No phone'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {formatRelationships(contact.relationships)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contact.response_date || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-700">
              Showing {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
