'use client'

import { useState, useEffect } from 'react'
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

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchCompetitions()
  }, [statusFilter, currentPage])

  const fetchCompetitions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '9'
      })
      
      if (statusFilter) {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/competitions?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setCompetitions(data.data.competitions)
        setPagination(data.data.pagination)
      } else {
        // Fallback data when database is not available
        const fallbackCompetitions = [
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
          },
          {
            id: 4,
            title: 'Mobile App Development',
            description: 'Create innovative mobile applications for iOS and Android. Use the latest frameworks and technologies.',
            start_date: '2024-05-01T09:00:00Z',
            end_date: '2024-05-31T18:00:00Z',
            max_participants: 60,
            current_participants: 28,
            status: 'upcoming'
          },
          {
            id: 5,
            title: 'Blockchain Innovation',
            description: 'Build decentralized applications and smart contracts. Explore the future of blockchain technology.',
            start_date: '2024-06-01T09:00:00Z',
            end_date: '2024-06-30T18:00:00Z',
            max_participants: 40,
            current_participants: 15,
            status: 'upcoming'
          },
          {
            id: 6,
            title: 'Cybersecurity Challenge',
            description: 'Test your security skills and protect systems from threats. Learn about ethical hacking and defense strategies.',
            start_date: '2024-07-01T09:00:00Z',
            end_date: '2024-07-31T18:00:00Z',
            max_participants: 80,
            current_participants: 42,
            status: 'upcoming'
          }
        ]
        
        const filtered = statusFilter 
          ? fallbackCompetitions.filter(c => c.status === statusFilter)
          : fallbackCompetitions
        
        setCompetitions(filtered)
        setPagination({
          page: currentPage,
          limit: 9,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / 9)
        })
      }
    } catch (error) {
      console.error('Failed to fetch competitions:', error)
      // Fallback data when API fails
      const fallbackCompetitions = [
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
      ]
      
      const filtered = statusFilter 
        ? fallbackCompetitions.filter(c => c.status === statusFilter)
        : fallbackCompetitions
      
      setCompetitions(filtered)
      setPagination({
        page: currentPage,
        limit: 9,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / 9)
      })
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

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Competitions</h1>
          <p className="mt-2 text-gray-600">Discover and join exciting competitions</p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStatusFilter('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === '' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleStatusFilter('upcoming')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'upcoming' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => handleStatusFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'active' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => handleStatusFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'completed' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Competitions Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : competitions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏆</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No competitions found</h3>
            <p className="text-gray-600">Try adjusting your filters or check back later for new competitions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitions.map((competition) => (
              <div key={competition.id} className="card hover:shadow-lg transition-shadow duration-200">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{competition.title}</h3>
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
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    page === currentPage
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}
