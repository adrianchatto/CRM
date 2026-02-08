import { useState, useEffect } from 'react'
import ContactList from './components/ContactList'
import ContactForm from './components/ContactForm'
import Dashboard from './components/Dashboard'
import Campaigns from './components/Campaigns'
import CompaniesEstates from './components/CompaniesEstates'

export interface Contact {
  id?: number
  full_name: string
  contact_type: string
  email?: string
  phone?: string
  company_name?: string
  notes?: string
  created_at?: string
}

function App() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contacts' | 'campaigns' | 'organisations'>('dashboard')

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/contacts')
      const data = await response.json()
      setContacts(data)
    } catch (error) {
      console.error('Error fetching contacts:', error)
    }
  }

  const handleSaveContact = async (contact: Contact) => {
    try {
      if (contact.id) {
        // Update existing contact
        await fetch(`http://localhost:8000/api/contacts/${contact.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contact),
        })
      } else {
        // Create new contact
        await fetch('http://localhost:8000/api/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contact),
        })
      }
      fetchContacts()
      setShowForm(false)
      setEditingContact(null)
    } catch (error) {
      console.error('Error saving contact:', error)
    }
  }

  const handleDeleteContact = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await fetch(`http://localhost:8000/api/contacts/${id}`, {
          method: 'DELETE',
        })
        fetchContacts()
      } catch (error) {
        console.error('Error deleting contact:', error)
      }
    }
  }

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact)
    setShowForm(true)
  }

  const handleNewContact = () => {
    setEditingContact(null)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingContact(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CRM MVP</h1>
              <p className="text-sm text-gray-500">Accountancy & Estate Management</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Demo Mode</span>
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'contacts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Contacts
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'campaigns'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Campaigns
            </button>
            <button
              onClick={() => setActiveTab('organisations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'organisations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Companies & Estates
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard contacts={contacts} onNavigate={setActiveTab} />
        )}

        {activeTab === 'contacts' && (
          <>
            {showForm ? (
              <ContactForm
                contact={editingContact}
                onSave={handleSaveContact}
                onCancel={handleCancel}
              />
            ) : (
              <ContactList
                contacts={contacts}
                onEdit={handleEditContact}
                onDelete={handleDeleteContact}
                onNew={handleNewContact}
              />
            )}
          </>
        )}

        {activeTab === 'campaigns' && (
          <Campaigns />
        )}

        {activeTab === 'organisations' && (
          <CompaniesEstates />
        )}
      </main>
    </div>
  )
}

export default App
