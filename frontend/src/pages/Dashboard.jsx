import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import NoteCard from '../components/NoteCard';
import { useNotes } from '../hooks/useNotes';
import { useSearch } from '../hooks/useSearch';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: notesData, isLoading: notesLoading, error: notesError } = useNotes();
  const { results: searchResults, isLoading: searchLoading, search, clear, query } = useSearch();

  const notes = notesData?.data || [];
  const displayNotes = query ? searchResults : notes;

  // Separate pinned and unpinned notes
  const pinnedNotes = displayNotes.filter((n) => n.isPinned);
  const unpinnedNotes = displayNotes.filter((n) => !n.isPinned);
  const sortedNotes = [...pinnedNotes, ...unpinnedNotes];

  const isLoading = notesLoading || searchLoading;

  return (
    <div className="flex h-screen bg-charcoal text-off-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-800 p-4 md:p-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-off-white hover:text-amber transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 className="text-2xl md:text-3xl font-playfair font-bold">Notes</h1>
          </div>
          <SearchBar
            onSearch={search}
            onClear={clear}
            isLoading={searchLoading}
          />
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          {notesError && (
            <div className="p-4 md:p-6 bg-red-900/20 border border-red-800 rounded-lg m-4 md:m-6">
              <p className="text-red-400">Failed to load notes. Please try again.</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <svg
                  className="w-8 h-8 text-amber"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </motion.div>
            </div>
          ) : sortedNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="text-6xl mb-4">📝</div>
                <h2 className="text-2xl font-playfair font-bold mb-2">
                  {query ? 'No notes found' : 'No notes yet'}
                </h2>
                <p className="text-gray-400 mb-6">
                  {query
                    ? 'Try a different search term'
                    : 'Create your first note to get started'}
                </p>
              </motion.div>
            </div>
          ) : (
            <div className="p-4 md:p-6">
              {/* Masonry grid */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {sortedNotes.map((note, idx) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <NoteCard note={note} onDelete={() => {}} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
