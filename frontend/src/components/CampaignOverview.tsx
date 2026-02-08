import { useState, useEffect } from 'react'

interface Campaign {
  id: number
  name: string
  status: string
}

interface OverviewStats {
  total_contacts: number
  total_responded: number
  total_converted: number
  total_not_interested: number
  total_pending: number
  response_rate: number
}

interface Contact {
  id: number
  full_name: string
  contact_type: string
  email: string | null
  phone: string | null
  campaign_name: string | null
  response_status: string
  response_date: string | null
  relationships: Array<{
    type: string
    organisation: string
  }>
}

interface CampaignOverviewProps {
  onBack: () => void
}

export default function CampaignOverview({ onBack }: CampaignOverviewProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<number[]>([])
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [drillDownStatus, setDrillDownStatus] = useState<string | null>(null)
  const [drillDownContacts, setDrillDownContacts] = useState<Contact[]>([])
  const [showDrillDown, setShowDrillDown] = useState(false)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  useEffect(() => {
    fetchOverviewStats()
  }, [selectedCampaignIds])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/campaigns')
      const data = await response.json()
      setCampaigns(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      setLoading(false)
    }
  }

  const fetchOverviewStats = async () => {
    try {
      const campaignIdsParam = selectedCampaignIds.length > 0
        ? `?campaign_ids=${selectedCampaignIds.join(',')}`
        : ''

      const response = await fetch(`http://localhost:8000/api/campaigns/overview${campaignIdsParam}`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching overview stats:', error)
    }
  }

  const handleCampaignToggle = (campaignId: number) => {
    setSelectedCampaignIds(prev => {
      if (prev.includes(campaignId)) {
        return prev.filter(id => id !== campaignId)
      } else {
        return [...prev, campaignId]
      }
    })
  }

  const handleSelectAllCampaigns = () => {
    if (selectedCampaignIds.length === campaigns.length) {
      setSelectedCampaignIds([])
    } else {
      setSelectedCampaignIds(campaigns.map(c => c.id))
    }
  }

  const handleDrillDown = async (status: string) => {
    setDrillDownStatus(status)
    setShowDrillDown(true)

    try {
      const campaignIdsParam = selectedCampaignIds.length > 0
        ? `campaign_ids=${selectedCampaignIds.join(',')}&`
        : ''

      const response = await fetch(
        `http://localhost:8000/api/campaigns/contacts/filter?${campaignIdsParam}status=${status}`
      )
      const data = await response.json()
      setDrillDownContacts(data)
    } catch (error) {
      console.error('Error fetching drill-down contacts:', error)
    }
  }

  const handleBackFromDrillDown = () => {
    setShowDrillDown(false)
    setDrillDownStatus(null)
    setDrillDownContacts([])
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'converted': return 'Converted'
      case 'responded': return 'Responded'
      case 'not_interested': return 'Not Interested'
      case 'pending': return 'Pending'
      default: return status
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading campaign overview...</div>
  }

  if (showDrillDown && drillDownStatus) {
    return (
      <div>
        <button
          onClick={handleBackFromDrillDown}
          className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to overview
        </button>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {getStatusLabel(drillDownStatus)} Contacts
              {selectedCampaignIds.length > 0 && (
                <span className="text-sm text-gray-500 ml-2">
                  ({selectedCampaignIds.length} campaign{selectedCampaignIds.length !== 1 ? 's' : ''})
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {drillDownContacts.length} contact{drillDownContacts.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {drillDownContacts.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No contacts found with this status
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Response Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {drillDownContacts.map((contact) => (
                    <tr key={`${contact.id}-${contact.campaign_name}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{contact.full_name}</div>
                        {contact.email && (
                          <div className="text-sm text-gray-500">{contact.email}</div>
                        )}
                        {contact.relationships.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {contact.relationships[0].organisation}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          contact.contact_type === 'business'
                            ? 'bg-green-100 text-green-800'
                            : contact.contact_type === 'estate'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {contact.contact_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {contact.campaign_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contact.response_date ? new Date(contact.response_date).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
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
        Back to campaigns
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Campaign Overview</h2>
        <p className="text-sm text-gray-600 mt-1">
          Compare performance across all campaigns or select specific ones to analyze
        </p>
      </div>

      {/* Campaign Selector */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Select Campaigns</h3>
          <button
            onClick={handleSelectAllCampaigns}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {selectedCampaignIds.length === campaigns.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {campaigns.map((campaign) => (
            <label
              key={campaign.id}
              className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedCampaignIds.includes(campaign.id)}
                onChange={() => handleCampaignToggle(campaign.id)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm font-medium text-gray-900">{campaign.name}</span>
            </label>
          ))}
        </div>

        {selectedCampaignIds.length === 0 && (
          <p className="text-sm text-gray-500 mt-4 text-center">
            Showing all campaigns. Select specific campaigns to filter the overview.
          </p>
        )}
      </div>

      {/* Overview Stats */}
      {stats && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-gray-900">{stats.total_contacts}</div>
              <div className="text-sm text-gray-600 mt-1">Total Contacts</div>
              <div className="text-xs text-gray-500 mt-1">100%</div>
            </div>
            <div
              onClick={() => handleDrillDown('converted')}
              className="bg-green-50 p-4 rounded-lg cursor-pointer hover:bg-green-100 hover:shadow-md transition-all"
            >
              <div className="text-3xl font-bold text-green-600">{stats.total_converted}</div>
              <div className="text-sm text-gray-600 mt-1">Converted</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.total_contacts > 0
                  ? `${((stats.total_converted / stats.total_contacts) * 100).toFixed(1)}%`
                  : '0%'
                }
              </div>
            </div>
            <div
              onClick={() => handleDrillDown('responded')}
              className="bg-blue-50 p-4 rounded-lg cursor-pointer hover:bg-blue-100 hover:shadow-md transition-all"
            >
              <div className="text-3xl font-bold text-blue-600">{stats.total_responded}</div>
              <div className="text-sm text-gray-600 mt-1">Responded</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.total_contacts > 0
                  ? `${((stats.total_responded / stats.total_contacts) * 100).toFixed(1)}%`
                  : '0%'
                }
              </div>
            </div>
            <div
              onClick={() => handleDrillDown('not_interested')}
              className="bg-red-50 p-4 rounded-lg cursor-pointer hover:bg-red-100 hover:shadow-md transition-all"
            >
              <div className="text-3xl font-bold text-red-600">{stats.total_not_interested}</div>
              <div className="text-sm text-gray-600 mt-1">Not Interested</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.total_contacts > 0
                  ? `${((stats.total_not_interested / stats.total_contacts) * 100).toFixed(1)}%`
                  : '0%'
                }
              </div>
            </div>
            <div
              onClick={() => handleDrillDown('pending')}
              className="bg-yellow-50 p-4 rounded-lg cursor-pointer hover:bg-yellow-100 hover:shadow-md transition-all"
            >
              <div className="text-3xl font-bold text-yellow-600">{stats.total_pending}</div>
              <div className="text-sm text-gray-600 mt-1">Pending</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.total_contacts > 0
                  ? `${((stats.total_pending / stats.total_contacts) * 100).toFixed(1)}%`
                  : '0%'
                }
              </div>
            </div>
          </div>

          {/* Response Rate Card */}
          <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-900 mb-2">{stats.response_rate}%</div>
              <div className="text-lg text-gray-700 mb-1">Overall Response Rate</div>
              <div className="text-sm text-gray-500">
                {stats.total_responded + stats.total_converted} responses out of {stats.total_contacts} contacts
              </div>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Response Breakdown</h3>
            <div className="space-y-4">
              {/* Converted */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Converted</span>
                  <span className="text-sm text-gray-500">
                    {stats.total_converted} ({stats.total_contacts > 0
                      ? ((stats.total_converted / stats.total_contacts) * 100).toFixed(1)
                      : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-green-500 h-4 rounded-full transition-all"
                    style={{
                      width: `${stats.total_contacts > 0 ? (stats.total_converted / stats.total_contacts) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Responded */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Responded</span>
                  <span className="text-sm text-gray-500">
                    {stats.total_responded} ({stats.total_contacts > 0
                      ? ((stats.total_responded / stats.total_contacts) * 100).toFixed(1)
                      : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-500 h-4 rounded-full transition-all"
                    style={{
                      width: `${stats.total_contacts > 0 ? (stats.total_responded / stats.total_contacts) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Not Interested */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Not Interested</span>
                  <span className="text-sm text-gray-500">
                    {stats.total_not_interested} ({stats.total_contacts > 0
                      ? ((stats.total_not_interested / stats.total_contacts) * 100).toFixed(1)
                      : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-red-500 h-4 rounded-full transition-all"
                    style={{
                      width: `${stats.total_contacts > 0 ? (stats.total_not_interested / stats.total_contacts) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Pending */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Pending</span>
                  <span className="text-sm text-gray-500">
                    {stats.total_pending} ({stats.total_contacts > 0
                      ? ((stats.total_pending / stats.total_contacts) * 100).toFixed(1)
                      : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-yellow-500 h-4 rounded-full transition-all"
                    style={{
                      width: `${stats.total_contacts > 0 ? (stats.total_pending / stats.total_contacts) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                💡 <strong>Tip:</strong> Click on any metric card above to see the detailed list of contacts in that status category.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
