import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../_lib/db';
import { snippets } from '../../shared/schema';
import { setCorsHeaders } from '../_lib/cors';
import { handleError, unauthorized, badRequest } from '../_lib/errors';
import { requireAuth } from '../_lib/jwt';
import { eq, desc, or, ilike, sql } from 'drizzle-orm';
import { generateEmbedding, cosineSimilarity } from '../../server/services/openaiService';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS
  if (setCorsHeaders(req, res)) return;

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Require authentication
    const payload = requireAuth(req);
    if (!payload) {
      throw unauthorized('Authentication required');
    }

    const query = req.query.q as string;
    const useSemanticSearch = req.query.semantic === 'true';

    if (!query) {
      throw badRequest('Query parameter is required');
    }

    if (useSemanticSearch) {
      // Semantic search using embeddings
      const queryEmbedding = await generateEmbedding(query);

      // Fetch only recent 1000 snippets from database (DB-level limit)
      const snippetsToSearch = await db
        .select()
        .from(snippets)
        .where(eq(snippets.userId, payload.userId))
        .orderBy(desc(snippets.createdAt))
        .limit(1000);

      const scoredSnippets = snippetsToSearch
        .filter(s => s.embedding)
        .map(snippet => {
          try {
            const snippetEmbedding = JSON.parse(snippet.embedding!);
            const similarity = cosineSimilarity(queryEmbedding, snippetEmbedding);
            return { snippet, similarity };
          } catch (error) {
            // Skip malformed embeddings
            return null;
          }
        })
        .filter((item): item is { snippet: any; similarity: number } => item !== null)
        .filter(({ similarity }) => similarity > 0.7) // Threshold for relevance
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 50) // Return top 50 results
        .map(({ snippet }) => snippet);

      return res.status(200).json(scoredSnippets);
    } else {
      // Keyword search with DB-level result limit
      const searchPattern = `%${query}%`;
      const results = await db
        .select()
        .from(snippets)
        .where(
          sql`${snippets.userId} = ${payload.userId} AND (
            ${snippets.title} ILIKE ${searchPattern} OR
            ${snippets.description} ILIKE ${searchPattern} OR
            ${snippets.code} ILIKE ${searchPattern} OR
            ${snippets.language} ILIKE ${searchPattern}
          )`
        )
        .orderBy(desc(snippets.createdAt))
        .limit(100);

      return res.status(200).json(results);
    }
  } catch (error) {
    handleError(res, error);
  }
}
