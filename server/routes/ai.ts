import { Router } from 'express';
import { analyzeCode, explainCode, generateEmbedding } from '../services/openaiService';
import { requireAuth } from '../auth';

const router = Router();

// All AI routes require authentication
router.use(requireAuth);

// POST /api/ai/analyze - Analyze code and return tags/description
router.post('/analyze', async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    if (code.length > 10000) {
      return res.status(400).json({ error: 'Code is too long (max 10,000 characters)' });
    }

    const analysis = await analyzeCode(code, language);
    res.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze code' });
  }
});

// POST /api/ai/explain - Get explanation of code
router.post('/explain', async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    const explanation = await explainCode(code, language);
    res.json({ explanation });
  } catch (error) {
    console.error('Explanation error:', error);
    res.status(500).json({ error: 'Failed to explain code' });
  }
});

// POST /api/ai/embed - Generate embedding for semantic search
router.post('/embed', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const embedding = await generateEmbedding(text);
    res.json({ embedding });
  } catch (error) {
    console.error('Embedding error:', error);
    res.status(500).json({ error: 'Failed to generate embedding' });
  }
});

export default router;
