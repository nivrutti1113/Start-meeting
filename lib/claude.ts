import Anthropic from "@anthropic-ai/sdk";

export interface ExtractedTask {
  assigned_by: string;
  assigned_to: string;
  task: string;
  how_to: string;
  goal: string;
  deadline: string;
  priority: "High" | "Medium" | "Low";
  source_quote: string;
}

export interface ClaudeExtractionResult {
  summary: string;
  key_decisions: string[];
  tasks: ExtractedTask[];
  isDevFallback: boolean;
}

export async function extractTasksWithClaude(
  speakerTranscript: string
): Promise<ClaudeExtractionResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    console.warn("ANTHROPIC_API_KEY missing. Using development fallback AI extraction.");
    return getSampleClaudeFallbackResult();
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const systemPrompt = `You are the MeetPulse AI Autonomous Executive Meeting Intelligence Engine.
You are provided with a complete meeting transcript containing speaker attributions (format: "Speaker Name: utterance").

Analyze this transcript with high precision and extract:
1. "summary": A concise executive summary of the meeting (3-5 sentences) summarizing the main purpose, discussion points, and outcomes.
2. "key_decisions": An array of strings representing official decisions agreed upon by the participants.
3. "tasks": An array of actionable commitments and tasks assigned or self-assigned during the meeting. Each task object MUST have:
   - "assigned_by": The full name of the speaker who delegated or requested the task (e.g. "Alex Vance").
   - "assigned_to": The full name of the person responsible for completing it.
   - "task": A clear, concise, actionable task description.
   - "how_to": Specific technical steps, tools, or methodologies mentioned for completing it (or null/brief explanation).
   - "goal": The business or technical purpose/benefit of the task.
   - "deadline": The agreed due date or time frame (e.g. "Friday, 28th August", "Tomorrow evening").
   - "priority": "High" | "Medium" | "Low" inferred from tone, urgency, and blockers.
   - "source_quote": Exact verbatim phrase from the transcript where this task was established.

Respond ONLY with valid JSON. No conversational wrapper or markdown preamble.
Expected JSON format:
{
  "summary": "...",
  "key_decisions": ["..."],
  "tasks": [
    {
      "assigned_by": "...",
      "assigned_to": "...",
      "task": "...",
      "how_to": "...",
      "goal": "...",
      "deadline": "...",
      "priority": "High",
      "source_quote": "..."
    }
  ]
}`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2500,
      temperature: 0.1,
      messages: [
        {
          role: "user",
          content: `${systemPrompt}\n\nTRANSCRIPT:\n${speakerTranscript}`,
        },
      ],
    });

    const responseContent = response.content[0];
    let rawJsonText = "";

    if (responseContent && responseContent.type === "text") {
      rawJsonText = responseContent.text;
    }

    // Clean markdown code blocks if present
    rawJsonText = rawJsonText.replace(/```json/g, "").replace(/```/g, "").trim();

    const parsed = JSON.parse(rawJsonText);

    return {
      summary: parsed.summary || "No summary generated.",
      key_decisions: Array.isArray(parsed.key_decisions) ? parsed.key_decisions : [],
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      isDevFallback: false,
    };
  } catch (err: any) {
    console.error("Claude Extraction Error:", err);
    return getSampleClaudeFallbackResult();
  }
}

export function getSampleClaudeFallbackResult(): ClaudeExtractionResult {
  return {
    summary:
      "The meeting focused on setting up Q3 deliverables for the MeetPulse AI platform. Priya Sharma confirmed completion of the PostgreSQL schema and WebSockets. Alex Vance assigned Redis audio queueing tasks to Priya with a Friday deadline. Amit Patel committed to completing the executive task dashboard UI with the White & Sky Blue theme by tomorrow evening.",
    key_decisions: [
      "Use PostgreSQL for multi-tenant database isolation and scalability.",
      "Integrate Deepgram Nova-2 with speaker diarization enabled.",
      "Use Anthropic Claude 3.5 Sonnet for automated JSON task parsing."
    ],
    tasks: [
      {
        assigned_by: "Alex Vance (Product Lead)",
        assigned_to: "Priya Sharma (Backend Systems)",
        task: "Build Redis queue for audio chunk streaming",
        how_to: "Set up Redis cluster with exponential retry logic for WebSockets.",
        goal: "Achieve low-latency audio queueing without packet drops.",
        deadline: "Friday, 28th August",
        priority: "High",
        source_quote: "Can you please build the Redis queue for audio chunk streaming by Friday? We need low-latency queueing."
      },
      {
        assigned_by: "Alex Vance (Product Lead)",
        assigned_to: "Amit Patel (Frontend Dev)",
        task: "Build executive task dashboard UI",
        how_to: "Integrate White and Light Sky Blue Tailwind CSS components for admin task view.",
        goal: "Give company admins a clean review panel before auto-dispatching WhatsApp messages.",
        deadline: "Tomorrow evening",
        priority: "Medium",
        source_quote: "I will integrate the White and Sky Blue Tailwind components for the executive task dashboard by tomorrow evening."
      }
    ],
    isDevFallback: true,
  };
}
