import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios' // Import axios directly in this component

// --- Helper Icon Components ---

const VideoCameraIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="http://www.w3.org/2000/svg"
    fill="currentColor"
  >
    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 5.106A.5.5 0 0115 5.5v9a.5.5 0 01-.447.494l-3-1A.5.5 0 0111 13.5v-7a.5.5 0 01.553-.494l3-1z" />
  </svg>
)

const SpinnerIcon = () => (
  <svg
    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
)

export default function CreateMeetingPage() {
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  /**
   * Handles the form submission to create a new meeting.
   * This function now directly handles the API call using axios.
   */
  const handleCreateMeeting = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Please enter a meeting title.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // The API call is now made directly from within the component.
      // Your backend is running on localhost:5000, and the route is /api/meetings.
      // 'withCredentials: true' is essential for sending the auth cookies.
      const response = await axios.post(
        'http://localhost:5000/api/meetings',
        { title }, // The request body, as expected by your controller
        { withCredentials: true } // This ensures cookies are sent
      )

      // Based on your backend controller, the meeting code is in response.data.data.meetingId
      const meetingId = response.data?.data?.meetingId

      if (meetingId) {
        // If successful, navigate to the new meeting room
        navigate(`/test/video/${meetingId}`)
      } else {
        throw new Error('Could not retrieve meeting ID from the server response.')
      }
    } catch (err) {
      // Handle errors from the API call (e.g., network error, 401 Unauthorized, etc.)
      const errorMessage =
        err.response?.data?.error || 'Failed to create meeting. Please try again.'
      setError(errorMessage)
      console.error('Error creating meeting:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-2xl shadow-2xl">
        <div>
          <h2 className="text-3xl font-extrabold text-center text-white">
            Create a New Meeting
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Give your meeting a title to get started.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleCreateMeeting}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="meeting-title" className="sr-only">
                Meeting Title
              </label>
              <input
                id="meeting-title"
                name="title"
                type="text"
                autoComplete="off"
                required
                className="relative block w-full px-4 py-3 text-lg bg-gray-700 border border-gray-600 rounded-md placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="E.g., Termwork Project Sync"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors duration-200"
              disabled={loading}
            >
              {loading ? (
                <>
                  <SpinnerIcon />
                  Creating...
                </>
              ) : (
                <>
                  <VideoCameraIcon className="w-6 h-6 mr-2" />
                  Create Meeting
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div
            className="p-4 mt-4 text-sm text-red-200 bg-red-900 bg-opacity-50 rounded-lg"
            role="alert"
          >
            <span className="font-bold">Error:</span> {error}
          </div>
        )}
      </div>
    </div>
  )
}
