import Link from 'next/link'
import { prisma } from '@/lib/prisma'

async function getCampaigns() {
  return await prisma.campaign.findMany({
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
      _count: {
        select: {
          emailLogs: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
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

export default async function CampaignsPage() {
  const campaigns = await getCampaigns()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Email Campaigns</h1>
        <Link href="/campaigns/new" className="btn btn-primary">
          Create Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first email campaign.</p>
          <div className="mt-6">
            <Link href="/campaigns/new" className="btn btn-primary">
              Create Campaign
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {campaigns.map((campaign) => (
              <li key={campaign.id}>
                <div className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          <Link href={`/campaigns/${campaign.id}`} className="hover:underline">
                            {campaign.name}
                          </Link>
                        </p>
                        <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        Subject: {campaign.subject}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        List: {campaign.list.name} ({campaign.list._count.subscribers} subscribers)
                      </p>
                      <div className="mt-2 flex items-center text-xs text-gray-400 space-x-4">
                        <span>Created {new Date(campaign.createdAt).toLocaleDateString()}</span>
                        {campaign.scheduledAt && (
                          <span>Scheduled for {new Date(campaign.scheduledAt).toLocaleString()}</span>
                        )}
                        {campaign.sentAt && (
                          <span>Sent {new Date(campaign.sentAt).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
