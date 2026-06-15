const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// System instructions for the travel assistant
const SYSTEM_PROMPT = `You are "Wanderer AI", a helpful, friendly, and expert travel guide chatbot for India. 
Your goal is to answer travel-related questions about destinations, itineraries, safety, foods, transit, and culture.
Keep your answers engaging, informative, structured (use bullet points where appropriate), and concise (under 3-4 paragraphs maximum) so they are easy to read and listen to on trips.
Always be polite, encourage slow and sustainable travel, and speak from the perspective of an expert local companion.`;

// Predefined offline general travel advice fallbacks
const OFFLINE_FAQ: Record<string, string> = {
  'hello': "Namaste! I am Wanderer AI, your personal travel guide for India. How can I help you plan your journey today?",
  'hi': "Namaste! I am Wanderer AI, your personal travel guide for India. How can I help you plan your journey today?",
  'help': "I can help you with travel itineraries, state details, packing essentials, regional foods, safety tips, and travel suggestions. Feel free to ask me anything!",
  'safety': "Traveling in India is generally wonderful if you follow standard precautions:\n\n• Use official transport apps like Uber/Ola or prepaid taxi booths.\n• Stay in well-reviewed accommodations in central areas.\n• Dress respectfully, especially when visiting temples and religious sites.\n• Avoid drinking tap water; always opt for bottled or filtered water.\n• Keep copies of important travel documents on your phone.",
  'food': "Indian cuisine is incredibly diverse! Here are some rules for travel food safety:\n\n• Eat at busy local spots (high turnover means fresh food).\n• Choose hot, freshly cooked items like piping hot dosas, parathas, or tea (chai).\n• Avoid raw salads or pre-peeled fruits unless you peel them yourself.\n• Drink bottled water and try local buttermilk (chaas) or coconut water for natural hydration."
};

// 1. Get Chatbot Response
export async function getChatbotResponse(params: { 
  messages: ChatMessage[]; 
  apiKey?: string;
}): Promise<string> {
  const key = params.apiKey || process.env.EXPO_PUBLIC_LOVABLE_API_KEY || process.env.LOVABLE_API_KEY;

  if (!key) {
    return runLocalChatbotFallback(params.messages);
  }

  try {
    // If direct Google Gemini API Key
    if (key.startsWith("AIzaSy")) {
      return await callGeminiChatDirect(key, params.messages);
    }

    // Otherwise use Lovable AI Gateway
    const gatewayMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...params.messages
    ];

    const content = await callGateway({
      model: "google/gemini-2.5-flash",
      messages: gatewayMessages,
    }, key);
    
    return content;
  } catch (err) {
    console.warn("AI Chatbot request failed, falling back to local engine:", err);
    return runLocalChatbotFallback(params.messages);
  }
}

// Local offline chatbot engine
async function runLocalChatbotFallback(messages: ChatMessage[]): Promise<string> {
  const lastUserMsg = messages.filter(m => m.role === 'user').pop();
  if (!lastUserMsg) {
    return "I didn't receive your message. Please try typing a question!";
  }

  const query = lastUserMsg.content.toLowerCase().trim();

  // 1. Check quick offline FAQ matches
  for (const faqKey of Object.keys(OFFLINE_FAQ)) {
    if (query.includes(faqKey) || faqKey.includes(query)) {
      return OFFLINE_FAQ[faqKey];
    }
  }

  // 2. Wikipedia search fallback for general queries
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const results = searchData.query?.search;
    if (results && results.length > 0) {
      const pageTitle = results[0].title;
      const detailUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`;
      const detailRes = await fetch(detailUrl);
      const detailData = await detailRes.json();
      const pages = detailData.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        const page = pages[pageId];
        if (page && page.extract) {
          return `Here is some information about ${pageTitle} for your trip:\n\n${page.extract.substring(0, 400)}...\n\n(Tip: Enter your Gemini API Key in settings to unlock real-time conversational AI traveler advice!)`;
        }
      }
    }
  } catch (e) {
    console.warn("Local Wikipedia chatbot fallback failed:", e);
  }

  // Generic fallback if Wikipedia yields nothing or fails
  return "I am currently running in offline fallback mode. I can give basic answers for common travel questions (try asking about 'safety' or 'food') or search Wikipedia. To unlock smart, human-like guide chat, please enter your Gemini API Key using the Settings gear at the top right of this screen!";
}

// ----------------------------------------------------
// API HELPER FUNCTIONS
// ----------------------------------------------------

async function callGateway(body: unknown, customKey?: string) {
  const key = customKey || process.env.EXPO_PUBLIC_LOVABLE_API_KEY || process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const r = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "raw",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`AI gateway ${r.status}: ${txt}`);
  }
  const json = (await r.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return json.choices[0]?.message?.content ?? "";
}

async function callGeminiChatDirect(apiKey: string, messages: ChatMessage[]): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  // Format conversational history for Gemini API
  const contents = messages.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: contents,
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.7
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini direct API error: ${errorText}`);
  }

  const json = await response.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? "I was unable to formulate a response.";
}
