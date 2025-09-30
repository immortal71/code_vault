const API_URL = '/api/ai';

export interface CodeAnalysis {
  tags: string[];
  description: string;
  framework: string | null;
  complexity: 'simple' | 'moderate' | 'complex';
}

export async function analyzeCode(code: string, language: string): Promise<CodeAnalysis> {
  const response = await fetch(`${API_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language }),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze code');
  }

  return response.json();
}

export async function explainCode(code: string, language: string): Promise<string> {
  const response = await fetch(`${API_URL}/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language }),
  });

  if (!response.ok) {
    throw new Error('Failed to explain code');
  }

  const data = await response.json();
  return data.explanation;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${API_URL}/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate embedding');
  }

  const data = await response.json();
  return data.embedding;
}
