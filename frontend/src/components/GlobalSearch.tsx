import { useState, useEffect, useRef } from 'react'

interface SearchResult {
  id: number
  full_name: string
  contact_type: string
  email: string | null
  company_name: string | null
  linked_organisations: Array<{
    name: string
    type: string
  }>
}

interface GlobalSearchProps {
  onSelectContact: (contactId: number, contactType: string) => void
}

export default function GlobalSearch({ onSelectContact }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const searchContacts = async () => {
      if (query.trim().length < 2) {
        setResults([])
        setShowResults(false)
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`http://localhost:8000/api/contacts/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setResults(data)
        setShowResults(true)
      } catch (error) {
        console.error('Error searching contacts:', error)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(searchContacts, 300)
    return () => clearTimeout(debounce)
  }, [query])

  const handleSelectContact = (contactId: number, contactType: string) => {
    setQuery('')
    setResults([])
    setShowResults(false)
    onSelectContact(contactId, contactType)
  }

  const getContactTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'business':
        return 'bg-green-100 text-green-800'
      case 'estate':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search contacts..."
          className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {showResults && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-y-auto">
          {loading && (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              Searching...
            </div>
          )}

          {!loading && results.length === 0 && query.trim().length >= 2 && (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              No contacts found matching "{query}"
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelectContact(result.id, result.contact_type)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {result.full_name}
                        </span>
                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getContactTypeBadgeColor(result.contact_type)}`}>
                          {result.contact_type}
                        </span>
                      </div>

                      {result.email && (
                        <div className="text-xs text-gray-600 mt-1">
                          {result.email}
                        </div>
                      )}

                      {result.contact_type === 'individual' && result.linked_organisations.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {result.linked_organisations.map((org, idx) => (
                            <span key={idx}>
                              {org.type === 'works_for' && '💼'}
                              {org.type === 'member_of' && '👥'}
                              {org.type === 'manages' && '⭐'} {org.name}
                              {idx < result.linked_organisations.length - 1 && ', '}
                            </span>
                          ))}
                        </div>
                      )}

                      {(result.contact_type === 'business' || result.contact_type === 'estate') && result.company_name && (
                        <div className="text-xs text-gray-500 mt-1">
                          {result.company_name}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
