import { useState, useEffect } from 'react'
import CustomerProductsSection from './CustomerProductsSection'

interface LinkedPerson {
  relationship_id: number
  person_id: number
  full_name: string
  contact_type: string
  email: string | null
  phone: string | null
  relationship_type: string
  created_at: string
}

interface OrganisationData {
  id: number
  full_name: string
  contact_type: string
  email: string | null
  phone: string | null
  notes: string | null
  created_at: string
  linked_people: LinkedPerson[]
}

interface Contact {
  id: number
  full_name: string
  contact_type: string
}

interface OrganisationDetailProps {
  orgId: number
  onBack: () => void
}

export default function OrganisationDetail({ orgId, onBack }: OrganisationDetailProps) {
  const [organisation, setOrganisation] = useState<OrganisationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([])
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null)
  const [relationshipType, setRelationshipType] = useState('')

  useEffect(() => {
    fetchOrganisationDetail()
  }, [orgId])

  const fetchOrganisationDetail = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/organisations/${orgId}`)
      const data = await response.json()
      setOrganisation(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching organisation:', error)
      setLoading(false)
    }
  }

  const fetchAvailableContacts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/contacts')
      const data = await response.json()

      // Filter to only individuals not already linked
      const linkedIds = organisation?.linked_people.map(p => p.person_id) || []
      const available = data.filter(
        (contact: Contact) =>
          contact.contact_type === 'individual' &&
          contact.id !== orgId &&
          !linkedIds.includes(contact.id)
      )
      setAvailableContacts(available)
    } catch (error) {
      console.error('Error fetching contacts:', error)
    }
  }

  const handleShowAddForm = () => {
    fetchAvailableContacts()
    setShowAddForm(true)
  }

  const handleAddRelationship = async () => {
    if (!selectedPersonId || !relationshipType) {
      alert('Please select a person and relationship type')
      return
    }

    try {
      await fetch('http://localhost:8000/api/relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_contact_id: selectedPersonId,
          to_contact_id: orgId,
          relationship_type: relationshipType
        })
      })

      setShowAddForm(false)
      setSelectedPersonId(null)
      setRelationshipType('')
      fetchOrganisationDetail()
    } catch (error) {
      console.error('Error adding relationship:', error)
      alert('Failed to add relationship')
    }
  }

  const handleRemoveRelationship = async (relationshipId: number, personName: string) => {
    if (!window.confirm(`Remove ${personName} from this organisation?`)) {
      return
    }

    try {
      await fetch(`http://localhost:8000/api/relationships/${relationshipId}`, {
        method: 'DELETE'
      })
      fetchOrganisationDetail()
    } catch (error) {
      console.error('Error removing relationship:', error)
      alert('Failed to remove relationship')
    }
  }

  const formatRelationshipType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  if (loading) {
    return <div className="text-center py-8">Loading organisation details...</div>
  }

  if (!organisation) {
    return <div className="text-center py-8">Organisation not found</div>
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

      {/* Organisation Details */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{organisation.full_name}</h2>
            <span className={`mt-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              organisation.contact_type === 'business'
                ? 'bg-green-100 text-green-800'
                : 'bg-purple-100 text-purple-800'
            }`}>
              {organisation.contact_type === 'business' ? 'Business' : 'Estate'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <span className="text-sm text-gray-500">Email:</span>
            <p className="text-base font-medium">{organisation.email || 'Not provided'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Phone:</span>
            <p className="text-base font-medium">{organisation.phone || 'Not provided'}</p>
          </div>
        </div>

        {organisation.notes && (
          <div className="mt-4">
            <span className="text-sm text-gray-500">Notes:</span>
            <p className="text-base mt-1">{organisation.notes}</p>
          </div>
        )}
      </div>

      {/* Linked People */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Linked People</h3>
          <button
            onClick={handleShowAddForm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Add Person
          </button>
        </div>

        {showAddForm && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Relationship</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="person" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Person
                </label>
                <select
                  id="person"
                  value={selectedPersonId || ''}
                  onChange={(e) => setSelectedPersonId(Number(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Choose a person...</option>
                  {availableContacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="relType" className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship Type
                </label>
                <select
                  id="relType"
                  value={relationshipType}
                  onChange={(e) => setRelationshipType(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Choose type...</option>
                  {organisation.contact_type === 'business' ? (
                    <>
                      <option value="works_for">Works For</option>
                      <option value="director_of">Director Of</option>
                      <option value="partner_of">Partner Of</option>
                      <option value="owner_of">Owner Of</option>
                      <option value="manages">Manages</option>
                    </>
                  ) : (
                    <>
                      <option value="member_of">Member Of</option>
                      <option value="trustee_of">Trustee Of</option>
                      <option value="beneficiary_of">Beneficiary Of</option>
                      <option value="executor_of">Executor Of</option>
                    </>
                  )}
                </select>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleAddRelationship}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                Add Relationship
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setSelectedPersonId(null)
                  setRelationshipType('')
                }}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {organisation.linked_people.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-500">No people linked to this organisation yet.</p>
            <p className="text-sm text-gray-500 mt-1">Click "Add Person" to create a relationship.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Relationship
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {organisation.linked_people.map((person) => (
                <tr key={person.relationship_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{person.full_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {formatRelationshipType(person.relationship_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{person.email || 'No email'}</div>
                    <div className="text-sm text-gray-500">{person.phone || 'No phone'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleRemoveRelationship(person.relationship_id, person.full_name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Products & Services Section */}
      <div className="mt-6">
        <CustomerProductsSection contactId={orgId} />
      </div>
    </div>
  )
}
