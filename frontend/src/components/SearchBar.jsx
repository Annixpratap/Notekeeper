import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

const DEBOUNCE_MS = 300;

export default function SearchBar({ onSearch, onClear, isLoading }) {
  const [value, setValue] = useState('');
  const debounceTimerRef = React.useRef(null);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setValue(newValue);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      onSearch(newValue);
    }, DEBOUNCE_MS);
  }, [onSearch]);

  const handleClear = useCallback(() => {
    setValue('');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onClear();
  }, [onClear]);

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="Search notes..."
          className="w-full px-4 py-3 pl-10 bg-gray-900 border border-gray-800 rounded-lg text-off-white placeholder-gray-500 focus:outline-none focus:border-amber transition-colors"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <svg
              className="w-4 h-4 text-amber"
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
        )}

        {/* Clear button */}
        {value && !isLoading && (
          <motion.button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-off-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ✕
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
