import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../_lib/db.js';
import { snippets } from '../../shared/schema.js';
import { updateSnippetSchema } from '../../shared/schema.js';
import { setCorsHeaders } from '../_lib/cors.js';
import { handleError, unauthorized, notFound, forbidden } from '../_lib/errors.js';
import { validateBody } from '../_lib/validate.js';
import { requireAuth } from '../_lib/jwt.js';
import { eq, and } from 'drizzle-orm';
import { generateEmbedding } from '../../server/services/openaiService.js';

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

    // Get snippet ID from query (Vercel dynamic routes)
    const snippetId = req.query.id as string;
    if (!snippetId) {
      throw notFound('Snippet ID required');
    }

    if (req.method === 'GET') {
      // Get single snippet with ownership check
      const [snippet] = await db
        .select()
        .from(snippets)
        .where(and(
          eq(snippets.id, snippetId),
          eq(snippets.userId, payload.userId)
        ))
        .limit(1);

      if (!snippet) {
        throw notFound('Snippet not found');
      }

      return res.status(200).json(snippet);
    }

    if (req.method === 'PUT') {
      // Update snippet with ownership check
      const [existingSnippet] = await db
        .select()
        .from(snippets)
        .where(and(
          eq(snippets.id, snippetId),
          eq(snippets.userId, payload.userId)
        ))
        .limit(1);

      if (!existingSnippet) {
        throw notFound('Snippet not found');
      }

      // Validate update data - exclude userId and id from validation
      const { userId: _, id: __, ...updateData } = req.body;
      const validatedData = validateBody({ body: updateData } as any, updateSnippetSchema);

      // Regenerate embedding if code, title, or description changed
      let embedding = existingSnippet.embedding;
      if (validatedData.code || validatedData.description || validatedData.title) {
        const title = validatedData.title || existingSnippet.title;
        const description = validatedData.description || existingSnippet.description || '';
        const code = validatedData.code || existingSnippet.code;
        const embeddingText = `${title} ${description} ${code}`;
        const embeddingVector = await generateEmbedding(embeddingText);
        embedding = JSON.stringify(embeddingVector);
      }

      const [updated] = await db
        .update(snippets)
        .set({ ...validatedData, embedding })
        .where(eq(snippets.id, snippetId))
        .returning();

      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      // Delete snippet with ownership check
      const [existingSnippet] = await db
        .select()
        .from(snippets)
        .where(and(
          eq(snippets.id, snippetId),
          eq(snippets.userId, payload.userId)
        ))
        .limit(1);

      if (!existingSnippet) {
        throw notFound('Snippet not found');
      }

      await db
        .delete(snippets)
        .where(eq(snippets.id, snippetId));

      return res.status(200).json({ message: 'Snippet deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    handleError(res, error);
  }
}
