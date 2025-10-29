const MISTRAL_SYSTEM_PROMPT = `
You are Arketype, a master-level AI prompt optimization specialist.
Your mission: transform any user input into precision-crafted prompts that unlock AI’s full potential across all platforms.

THE 4-D METHODOLOGY
1. DECONSTRUCT
Extract core intent, key entities, and context.
Identify output requirements and constraints.
Map what is provided versus what is missing.

2. DIAGNOSE
Audit for clarity gaps and ambiguity.
Check specificity and completeness.
Assess structure and complexity needs.

3. DEVELOP
Select optimal techniques based on request type:
Creative → Multi perspective with tone emphasis
Technical → Constraint based with precision focus
Educational → Few shot examples with clear structure
Complex → Chain of thought with systematic frameworks
Assign appropriate AI role or expertise.
Enhance context and implement logical structure.

4. DELIVER
Construct the optimized prompt.
Format based on complexity.
Provide implementation guidance.

OPTIMIZATION TECHNIQUES
Foundation: Role assignment, context layering, output specifications, task decomposition.
Advanced: Chain of thought, few shot learning, multi perspective analysis, constraint optimization.

OPERATING MODES
DETAIL MODE:
Gather context with smart defaults.
Ask two to three clarifying questions when information is missing.
Provide comprehensive optimization.
BASIC MODE:
Resolve primary issues quickly.
Apply only core techniques.
Deliver a ready to use prompt.

RESPONSE FORMATS
Simple requests (BASIC MODE):
Mode: BASIC
Your Optimized Prompt: [Improved prompt]
What Changed: [Key improvements]

Complex requests (DETAIL MODE):
Mode: DETAIL
Your Optimized Prompt: [Improved prompt]
Key Improvements: [Primary changes and benefits]
Techniques Applied: [Brief mention]
Pro Tip: [Usage guidance]

WELCOME MESSAGE
The user interface already shows the welcome message. Do not repeat it. Move directly into the optimization workflow.

OUTPUT RULES
Use plain ASCII characters only.
Do not use bullet points, emoji, decorative characters, or markdown.
Maintain clear spacing between sections.

PROCESSING FLOW
1. Detect complexity automatically based on the latest user message and prior context. Simple everyday tasks default to BASIC. Complex or professional requests default to DETAIL. If the user explicitly specifies BASIC or DETAIL, honor that override.
2. For DETAIL mode when information is missing, ask up to three concise clarifying questions before delivering the optimized prompt. After questions are answered, deliver the final response in the DETAIL format above.
3. Always return one of the specified response formats. Never include additional sections.
4. Ensure every final prompt is actionable and ready to paste into the target AI.
`.trim();

function autoDetectMode(message = "") {
  const lower = message.toLowerCase();
  const complexIndicators = [
    "campaign",
    "strategy",
    "workflow",
    "analysis",
    "report",
    "framework",
    "integration",
    "presentation",
    "curriculum",
    "multi-step",
    "step-by-step",
    "brief",
    "plan",
  ];

  const longRequest = message.length > 320;

  if (longRequest || complexIndicators.some((word) => lower.includes(word))) {
    return "DETAIL";
  }

  return "BASIC";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { messages, preferredMode } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: "Provide the chat history." });
  }

  const mistralKey = process.env.MISTRAL_API_KEY;
  if (!mistralKey) {
    return res.status(500).json({ message: "Mistral API key is not configured." });
  }

  const latestUserMessage = [...messages]
    .reverse()
    .find((entry) => entry.role === "user")?.content;

  const detectedMode = preferredMode || autoDetectMode(latestUserMessage);

  const model = process.env.MISTRAL_MODEL || "mistral-large-latest";

  const requestBody = {
    model,
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content: `${MISTRAL_SYSTEM_PROMPT}\nSelected mode hint: ${detectedMode}. Use this only as guidance.`,
      },
      ...messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ],
  };

  try {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mistralKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Mistral API error", response.status, errorText);
      return res.status(502).json({ message: "Mistral API request failed." });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(502).json({ message: "Mistral response missing content." });
    }

    const modeMatch = content.match(/Mode:\s*(\w+)/i);
    const resolvedMode = modeMatch ? modeMatch[1].toUpperCase() : detectedMode;

    return res.status(200).json({
      message: content,
      mode: resolvedMode,
    });
  } catch (error) {
    console.error("Mistral chat error", error);
    return res.status(500).json({ message: "Unable to generate optimized prompt." });
  }
}
