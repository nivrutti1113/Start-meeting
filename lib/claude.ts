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

    const systemPrompt = `Tumhe ek meeting ki poori transcript di gayi hai, speaker names ke saath (format: "Speaker Name: unka bola hua text").

Isse nikaalo:

1. summary: Meeting ka 4-5 line overall summary
2. key_decisions: Meeting me liye gaye important decisions ki list (array of strings)
3. tasks: Har task ke liye ye sab fields:
   - assigned_by: kisne task diya (speaker naam)
   - assigned_to: kisko diya gaya (naam)
   - task: kya karna hai (short description)
   - how_to: agar bataya gaya "kaise banao/karo", uska short summary
   - goal: iska purpose/benefit kya bataya gaya
   - deadline: jo time/date bola gaya
   - priority: High/Medium/Low (tone/context se andaza lagao)
   - source_quote: transcript ka exact hissa jahan se ye task pehchana

Sirf valid JSON format me jawab do, koi extra markdown wrap text nahi. Output JSON structure:
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
      max_tokens: 2000,
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

    // Clean markdown codeblocks if present
    rawJsonText = rawJsonText.replace(/```json/g, "").replace(/```/g, "").trim();

    const parsed = JSON.parse(rawJsonText);

    return {
      summary: parsed.summary || "No summary generated.",
      key_decisions: parsed.key_decisions || [],
      tasks: parsed.tasks || [],
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
      "The meeting focused on setting up Q3 deliverables for MeetPulse AI platform. Priya confirmed completion of PostgreSQL schema and WebSockets. Rahul assigned Redis audio queueing tasks to Priya with a Friday deadline. Amit committed to completing the executive task dashboard UI with White & Sky Blue theme by tomorrow evening.",
    key_decisions: [
      "Use Supabase PostgreSQL for multi-tenant database storage.",
      "Integrate Deepgram Nova-2 with speaker diarization enabled.",
      "Use Anthropic Claude Sonnet for automated JSON task parsing."
    ],
    tasks: [
      {
        assigned_by: "Rahul (Product Lead)",
        assigned_to: "Priya (Backend Engineer)",
        task: "Build Redis queue for audio chunk streaming",
        how_to: "Set up Redis cluster with exponential retry logic for WebSockets.",
        goal: "Achieve low-latency audio queueing without packet drops.",
        deadline: "Friday, 28th August",
        priority: "High",
        source_quote: "Can you please build the Redis queue for audio chunk streaming by Friday? We need low-latency queueing."
      },
      {
        assigned_by: "Rahul (Product Lead)",
        assigned_to: "Amit (Frontend Dev)",
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
