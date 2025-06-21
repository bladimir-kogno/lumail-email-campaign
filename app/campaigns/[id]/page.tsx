import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

async function getCampaignWithStats(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      list: {
        select: {
          name: true,
          _count: {
            select: {
              subscribers: { where: { active: true } }
            }
          }
        }
      },
      emailLogs: {
        include: {
          subscriber: {
            select: {
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }
    }
  })

  if (!campaign) {
    return null
  }

  // Calculate stats
  const totalEmails = campaign.emailLogs.length
  const sentEmails = campaign.emailLogs.filter(log => log.sent).length
  const openedEmails = campaign.emailLogs.filter(log => log.opened).length
  const openRate = sentEmails > 0 ? (openedEmails / sentEmails * 100).toFixed(1) : '0.0'

  return {
    ...campaign,
    stats: {
      totalEmails,
      sentEmails,
      openedEmails,
      openRate
    }
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800'
    case 'SCHEDULED':
      return 'bg-yellow-100 text-yellow-800'
    case 'SENT':
      return 'bg-green-100 text-green-800'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default async function CampaignDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const campaign = await getCampaignWithStats(params.id)

  if (!campaign) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Link href="/campaigns" className="text-blue-600 hover:text-blue-500 text-sm">
            ← Back to Campaigns
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{campaign.name}</h1>
          <p className="text-gray-600">List: {campaign.list.name}</p>
        </div>
        <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
          {campaign.status}
        </span>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-2xl font-semibold text-blue-600">{campaign.stats.totalEmails}</p>
            <p className="text-sm text-gray-600">Total Recipients</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-2xl font-semibold text-green-600">{campaign.stats.sentEmails}</p>
            <p className="text-sm text-gray-600">Emails Sent</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-2xl font-semibold text-purple-600">{campaign.stats.openedEmails}</p>
            <p className="text-sm text-gray-600">Emails Opened</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-2xl font-semibold text-orange-600">{campaign.stats.openRate}%</p>
            <p className="text-sm text-gray-600">Open Rate</p>
          </div>
        </div>
      </div>

      {/* Campaign Details */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Campaign Details</h2>
          
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Subject</dt>
              <dd className="mt-1 text-sm text-gray-900">{campaign.subject}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(campaign.createdAt).toLocaleString()}
              </dd>
            </div>
            
            {campaign.scheduledAt && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Scheduled For</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(campaign.scheduledAt).toLocaleString()}
                </dd>
              </div>
            )}
            
            {campaign.sentAt && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Sent At</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(campaign.sentAt).toLocaleString()}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Email Content Preview */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Email Content</h2>
          <div className="border rounded-lg p-4 bg-gray-50">
            <iframe
              srcDoc={campaign.htmlContent}
              className="w-full h-96 border-none"
              title="Email Preview"
            />
          </div>
        </div>
      </div>

      {/* Email Recipients */}
      {campaign.emailLogs.length > 0 && (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Email Recipients</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sent At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Opened At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaign.emailLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {log.subscriber.firstName || log.subscriber.lastName
                              ? `${log.subscriber.firstName || ''} ${log.subscriber.lastName || ''}`.trim()
                              : 'No name'
                            }
                          </p>
                          <p className="text-sm text-gray-500">{log.subscriber.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          log.opened 
                            ? 'bg-green-100 text-green-800' 
                            : log.sent 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {log.opened ? 'Opened' : log.sent ? 'Sent' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.sentAt ? new Date(log.sentAt).toLocaleString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.openedAt ? new Date(log.openedAt).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
