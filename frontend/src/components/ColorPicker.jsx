import React from 'react';
import { motion } from 'framer-motion';

const COLORS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Charcoal', value: '#0f0f0f' },
  { name: 'Amber', value: '#e8a045' },
  { name: 'Blue', value: '#4a90e2' },
  { name: 'Green', value: '#7ed321' },
  { name: 'Purple', value: '#bd10e0' },
  { name: 'Pink', value: '#ff6b9d' },
  { name: 'Orange', value: '#ff9500' },
];

export default function ColorPicker({ currentColor, onChange }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-800 hover:border-amber transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div
          className="w-5 h-5 rounded border border-gray-600"
          style={{ backgroundColor: currentColor }}
        />
        <span className="text-sm">Color</span>
      </motion.button>

      {isOpen && (
        <motion.div
          className="absolute top-full right-0 mt-2 bg-charcoal border border-gray-800 rounded-lg shadow-lg z-50 p-3"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <div className="grid grid-cols-4 gap-2">
            {COLORS.map((color) => (
              <motion.button
                key={color.value}
                onClick={() => {
                  onChange(color.value);
                  setIsOpen(false);
                }}
                className={`w-8 h-8 rounded border-2 transition-all ${
                  currentColor === color.value
                    ? 'border-off-white'
                    : 'border-gray-700 hover:border-gray-500'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
