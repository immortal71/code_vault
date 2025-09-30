import { Router } from 'express';
import { storage } from '../storage';
import { insertSnippetSchema, updateSnippetSchema } from '@shared/schema';
import { generateEmbedding } from '../services/openaiService';
import { requireAuth } from '../auth';
import { ZodError } from 'zod';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// GET /api/snippets - Get all snippets for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.user!.id;
    
    const snippets = await storage.getSnippetsByUserId(userId);
    res.json(snippets);
  } catch (error) {
    console.error('Get snippets error:', error);
    res.status(500).json({ error: 'Failed to fetch snippets' });
  }
});

// GET /api/snippets/search - Keyword and semantic search
// IMPORTANT: This must come before /:id to avoid route collision
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    const userId = req.user!.id;
    const useSemanticSearch = req.query.semantic === 'true';
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    if (useSemanticSearch) {
      // Semantic search using embeddings with DB-level performance limits
      const queryEmbedding = await generateEmbedding(query);
      
      // Fetch only recent 1000 snippets from database (DB-level limit)
      const snippetsToSearch = await storage.getRecentSnippetsForSearch(userId, 1000);
      
      const { cosineSimilarity } = await import('../services/openaiService');
      
      const scoredSnippets = snippetsToSearch
        .filter(s => s.embedding)
        .map(snippet => {
          const snippetEmbedding = JSON.parse(snippet.embedding!);
          const similarity = cosineSimilarity(queryEmbedding, snippetEmbedding);
          return { snippet, similarity };
        })
        .filter(({ similarity }) => similarity > 0.7) // Threshold for relevance
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 50) // Return top 50 results
        .map(({ snippet }) => snippet);
      
      res.json(scoredSnippets);
    } else {
      // Keyword search with DB-level result limit
      const snippets = await storage.searchSnippets(userId, query, 100);
      res.json(snippets);
    }
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search snippets' });
  }
});

// GET /api/snippets/:id - Get single snippet
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user!.id;
    const snippet = await storage.getSnippet(req.params.id);
    
    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    
    // Verify ownership
    if (snippet.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    res.json(snippet);
  } catch (error) {
    console.error('Get snippet error:', error);
    res.status(500).json({ error: 'Failed to fetch snippet' });
  }
});

// POST /api/snippets - Create new snippet
router.post('/', async (req, res) => {
  try {
    // Enforce server-side userId - never trust client
    const userId = req.user!.id;
    
    // Validate request body (without userId from client)
    const { userId: _, ...bodyWithoutUserId } = req.body;
    const validatedData = insertSnippetSchema.parse({ ...bodyWithoutUserId, userId });
    
    // Generate embedding for semantic search - always generate for better search coverage
    let embedding = null;
    if (validatedData.code) {
      const embeddingText = `${validatedData.title} ${validatedData.description || ''} ${validatedData.code}`;
      const embeddingVector = await generateEmbedding(embeddingText);
      embedding = JSON.stringify(embeddingVector);
    }
    
    const snippet = await storage.createSnippet({
      ...validatedData,
      embedding,
    });
    
    res.status(201).json(snippet);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create snippet error:', error);
    res.status(500).json({ error: 'Failed to create snippet' });
  }
});

// PUT /api/snippets/:id - Update snippet
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user!.id;
    const snippet = await storage.getSnippet(req.params.id);
    
    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    
    // Verify ownership
    if (snippet.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Validate update data - exclude userId and id from validation
    const { userId: _, id: __, ...updateData } = req.body;
    const validatedData = updateSnippetSchema.parse(updateData);
    
    // Regenerate embedding if code, title, or description changed
    let embedding = snippet.embedding;
    if (validatedData.code || validatedData.description || validatedData.title) {
      const title = validatedData.title || snippet.title;
      const description = validatedData.description || snippet.description || '';
      const code = validatedData.code || snippet.code;
      const embeddingText = `${title} ${description} ${code}`;
      const embeddingVector = await generateEmbedding(embeddingText);
      embedding = JSON.stringify(embeddingVector);
    }
    
    const updated = await storage.updateSnippet(req.params.id, { ...validatedData, embedding });
    
    res.json(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Update snippet error:', error);
    res.status(500).json({ error: 'Failed to update snippet' });
  }
});

// DELETE /api/snippets/:id - Delete snippet
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user!.id;
    const snippet = await storage.getSnippet(req.params.id);
    
    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    
    // Verify ownership
    if (snippet.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const success = await storage.deleteSnippet(req.params.id);
    res.json({ message: 'Snippet deleted successfully' });
  } catch (error) {
    console.error('Delete snippet error:', error);
    res.status(500).json({ error: 'Failed to delete snippet' });
  }
});

export default router;
