import { describe, it, expect } from 'vitest';
import { BlockService } from './block.service.js';

describe('BlockService', () => {
  describe('validateBlock', () => {
    it('should validate a valid text block', async () => {
      const block = {
        id: '1',
        type: 'text',
        content: 'Hello world',
      };
      const result = await BlockService.validateBlock(block);
      expect(result).toBe(true);
    });

    it('should validate a valid heading1 block', async () => {
      const block = {
        id: '1',
        type: 'heading1',
        content: 'Title',
      };
      const result = await BlockService.validateBlock(block);
      expect(result).toBe(true);
    });

    it('should validate a valid todo block with checked property', async () => {
      const block = {
        id: '1',
        type: 'todo',
        content: 'Task',
        checked: true,
      };
      const result = await BlockService.validateBlock(block);
      expect(result).toBe(true);
    });

    it('should validate a valid code block with language', async () => {
      const block = {
        id: '1',
        type: 'code',
        content: 'console.log("test")',
        language: 'javascript',
      };
      const result = await BlockService.validateBlock(block);
      expect(result).toBe(true);
    });

    it('should reject a block with invalid type', async () => {
      const block = {
        id: '1',
        type: 'invalid',
        content: 'Hello',
      };
      await expect(BlockService.validateBlock(block)).rejects.toThrow();
    });

    it('should reject a block with missing required fields', async () => {
      const block = {
        id: '1',
        // missing type and content
      };
      await expect(BlockService.validateBlock(block)).rejects.toThrow();
    });
  });

  describe('validateBlocks', () => {
    it('should validate an array of valid blocks', async () => {
      const blocks = [
        { id: '1', type: 'text', content: 'Hello' },
        { id: '2', type: 'heading1', content: 'Title' },
        { id: '3', type: 'bullet', content: 'Item' },
      ];
      const result = await BlockService.validateBlocks(blocks);
      expect(result).toBe(true);
    });

    it('should validate an empty array', async () => {
      const result = await BlockService.validateBlocks([]);
      expect(result).toBe(true);
    });

    it('should reject an array with invalid blocks', async () => {
      const blocks = [
        { id: '1', type: 'text', content: 'Hello' },
        { id: '2', type: 'invalid', content: 'Bad' },
      ];
      await expect(BlockService.validateBlocks(blocks)).rejects.toThrow();
    });
  });

  describe('generateContent', () => {
    it('should generate content from text blocks', () => {
      const blocks = [
        { id: '1', type: 'text', content: 'Hello' },
        { id: '2', type: 'text', content: 'World' },
      ];
      const content = BlockService.generateContent(blocks);
      expect(content).toBe('Hello\nWorld');
    });

    it('should format heading blocks', () => {
      const blocks = [
        { id: '1', type: 'heading1', content: 'Title' },
        { id: '2', type: 'heading2', content: 'Subtitle' },
      ];
      const content = BlockService.generateContent(blocks);
      expect(content).toBe('# Title\n## Subtitle');
    });

    it('should format bullet blocks', () => {
      const blocks = [
        { id: '1', type: 'bullet', content: 'Item 1' },
        { id: '2', type: 'bullet', content: 'Item 2' },
      ];
      const content = BlockService.generateContent(blocks);
      expect(content).toBe('• Item 1\n• Item 2');
    });

    it('should format todo blocks with checked status', () => {
      const blocks = [
        { id: '1', type: 'todo', content: 'Done task', checked: true },
        { id: '2', type: 'todo', content: 'Pending task', checked: false },
      ];
      const content = BlockService.generateContent(blocks);
      expect(content).toBe('✓ Done task\n○ Pending task');
    });

    it('should format code blocks with language', () => {
      const blocks = [
        { id: '1', type: 'code', content: 'console.log("test")', language: 'javascript' },
      ];
      const content = BlockService.generateContent(blocks);
      expect(content).toBe('```javascript\nconsole.log("test")\n```');
    });

    it('should format quote blocks', () => {
      const blocks = [
        { id: '1', type: 'quote', content: 'Famous quote' },
      ];
      const content = BlockService.generateContent(blocks);
      expect(content).toBe('> Famous quote');
    });

    it('should format divider blocks', () => {
      const blocks = [
        { id: '1', type: 'text', content: 'Section 1' },
        { id: '2', type: 'divider', content: '' },
        { id: '3', type: 'text', content: 'Section 2' },
      ];
      const content = BlockService.generateContent(blocks);
      expect(content).toBe('Section 1\n---\nSection 2');
    });

    it('should handle mixed block types', () => {
      const blocks = [
        { id: '1', type: 'heading1', content: 'My Note' },
        { id: '2', type: 'text', content: 'Introduction' },
        { id: '3', type: 'bullet', content: 'Point 1' },
        { id: '4', type: 'bullet', content: 'Point 2' },
      ];
      const content = BlockService.generateContent(blocks);
      expect(content).toBe('# My Note\nIntroduction\n• Point 1\n• Point 2');
    });

    it('should return empty string for empty blocks array', () => {
      const content = BlockService.generateContent([]);
      expect(content).toBe('');
    });

    it('should return empty string for null blocks', () => {
      const content = BlockService.generateContent(null);
      expect(content).toBe('');
    });

    it('should skip blocks with empty content', () => {
      const blocks = [
        { id: '1', type: 'text', content: 'Hello' },
        { id: '2', type: 'text', content: '' },
        { id: '3', type: 'text', content: 'World' },
      ];
      const content = BlockService.generateContent(blocks);
      expect(content).toBe('Hello\nWorld');
    });
  });

  describe('transformBlocks', () => {
    it('should transform blocks with all properties', () => {
      const blocks = [
        { id: '1', type: 'text', content: 'Hello' },
        { id: '2', type: 'todo', content: 'Task', checked: true },
      ];
      const transformed = BlockService.transformBlocks(blocks);
      expect(transformed).toEqual([
        { id: '1', type: 'text', content: 'Hello' },
        { id: '2', type: 'todo', content: 'Task', checked: true },
      ]);
    });

    it('should add default values for missing properties', () => {
      const blocks = [
        { id: '1' },
      ];
      const transformed = BlockService.transformBlocks(blocks);
      expect(transformed[0]).toEqual({
        id: '1',
        type: 'text',
        content: '',
      });
    });

    it('should handle empty array', () => {
      const transformed = BlockService.transformBlocks([]);
      expect(transformed).toEqual([]);
    });

    it('should handle null input', () => {
      const transformed = BlockService.transformBlocks(null);
      expect(transformed).toEqual([]);
    });
  });

  describe('getAllowedBlockTypes', () => {
    it('should return all allowed block types', () => {
      const types = BlockService.getAllowedBlockTypes();
      expect(types).toEqual(['text', 'heading1', 'heading2', 'bullet', 'todo', 'code', 'divider', 'quote']);
    });

    it('should return an array', () => {
      const types = BlockService.getAllowedBlockTypes();
      expect(Array.isArray(types)).toBe(true);
    });
  });
});
