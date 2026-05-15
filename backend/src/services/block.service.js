import { BlockSchema, BlockArraySchema } from '../schemas/block.js';

/**
 * Block Service
 * Handles block validation, transformation, and content generation
 */
export class BlockService {
  /**
   * Validate a single block
   * @param {Object} block - Block to validate
   * @returns {Promise<boolean>} True if valid
   * @throws {Error} If block is invalid
   */
  static async validateBlock(block) {
    try {
      BlockSchema.parse(block);
      return true;
    } catch (error) {
      const err = new Error(`Block validation failed: ${error.message}`);
      err.statusCode = 400;
      throw err;
    }
  }

  /**
   * Validate an array of blocks
   * @param {Array} blocks - Blocks to validate
   * @returns {Promise<boolean>} True if valid
   * @throws {Error} If any block is invalid
   */
  static async validateBlocks(blocks) {
    try {
      BlockArraySchema.parse(blocks);
      return true;
    } catch (error) {
      const err = new Error(`Block array validation failed: ${error.message}`);
      err.statusCode = 400;
      throw err;
    }
  }

  /**
   * Generate plain text content from blocks
   * Concatenates all block content with appropriate separators
   * @param {Array} blocks - Array of blocks
   * @returns {string} Plain text content
   */
  static generateContent(blocks) {
    if (!Array.isArray(blocks) || blocks.length === 0) {
      return '';
    }

    return blocks
      .map((block) => {
        // Add appropriate separators based on block type
        switch (block.type) {
          case 'divider':
            return '---';
          case 'heading1':
            return block.content ? `# ${block.content}` : '';
          case 'heading2':
            return block.content ? `## ${block.content}` : '';
          case 'bullet':
            return block.content ? `• ${block.content}` : '';
          case 'todo':
            return block.content ? `${block.checked ? '✓' : '○'} ${block.content}` : '';
          case 'code':
            return block.content ? `\`\`\`${block.language || ''}\n${block.content}\n\`\`\`` : '';
          case 'quote':
            return block.content ? `> ${block.content}` : '';
          case 'text':
          default:
            return block.content || '';
        }
      })
      .filter((content) => content !== '')
      .join('\n');
  }

  /**
   * Transform blocks (e.g., normalize, clean up)
   * @param {Array} blocks - Blocks to transform
   * @returns {Array} Transformed blocks
   */
  static transformBlocks(blocks) {
    if (!Array.isArray(blocks)) {
      return [];
    }

    return blocks.map((block) => ({
      id: block.id || '',
      type: block.type || 'text',
      content: block.content || '',
      ...(block.checked !== undefined && { checked: block.checked }),
      ...(block.language && { language: block.language }),
    }));
  }

  /**
   * Get allowed block types
   * @returns {Array<string>} Array of allowed block types
   */
  static getAllowedBlockTypes() {
    return ['text', 'heading1', 'heading2', 'bullet', 'todo', 'code', 'divider', 'quote'];
  }
}
