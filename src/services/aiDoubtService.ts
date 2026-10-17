export type DoubtType = 'concept' | 'numerical' | 'code' | 'exam' | 'quick';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  doubtType?: DoubtType;
  contextNoteTitle?: string;
}

export interface SolveDoubtParams {
  question: string;
  doubtType: DoubtType;
  branch?: string;
  subject?: string;
  semester?: number;
  contextNoteTitle?: string;
  contextSnippet?: string;
  conversationHistory?: { role: 'user' | 'model'; content: string }[];
}

export async function askAIDoubt(params: SolveDoubtParams): Promise<string> {
  try {
    const res = await fetch('/api/ai/solve-doubt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `Server returned ${res.status}`);
    }

    return data.answer || 'No response generated.';
  } catch (err: any) {
    console.error('Failed to solve doubt via API:', err);
    throw err;
  }
}

export async function getSuggestedQuestions(
  subject?: string,
  branch?: string
): Promise<string[]> {
  try {
    const res = await fetch('/api/ai/suggest-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subject, branch }),
    });

    if (!res.ok) {
      throw new Error('Failed to fetch suggested questions');
    }

    const data = await res.json();
    if (Array.isArray(data.questions) && data.questions.length > 0) {
      return data.questions;
    }
  } catch (err) {
    console.warn('Fallback to local suggested questions', err);
  }

  // Fallback high-yield engineering questions
  if (subject) {
    return [
      `Explain the fundamental working principle of ${subject}`,
      `Derive the key governing equation for this unit in ${subject}`,
      `What are the most frequent 10-mark exam questions in ${subject}?`,
      `Provide a step-by-step numerical solving framework for this topic.`
    ];
  }

  return [
    'Explain Paging vs Segmentation in Operating Systems with a diagram',
    'Derive Euler-Bernoulli Beam bending formula step-by-step',
    'Explain 3-Phase Induction Motor working principle & slip',
    'How does Dijkstra Shortest Path algorithm work with an example?'
  ];
}

export async function generateQuizFromAI(
  subject: string,
  branch: string,
  topic?: string,
  count = 5
) {
  try {
    const res = await fetch('/api/ai/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, branch, topic, count })
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
      return data.questions;
    }
  } catch (err) {
    console.warn('AI quiz generation error, using curated question bank:', err);
  }
  return null;
}

export async function generateShortNotesFromAI(
  subject: string,
  branch: string,
  topic: string
) {
  try {
    const res = await fetch('/api/ai/generate-short-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, branch, topic })
    });
    const data = await res.json();
    if (data.success && data.shortNote && data.shortNote.title) {
      return data.shortNote;
    }
  } catch (err) {
    console.warn('AI short notes generation error, using curated cheat sheets:', err);
  }
  return null;
}

