'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

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

export function FeaturedCompetitions() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompetitions()
  }, [])

  const fetchCompetitions = async () => {
    try {
      const response = await fetch('/api/competitions?limit=3')
      const data = await response.json()
      
      if (data.success) {
        setCompetitions(data.data.competitions)
      } else {
        // Fallback data when database is not available
        setCompetitions([
          {
            id: 1,
            title: 'AI Innovation Challenge',
            description: 'Build innovative AI solutions for real-world problems. Showcase your machine learning skills and compete with the best minds in AI.',
            start_date: '2024-02-01T09:00:00Z',
            end_date: '2024-02-28T18:00:00Z',
            max_participants: 100,
            current_participants: 45,
            status: 'upcoming'
          },
          {
            id: 2,
            title: 'Data Science Competition',
            description: 'Analyze datasets and build predictive models. Work with real-world data and create solutions that matter.',
            start_date: '2024-03-01T09:00:00Z',
            end_date: '2024-03-31T18:00:00Z',
            max_participants: 50,
            current_participants: 23,
            status: 'upcoming'
          },
          {
            id: 3,
            title: 'Web Development Hackathon',
            description: 'Create full-stack web applications. Build modern, responsive applications using the latest technologies.',
            start_date: '2024-04-01T09:00:00Z',
            end_date: '2024-04-30T18:00:00Z',
            max_participants: 75,
            current_participants: 38,
            status: 'upcoming'
          }
        ])
      }
    } catch (error) {
      console.error('Failed to fetch competitions:', error)
      // Fallback data when API fails
      setCompetitions([
        {
          id: 1,
          title: 'AI Innovation Challenge',
          description: 'Build innovative AI solutions for real-world problems. Showcase your machine learning skills and compete with the best minds in AI.',
          start_date: '2024-02-01T09:00:00Z',
          end_date: '2024-02-28T18:00:00Z',
          max_participants: 100,
          current_participants: 45,
          status: 'upcoming'
        },
        {
          id: 2,
          title: 'Data Science Competition',
          description: 'Analyze datasets and build predictive models. Work with real-world data and create solutions that matter.',
          start_date: '2024-03-01T09:00:00Z',
          end_date: '2024-03-31T18:00:00Z',
          max_participants: 50,
          current_participants: 23,
          status: 'upcoming'
        },
        {
          id: 3,
          title: 'Web Development Hackathon',
          description: 'Create full-stack web applications. Build modern, responsive applications using the latest technologies.',
          start_date: '2024-04-01T09:00:00Z',
          end_date: '2024-04-30T18:00:00Z',
          max_participants: 75,
          current_participants: 38,
          status: 'upcoming'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Competitions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Competitions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {competitions.map((competition) => (
            <div key={competition.id} className="card hover:shadow-lg transition-shadow duration-200">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{competition.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(competition.status)}`}>
                  {competition.status}
                </span>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-3">{competition.description}</p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Start Date:</span>
                  <span>{formatDate(competition.start_date)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>End Date:</span>
                  <span>{formatDate(competition.end_date)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Participants:</span>
                  <span>{competition.current_participants}/{competition.max_participants}</span>
                </div>
              </div>
              <Link 
                href={`/competitions/${competition.id}`}
                className="btn-primary w-full text-center block"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/competitions" className="btn-primary">
            View All Competitions
          </Link>
        </div>
      </div>
    </div>
  )
}
