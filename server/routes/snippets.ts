import { Router } from 'express';
import { storage } from '../storage';
import { insertSnippetSchema } from '@shared/schema';
import { generateEmbedding } from '../services/openaiService';

const router = Router();

// Get or create demo user
async function getDemoUserId(): Promise<string> {
  let user = await storage.getUserByUsername("demo");
  if (!user) {
    user = await storage.createUser({
      username: "demo",
      password: "demo123",
    });
  }
  return user.id;
}

// GET /api/snippets - Get all snippets for a user
router.get('/', async (req, res) => {
  try {
    // For demo purposes, using the demo user
    // In production, get from authenticated session
    const userId = await getDemoUserId();
    
    const snippets = await storage.getSnippetsByUserId(userId);
    res.json(snippets);
  } catch (error) {
    console.error('Get snippets error:', error);
    res.status(500).json({ error: 'Failed to fetch snippets' });
  }
});

// GET /api/snippets/:id - Get single snippet
router.get('/:id', async (req, res) => {
  try {
    const snippet = await storage.getSnippet(req.params.id);
    
    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
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
    // Validate request body
    const validatedData = insertSnippetSchema.parse(req.body);
    
    // Generate embedding for semantic search
    let embedding = null;
    if (validatedData.code && validatedData.description) {
      const embeddingText = `${validatedData.title} ${validatedData.description} ${validatedData.code}`;
      const embeddingVector = await generateEmbedding(embeddingText);
      embedding = JSON.stringify(embeddingVector);
    }
    
    const snippet = await storage.createSnippet({
      ...validatedData,
      embedding,
    });
    
    res.status(201).json(snippet);
  } catch (error) {
    console.error('Create snippet error:', error);
    res.status(500).json({ error: 'Failed to create snippet' });
  }
});

// PUT /api/snippets/:id - Update snippet
router.put('/:id', async (req, res) => {
  try {
    const snippet = await storage.getSnippet(req.params.id);
    
    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    
    // Regenerate embedding if code or description changed
    let embedding = snippet.embedding;
    if (req.body.code || req.body.description) {
      const title = req.body.title || snippet.title;
      const description = req.body.description || snippet.description || '';
      const code = req.body.code || snippet.code;
      const embeddingText = `${title} ${description} ${code}`;
      const embeddingVector = await generateEmbedding(embeddingText);
      embedding = JSON.stringify(embeddingVector);
    }
    
    const updated = await storage.updateSnippet(req.params.id, {
      ...req.body,
      embedding,
    });
    
    res.json(updated);
  } catch (error) {
    console.error('Update snippet error:', error);
    res.status(500).json({ error: 'Failed to update snippet' });
  }
});

// DELETE /api/snippets/:id - Delete snippet
router.delete('/:id', async (req, res) => {
  try {
    const success = await storage.deleteSnippet(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    
    res.json({ message: 'Snippet deleted successfully' });
  } catch (error) {
    console.error('Delete snippet error:', error);
    res.status(500).json({ error: 'Failed to delete snippet' });
  }
});

// GET /api/snippets/search - Keyword and semantic search
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    const userId = await getDemoUserId();
    const useSemanticSearch = req.query.semantic === 'true';
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    if (useSemanticSearch) {
      // Semantic search using embeddings
      const queryEmbedding = await generateEmbedding(query);
      const allSnippets = await storage.getSnippetsByUserId(userId);
      
      const { cosineSimilarity } = await import('../services/openaiService');
      
      const scoredSnippets = allSnippets
        .filter(s => s.embedding)
        .map(snippet => {
          const snippetEmbedding = JSON.parse(snippet.embedding!);
          const similarity = cosineSimilarity(queryEmbedding, snippetEmbedding);
          return { snippet, similarity };
        })
        .filter(({ similarity }) => similarity > 0.7) // Threshold for relevance
        .sort((a, b) => b.similarity - a.similarity)
        .map(({ snippet }) => snippet);
      
      res.json(scoredSnippets);
    } else {
      // Keyword search
      const snippets = await storage.searchSnippets(userId, query);
      res.json(snippets);
    }
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search snippets' });
  }
});

export default router;
