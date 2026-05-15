import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import BlockEditor from '../components/BlockEditor';
import CommandMenu from '../components/CommandMenu';
import ColorPicker from '../components/ColorPicker';
import TagInput from '../components/TagInput';
import ShareModal from '../components/ShareModal';
import { useNoteById, useUpdateNote, useDeleteNote } from '../hooks/useNotes';
import { useAutoSave } from '../hooks/useAutoSave';

export default function NoteEditor() {
  const { id: noteId } = useParams();
  const navigate = useNavigate();
  const { data: note, isLoading, error } = useNoteById(noteId);
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const { save: autoSave, isSaving } = useAutoSave(noteId);
  const titleRef = useRef(null);

  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [color, setColor] = useState('#ffffff');
  const [tags, setTags] = useState([]);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from note data
  useEffect(() => {
    if (note && !isInitialized) {
      setTitle(note.title || '');
      setBlocks(note.blocks || []);
      setColor(note.color || '#ffffff');
      setTags(note.tags || []);
      setIsInitialized(true);
      
      // Set the title in the ref
      if (titleRef.current) {
        titleRef.current.textContent = note.title || '';
      }
    }
  }, [note?.id, isInitialized]);

  const handleTitleChange = (e) => {
    const newTitle = e.currentTarget.textContent || '';
    setTitle(newTitle);
    if (newTitle.trim()) {
      autoSave({ title: newTitle });
    }
  };

  const handleBlocksChange = (newBlocks) => {
    setBlocks(newBlocks);
    autoSave({ blocks: newBlocks });
  };

  const handleColorChange = (newColor) => {
    setColor(newColor);
    updateNoteMutation.mutate({ noteId, data: { color: newColor } });
  };

  const handleTagsChange = (newTags) => {
    setTags(newTags);
    autoSave({ tags: newTags });
  };

  const handleDelete = async () => {
    try {
      await deleteNoteMutation.mutateAsync(noteId);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal text-off-white flex items-center justify-center">
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
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-charcoal text-off-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-playfair font-bold mb-2">Note not found</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-amber hover:text-amber/80 transition-colors"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal text-off-white flex flex-col">
      {/* Header - sticky */}
      <div className="sticky top-0 z-40 border-b border-gray-800 p-4 md:p-6 flex items-center justify-between bg-charcoal">
        <motion.button
          onClick={() => navigate('/dashboard')}
          className="text-off-white hover:text-amber transition-colors flex items-center gap-2"
          whileHover={{ x: -4 }}
        >
          ← Back
        </motion.button>

        <div className="flex items-center gap-2">
          {isSaving && (
            <motion.span
              className="text-sm text-gray-500"
              animate={{ opacity: [0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              Saving...
            </motion.span>
          )}
          {!isSaving && (
            <span className="text-sm text-gray-500">Saved ✓</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => setShareModalOpen(true)}
            className="px-3 py-2 text-sm rounded-lg border border-gray-800 hover:border-amber transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Share
          </motion.button>
          <motion.button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-3 py-2 text-sm rounded-lg border border-red-800 text-red-400 hover:border-red-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Delete
          </motion.button>
        </div>
      </div>

      {/* Main content - scrolls as one unit */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          {/* Title */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              ref={titleRef}
              contentEditable
              suppressContentEditableWarning
              onBlur={handleTitleChange}
              className="text-4xl md:text-5xl font-playfair font-bold text-off-white focus:outline-none focus:ring-2 focus:ring-amber rounded px-2 py-1 outline-none min-h-[1.2em]"
              style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
            />
          </motion.div>

          {/* Block Editor - seamless, all content visible */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <BlockEditor
              blocks={blocks}
              onChange={handleBlocksChange}
              onSave={handleBlocksChange}
            />
          </motion.div>

          {/* Toolbar */}
          <motion.div
            className="flex flex-wrap gap-4 p-4 bg-gray-900 rounded-lg border border-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <ColorPicker currentColor={color} onChange={handleColorChange} />
            <div className="flex-1 min-w-[200px]">
              <TagInput tags={tags} onChange={handleTagsChange} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        noteId={noteId}
        onClose={() => setShareModalOpen(false)}
        onShare={() => {}}
      />

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-charcoal border border-gray-800 rounded-lg p-6 max-w-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <h2 className="text-xl font-playfair font-bold mb-4">Delete Note?</h2>
            <p className="text-gray-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <motion.button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 px-4 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleDelete}
                className="flex-1 py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Delete
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
