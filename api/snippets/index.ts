import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../_lib/db';
import { snippets } from '../../shared/schema';
import { insertSnippetSchema } from '../../shared/schema';
import { setCorsHeaders } from '../_lib/cors';
import { handleError, unauthorized } from '../_lib/errors';
import { validateBody } from '../_lib/validate';
import { requireAuth } from '../_lib/jwt';
import { eq, desc } from 'drizzle-orm';
import { generateEmbedding } from '../../server/services/openaiService';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS
  if (setCorsHeaders(req, res)) return;

  try {
    // Require authentication
    const payload = requireAuth(req);
    if (!payload) {
      throw unauthorized('Authentication required');
    }

    if (req.method === 'GET') {
      // Get all snippets for the user with pagination
      const limit = Math.min(parseInt(req.query.limit as string) || 100, 100); // Max 100
      const offset = parseInt(req.query.offset as string) || 0;

      const userSnippets = await db
        .select()
        .from(snippets)
        .where(eq(snippets.userId, payload.userId))
        .orderBy(desc(snippets.createdAt))
        .limit(limit)
        .offset(offset);

      return res.status(200).json(userSnippets);
    }

    if (req.method === 'POST') {
      // Create new snippet
      const { userId: _, ...bodyWithoutUserId } = req.body;
      const validatedData = validateBody(
        { body: { ...bodyWithoutUserId, userId: payload.userId } } as any,
        insertSnippetSchema
      );

      // Generate embedding for semantic search
      let embedding: string | null = null;
      if (validatedData.code) {
        const embeddingText = `${validatedData.title} ${validatedData.description || ''} ${validatedData.code}`;
        const embeddingVector = await generateEmbedding(embeddingText);
        embedding = JSON.stringify(embeddingVector);
      }

      const [snippet] = await db
        .insert(snippets)
        .values({
          ...validatedData,
          embedding,
        })
        .returning();

      return res.status(201).json(snippet);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    handleError(res, error);
  }
}
