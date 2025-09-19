'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

interface Competition {
  id: number
  title: string
  description: string
  start_date: string
  end_date: string
  max_participants: number
  current_participants: number
  status: string
}

export default function CompetitionDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [competition, setCompetition] = useState<Competition | null>(null)
  const [loading, setLoading] = useState(true)
  const [participating, setParticipating] = useState(false)

  useEffect(() => {
    if (id) {
      fetchCompetition()
    }
  }, [id])

  const fetchCompetition = async () => {
    try {
      const response = await fetch(`/api/competitions/${id}`)
      const data = await response.json()
      
      if (data.success) {
        setCompetition(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch competition:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleParticipate = async () => {
    if (!user) {
      // Redirect to login
      window.location.href = '/login'
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/competitions/${id}/participate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (data.success) {
        setParticipating(true)
        // Refresh competition data
        fetchCompetition()
      } else {
        alert(data.message || 'Failed to join competition')
      }
    } catch (error) {
      console.error('Failed to join competition:', error)
      alert('An error occurred. Please try again.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800'
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!competition) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Competition not found</h2>
          <p className="text-gray-600">The competition you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{competition.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(competition.status)}`}>
                  {competition.status}
                </span>
              </div>
            </div>

            <div className="prose max-w-none mb-8">
              <p className="text-lg text-gray-700 leading-relaxed">{competition.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Date</h3>
                <p className="text-gray-700">{formatDate(competition.start_date)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">End Date</h3>
                <p className="text-gray-700">{formatDate(competition.end_date)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Participants</h3>
                <p className="text-gray-700">{competition.current_participants} / {competition.max_participants}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Status</h3>
                <p className="text-gray-700 capitalize">{competition.status}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {competition.status === 'upcoming' || competition.status === 'active' ? (
                <button
                  onClick={handleParticipate}
                  disabled={participating || competition.current_participants >= competition.max_participants}
                  className="btn-primary flex-1 sm:flex-none"
                >
                  {participating 
                    ? 'Participating' 
                    : competition.current_participants >= competition.max_participants 
                      ? 'Full' 
                      : 'Join Competition'
                  }
                </button>
              ) : null}
              
              <button
                onClick={() => window.history.back()}
                className="btn-secondary flex-1 sm:flex-none"
              >
                Back to Competitions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
