import { useState, useEffect } from 'react'
import CampaignContactList from './CampaignContactList'

interface Campaign {
  id: number
  name: string
  description: string
  channel: string
  send_date: string
  status: string
  created_at: string
}

interface CampaignDetails extends Campaign {
  stats: {
    total_sent: number
    responded: number
    converted: number
    not_interested: number
    pending: number
    response_rate: number
  }
}

type ViewMode = 'list' | 'details' | 'contacts'

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignDetails | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCampaigns()
  }, [])

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

  const fetchCampaignDetails = async (campaignId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/campaigns/${campaignId}`)
      const data = await response.json()
      setSelectedCampaign(data)
    } catch (error) {
      console.error('Error fetching campaign details:', error)
    }
  }

  const handleViewDetails = (campaign: Campaign) => {
    fetchCampaignDetails(campaign.id)
    setViewMode('details')
  }

  const handleBackToList = () => {
    setSelectedCampaign(null)
    setViewMode('list')
  }

  const handleViewContacts = (status: string) => {
    setSelectedStatus(status)
    setViewMode('contacts')
  }

  const handleBackToDetails = () => {
    setViewMode('details')
  }

  if (loading) {
    return <div className="text-center py-8">Loading campaigns...</div>
  }

  if (viewMode === 'contacts' && selectedCampaign) {
    return (
      <CampaignContactList
        campaignId={selectedCampaign.id}
        campaignName={selectedCampaign.name}
        status={selectedStatus}
        onBack={handleBackToDetails}
      />
    )
  }

  if (viewMode === 'details' && selectedCampaign) {
    const stats = selectedCampaign.stats
    return (
      <div>
        <button
          onClick={handleBackToList}
          className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to campaigns
        </button>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">{selectedCampaign.name}</h2>
          <p className="text-gray-600 mb-6">{selectedCampaign.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-sm text-gray-500">Channel:</span>
              <p className="text-lg font-medium capitalize">{selectedCampaign.channel}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Send Date:</span>
              <p className="text-lg font-medium">{selectedCampaign.send_date}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Campaign Performance</h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
              <div
                className="bg-gray-50 p-4 rounded-lg cursor-default"
              >
                <div className="text-2xl font-bold text-gray-900">{stats.total_sent}</div>
                <div className="text-sm text-gray-500">Total Sent</div>
              </div>
              <div
                onClick={() => handleViewContacts('converted')}
                className="bg-green-50 p-4 rounded-lg cursor-pointer hover:bg-green-100 hover:shadow-md transition-all"
              >
                <div className="text-2xl font-bold text-green-600">{stats.converted}</div>
                <div className="text-sm text-gray-500">Converted</div>
              </div>
              <div
                onClick={() => handleViewContacts('responded')}
                className="bg-blue-50 p-4 rounded-lg cursor-pointer hover:bg-blue-100 hover:shadow-md transition-all"
              >
                <div className="text-2xl font-bold text-blue-600">{stats.responded}</div>
                <div className="text-sm text-gray-500">Responded</div>
              </div>
              <div
                onClick={() => handleViewContacts('not_interested')}
                className="bg-red-50 p-4 rounded-lg cursor-pointer hover:bg-red-100 hover:shadow-md transition-all"
              >
                <div className="text-2xl font-bold text-red-600">{stats.not_interested}</div>
                <div className="text-sm text-gray-500">Not Interested</div>
              </div>
              <div
                onClick={() => handleViewContacts('pending')}
                className="bg-yellow-50 p-4 rounded-lg cursor-pointer hover:bg-yellow-100 hover:shadow-md transition-all"
              >
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
            </div>

            <div className="bg-blue-100 border border-blue-300 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-blue-900 mb-2">{stats.response_rate}%</div>
              <div className="text-blue-800">Overall Response Rate</div>
              <div className="text-sm text-blue-700 mt-1">
                ({stats.responded + stats.converted} responses out of {stats.total_sent} contacts)
              </div>
            </div>

            <div className="mt-6">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <span className="text-xs font-semibold inline-block text-gray-600">
                    Response Breakdown
                  </span>
                </div>
                <div className="overflow-hidden h-6 text-xs flex rounded bg-gray-200">
                  {stats.converted > 0 && (
                    <div
                      style={{ width: `${(stats.converted / stats.total_sent) * 100}%` }}
                      className="bg-green-500 flex items-center justify-center text-white font-semibold"
                    >
                      {((stats.converted / stats.total_sent) * 100).toFixed(0)}%
                    </div>
                  )}
                  {stats.responded > 0 && (
                    <div
                      style={{ width: `${(stats.responded / stats.total_sent) * 100}%` }}
                      className="bg-blue-500 flex items-center justify-center text-white font-semibold"
                    >
                      {((stats.responded / stats.total_sent) * 100).toFixed(0)}%
                    </div>
                  )}
                  {stats.not_interested > 0 && (
                    <div
                      style={{ width: `${(stats.not_interested / stats.total_sent) * 100}%` }}
                      className="bg-red-400 flex items-center justify-center text-white font-semibold"
                    >
                      {((stats.not_interested / stats.total_sent) * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  <span>✅ Converted</span>
                  <span>💬 Responded</span>
                  <span>❌ Not Interested</span>
                  <span>⏳ Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Campaigns</h2>
        <p className="mt-2 text-sm text-gray-700">
          Track your marketing campaigns and measure their effectiveness.
        </p>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No campaigns yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first campaign.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white shadow-sm rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewDetails(campaign)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{campaign.description}</p>
                  <div className="flex items-center mt-3 text-sm text-gray-500">
                    <span className="flex items-center mr-4">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      {campaign.channel}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {campaign.send_date}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {campaign.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
