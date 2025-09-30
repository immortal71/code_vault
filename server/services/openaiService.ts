import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CodeAnalysis {
  tags: string[];
  description: string;
  framework: string | null;
  complexity: 'simple' | 'moderate' | 'complex';
}

export async function analyzeCode(code: string, language: string): Promise<CodeAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a code analysis expert. Analyze code and return ONLY a JSON object with this exact structure:
{
  "tags": ["tag1", "tag2", "tag3"],
  "description": "brief description of what the code does",
  "framework": "framework name if applicable, or null",
  "complexity": "simple|moderate|complex"
}
Return ONLY valid JSON, no markdown, no explanation.`
        },
        {
          role: 'user',
          content: `Analyze this ${language} code and provide tags, description, framework, and complexity:\n\n${code}`
        }
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const content = response.choices[0].message.content?.trim() || '{}';
    // Remove markdown code blocks if present
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    throw new Error('Failed to analyze code');
  }
}

export async function explainCode(code: string, language: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful coding instructor. Explain code clearly and concisely in 2-3 sentences.'
        },
        {
          role: 'user',
          content: `Explain what this ${language} code does:\n\n${code}`
        }
      ],
      temperature: 0.5,
      max_tokens: 200,
    });

    return response.choices[0].message.content?.trim() || 'Unable to explain code.';
  } catch (error) {
    console.error('OpenAI explanation error:', error);
    throw new Error('Failed to explain code');
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Embedding generation error:', error);
    throw new Error('Failed to generate embedding');
  }
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
