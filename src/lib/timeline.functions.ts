const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

export interface TimelineEra {
  year: number;
  title: string;
  description: string;
  appearance: string; // short visual description of how it looked then
  image?: any;        // local fallback asset if applicable
}

export interface IdentifiedMonument {
  name: string;
  location: string;
  confidence: number;
  summary: string;
}

// Predefined fallback datasets to ensure 100% offline functionality
const PREDEFINED_FALLBACKS: Record<string, { name: string; location: string; confidence: number; summary: string; builtYear: number; eras: TimelineEra[] }> = {
  'taj-mahal': {
    name: 'Taj Mahal',
    location: 'Agra, Uttar Pradesh',
    confidence: 0.98,
    summary: 'The Taj Mahal is an Islamic ivory-white marble mausoleum on the south bank of the Yamuna river in Agra, India, commissioned in 1631 by the Mughal emperor Shah Jahan to house the tomb of his favourite wife, Mumtaz Mahal.',
    builtYear: 1631,
    eras: [
      { year: 1631, title: 'Construction Begins', description: 'Shah Jahan commissions the mausoleum following the death of Mumtaz Mahal. Foundation wells are dug.', appearance: 'Dug foundations, wooden scaffolding, white marble blocks stacked by workers next to the Yamuna river.', image: require('@/assets/images/timeline/taj_1631.png') },
      { year: 1648, title: 'Main Dome Completed', description: 'The main white marble mausoleum and its central dome are completed. 20,000 artisans worked on the site.', appearance: 'Pristine white marble dome completed, minarets rising, surrounded by Mughal gardens.', image: require('@/assets/images/timeline/taj_1631.png') },
      { year: 1857, title: 'British Raj Era', description: 'Soldiers deface parts of the stone inlay. The gardens are overgrown and neglected during the Indian Rebellion.', appearance: 'Weathered marble walls, overgrown wild garden bushes, soldiers camped nearby.', image: require('@/assets/images/timeline/taj_1857.png') },
      { year: 1908, title: 'Curzon Restoration', description: 'Viceroy Lord Curzon initiates restoration, transforming the Charbagh garden into clean British lawns.', appearance: 'Manicured symmetrical lawns, restored marble channels, cleaner monument facade.', image: require('@/assets/images/timeline/taj_1857.png') },
      { year: 1942, title: 'War Camouflage', description: 'A massive bamboo scaffolding is built over the dome to disguise it from potential Japanese air attacks.', appearance: 'Marble dome covered entirely with a massive dome-shaped bamboo cage scaffolding.', image: require('@/assets/images/timeline/taj_1857.png') },
      { year: 2026, title: 'Modern Day Preservation', description: 'Strict anti-pollution zones (Taj Trapezium) are active. The monument stands as a global symbol of love.', appearance: 'Immaculate white marble polished, tourists in modern dress in foreground, blue skies.', image: require('@/assets/images/timeline/taj_2026.png') }
    ]
  },
  'hawa-mahal': {
    name: 'Hawa Mahal',
    location: 'Jaipur, Rajasthan',
    confidence: 0.97,
    summary: 'Hawa Mahal is a palace in the city of Jaipur, India. Built from red and pink sandstone, the palace sits on the edge of the City Palace, Jaipur, and extends to the Zenana, or women\'s chambers.',
    builtYear: 1799,
    eras: [
      { year: 1799, title: 'Royal Inauguration', description: 'Maharaja Sawai Pratap Singh builds Hawa Mahal, the Palace of Winds, for royal women to witness street festivals.', appearance: 'Fresh pink sandstone facade, royal guards stationed, elephants on dirt roads.', image: require('@/assets/images/timeline/hawa_1799.png') },
      { year: 1880, title: 'Colonial Era Streets', description: 'Jaipur is painted pink. Hawa Mahal stands on a bustling dirt road lined with royal elephant stables.', appearance: 'Coral pink facade, horse carriages on dirt road, traditional Rajasthani merchants.', image: require('@/assets/images/timeline/hawa_1799.png') },
      { year: 1960, title: 'State Heritage Site', description: 'The Archaeological Department takes control. The 953 jharokhas are restored with vintage woodwork.', appearance: 'Restored woodwork on window frames, early black and white photography era.', image: require('@/assets/images/timeline/hawa_2026.png') },
      { year: 2026, title: 'Pink City Landmark', description: 'Hawa Mahal is preserved in pristine coral pink, illuminated by thousands of lights at dusk.', appearance: 'Vibrant pink and red sandstone illuminated at night, busy modern paved city streets.', image: require('@/assets/images/timeline/hawa_2026.png') }
    ]
  },
  'qutub-minar': {
    name: 'Qutub Minar',
    location: 'Delhi',
    confidence: 0.96,
    summary: 'The Qutb Minar is a minaret and "victory tower" that forms part of the Qutb complex, which lies at the site of Delhi\'s oldest fortified city, Lal Kot, founded by the Tomar Rajputs.',
    builtYear: 1199,
    eras: [
      { year: 1199, title: 'First Storey Built', description: 'Qutb-ud-din Aibak constructs the red sandstone base storey of the victory tower.', appearance: 'A single short cylindrical red sandstone tower amidst early Islamic ruins.', image: require('@/assets/images/timeline/qutub_1200.png') },
      { year: 1220, title: 'Tower Completed', description: 'Iltutmish adds three more storeys to the tower, making it a prominent Delhi landmark.', appearance: 'Tall red sandstone minaret with distinctive balconies rising high above the ruins.', image: require('@/assets/images/timeline/qutub_1200.png') },
      { year: 1368, title: 'Lightning Strike & Repair', description: 'Firoz Shah Tughlaq repairs the top storey damaged by lightning and adds two marble storeys.', appearance: 'Restored top storeys in white marble contrasting with red sandstone lower storeys.', image: require('@/assets/images/timeline/qutub_1803.png') },
      { year: 1828, title: 'Major Earthquake Repair', description: 'Major Robert Smith of the British Army restores the minar, adding a cupola on top which is later removed.', appearance: 'Tower with a gothic cupola dome installed at the very top.', image: require('@/assets/images/timeline/qutub_1803.png') },
      { year: 2026, title: 'UNESCO World Heritage', description: 'Protected by laser-scanning technology to monitor its tilt. Visitors explore the Qutub complex.', appearance: 'Pristine red sandstone minaret standing straight under blue skies, surrounded by ruins.', image: require('@/assets/images/timeline/qutub_2026.png') }
    ]
  },
  'india-gate': {
    name: 'India Gate',
    location: 'New Delhi',
    confidence: 0.97,
    summary: 'The India Gate is a war memorial located astride the Rajpath, on the eastern edge of the "ceremonial axis" of New Delhi, formerly called Kingsway.',
    builtYear: 1921,
    eras: [
      { year: 1921, title: 'Foundation Stone', description: 'Duke of Connaught lays the foundation stone of the All India War Memorial arch designed by Edwin Lutyens.', appearance: 'Construction site showing foundation excavations and columns rising in New Delhi plains.', image: require('@/assets/images/timeline/indiagate_1921.png') },
      { year: 1931, title: 'Inauguration', description: 'Lord Irwin dedicates the memorial to 70,000 British Indian Army soldiers who died in WWI.', appearance: 'Completed stone memorial arch, vintage British-Indian military parade, dirt lawns.', image: require('@/assets/images/timeline/indiagate_1921.png') },
      { year: 1972, title: 'Amar Jawan Jyoti', description: 'Following the 1971 war, the eternal flame is lit beneath the arch to honor unknown soldiers.', appearance: 'Arch with black marble pedestal and inverted rifle monument beneath it, burning flame.', image: require('@/assets/images/timeline/indiagate_1971.png') },
      { year: 2026, title: 'Kartavya Path Renewal', description: 'The memorial sits at the center of the revamped Central Vista, featuring a new statue of Netaji Bose.', appearance: 'Lush green avenues, paved pathways, stone canopy containing a black granite statue of Bose.', image: require('@/assets/images/timeline/indiagate_2026.png') }
    ]
  }
};

// Main function caller
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

// Direct Google Gemini API Call (Client-Side)
async function callGeminiDirect(apiKey: string, prompt: string, base64ImageWithHeader: string): Promise<string> {
  const match = base64ImageWithHeader.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image format. Please capture a new image or upload a standard PNG/JPG.");
  const mimeType = match[1];
  const base64Data = match[2];

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini direct API error: ${errorText}`);
  }

  const json = await response.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function callGeminiTimelineDirect(apiKey: string, monumentName: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `You are a historian of Indian architecture. For the monument "${monumentName}", return a JSON object: {"name": string, "builtYear": number, "eras": Array<{"year": number, "title": string, "description": string (2-3 sentences), "appearance": string (1 sentence describing visual state and surroundings then)}>}. Provide 5-7 eras spanning from construction to today (2026), in ascending year order. Be historically accurate.`
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini direct API error: ${errorText}`);
  }

  const json = await response.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

function extractJson<T>(raw: string): T {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  return JSON.parse(cleaned) as T;
}

// 1. Identify Monument API
export async function identifyMonument(params: { imageDataUrl: string; hint?: string; apiKey?: string }): Promise<IdentifiedMonument> {
  const key = params.apiKey || process.env.EXPO_PUBLIC_LOVABLE_API_KEY || process.env.LOVABLE_API_KEY;

  if (!key) {
    // Falls back to local recognition
    return runLocalIdentification(params);
  }

  try {
    // If it's a direct Google Gemini API Key (typically starts with AIzaSy)
    if (key.startsWith("AIzaSy")) {
      const prompt = "You identify Indian monuments and landmarks from a photo. Respond ONLY with strict JSON: {\"name\": string, \"location\": string, \"confidence\": number 0-1, \"summary\": string}. If you can\'t identify, use name: \"Unknown\" and confidence: 0.";
      const content = await callGeminiDirect(key, prompt, params.imageDataUrl);
      return extractJson<IdentifiedMonument>(content);
    }

    // Otherwise use Lovable AI Gateway
    const content = await callGateway({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content:
            "You identify Indian monuments and landmarks from a photo. Respond ONLY with strict JSON: {\"name\": string, \"location\": string, \"confidence\": number 0-1, \"summary\": string}. If you can't identify, use name: \"Unknown\" and confidence: 0.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "Identify the monument in this photo." +
                (params.hint ? ` Hint: it may be near ${params.hint}.` : ""),
            },
            { type: "image_url", image_url: { url: params.imageDataUrl } },
          ],
        },
      ],
    }, key);
    return extractJson<IdentifiedMonument>(content);
  } catch (err) {
    console.warn("AI Identification failed, falling back to local client recognition:", err);
    return runLocalIdentification(params);
  }
}

// 2. Get Monument Timeline API
export async function getMonumentTimeline(params: { name: string; apiKey?: string }): Promise<{ name: string; builtYear: number; eras: TimelineEra[] }> {
  const key = params.apiKey || process.env.EXPO_PUBLIC_LOVABLE_API_KEY || process.env.LOVABLE_API_KEY;

  // Check predefined monuments first
  const normalized = params.name.toLowerCase().replace(/[\s_-]+/g, '-');
  for (const presetKey of Object.keys(PREDEFINED_FALLBACKS)) {
    if (normalized.includes(presetKey) || presetKey.includes(normalized)) {
      return {
        name: PREDEFINED_FALLBACKS[presetKey].name,
        builtYear: PREDEFINED_FALLBACKS[presetKey].builtYear,
        eras: PREDEFINED_FALLBACKS[presetKey].eras
      };
    }
  }

  if (!key) {
    return runLocalWikipediaTimeline(params.name);
  }

  try {
    // If it's a direct Google Gemini API Key
    if (key.startsWith("AIzaSy")) {
      const content = await callGeminiTimelineDirect(key, params.name);
      return extractJson<{ name: string; builtYear: number; eras: TimelineEra[] }>(content);
    }

    // Otherwise use Lovable Gateway
    const content = await callGateway({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content:
            "You are a historian of Indian architecture. For a given monument, return a JSON object: {\"name\": string, \"builtYear\": number, \"eras\": Array<{\"year\": number, \"title\": string, \"description\": string (2-3 sentences), \"appearance\": string (1 sentence describing visual state and surroundings then)}>}. Provide 5-7 eras spanning from construction to today (2026), in ascending year order. Be historically accurate.",
        },
        {
          role: "user",
          content: `Monument: ${params.name}`,
        },
      ],
    }, key);
    return extractJson<{
      name: string;
      builtYear: number;
      eras: TimelineEra[];
    }>(content);
  } catch (err) {
    console.warn("Timeline generation failed, falling back to Wikipedia parser:", err);
    return runLocalWikipediaTimeline(params.name);
  }
}

// 3. Generate Era Image API
export async function generateEraImage(params: { name: string; year: number; appearance: string; apiKey?: string }): Promise<{ dataUrl: string | null }> {
  const key = params.apiKey || process.env.EXPO_PUBLIC_LOVABLE_API_KEY || process.env.LOVABLE_API_KEY;
  if (!key || key.startsWith("AIzaSy")) {
    // Gemini model does not generate images directly, so we return null to trigger CSS aging filter fallback
    return { dataUrl: null };
  }

  const prompt = `Photorealistic depiction of the ${params.name} as it appeared in the year ${params.year}. ${params.appearance}. Show the monument and its immediate surroundings authentically for that era — period-appropriate people, clothing, vehicles, vegetation, and weathering. ${
    params.year < 1900
      ? "Style: detailed historical painting or early lithograph, slightly faded."
      : params.year < 1950
      ? "Style: vintage sepia photograph with grain."
      : params.year < 1990
      ? "Style: faded color film photograph from the era."
      : "Style: modern high-resolution photograph."
  } No text, no captions, no watermarks.`;

  try {
    const r = await fetch(
      "https://ai.gateway.lovable.dev/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-image-2",
          prompt,
          size: "1024x1024",
          quality: "low",
          n: 1,
        }),
      },
    );
    if (!r.ok) {
      const txt = await r.text();
      throw new Error(`Image gen ${r.status}: ${txt}`);
    }
    const json = (await r.json()) as { data?: Array<{ b64_json?: string }> };
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) throw new Error("No image returned");
    return { dataUrl: `data:image/png;base64,${b64}` };
  } catch (err) {
    console.error("AI Image generation failed:", err);
    return { dataUrl: null };
  }
}

// ----------------------------------------------------
// LOCAL FALLBACK ENGINES
// ----------------------------------------------------

async function runLocalIdentification(params: { imageDataUrl: string; hint?: string }): Promise<IdentifiedMonument> {
  let searchHint = params.hint;
  if (searchHint) {
    // Clean file extension if present (e.g. .jpg, .png, etc.)
    searchHint = searchHint.replace(/\.[a-zA-Z0-9]+$/, '');
    // Clean separators like underscores, hyphens, etc.
    searchHint = searchHint.replace(/[\s_-]+/g, ' ').trim();
  }

  // Check for predefined monument keywords in hint
  if (searchHint) {
    const lowerHint = searchHint.toLowerCase();
    if (lowerHint.includes('taj')) {
      return {
        name: PREDEFINED_FALLBACKS['taj-mahal'].name,
        location: PREDEFINED_FALLBACKS['taj-mahal'].location,
        confidence: 0.98,
        summary: PREDEFINED_FALLBACKS['taj-mahal'].summary
      };
    }
    if (lowerHint.includes('hawa')) {
      return {
        name: PREDEFINED_FALLBACKS['hawa-mahal'].name,
        location: PREDEFINED_FALLBACKS['hawa-mahal'].location,
        confidence: 0.97,
        summary: PREDEFINED_FALLBACKS['hawa-mahal'].summary
      };
    }
    if (lowerHint.includes('qutub') || lowerHint.includes('qutb')) {
      return {
        name: PREDEFINED_FALLBACKS['qutub-minar'].name,
        location: PREDEFINED_FALLBACKS['qutub-minar'].location,
        confidence: 0.96,
        summary: PREDEFINED_FALLBACKS['qutub-minar'].summary
      };
    }
    if (lowerHint.includes('india') && lowerHint.includes('gate')) {
      return {
        name: PREDEFINED_FALLBACKS['india-gate'].name,
        location: PREDEFINED_FALLBACKS['india-gate'].location,
        confidence: 0.97,
        summary: PREDEFINED_FALLBACKS['india-gate'].summary
      };
    }
  }

  // If a coordinate hint was provided, try geosearch
  if (params.hint && params.hint.includes(",")) {
    const coords = params.hint.split(",");
    const lat = parseFloat(coords[0]);
    const lng = parseFloat(coords[1]);
    if (!isNaN(lat) && !isNaN(lng)) {
      try {
        const geoUrl = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lng}&gsradius=2000&gslimit=3&format=json&origin=*`;
        const res = await fetch(geoUrl);
        const data = await res.json();
        const results = data.query?.geosearch;
        if (results && results.length > 0) {
          const wikiRes = await fetchWikipediaInfo(results[0].title);
          if (wikiRes) return wikiRes;
        }
      } catch (e) {
        console.warn("Geosearch failed:", e);
      }
    }
  }

  // If a cleaned text hint is available, try Wikipedia search
  if (searchHint && searchHint.length > 3) {
    const wikiRes = await fetchWikipediaInfo(searchHint);
    if (wikiRes) return wikiRes;
  }

  // Fallback as unknown to force manual search calibration popup in UI
  return {
    name: "Unknown",
    location: "Unknown",
    confidence: 0,
    summary: ""
  };
}

async function fetchWikipediaInfo(name: string): Promise<IdentifiedMonument | null> {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const results = searchData.query?.search;
    if (!results || results.length === 0) return null;

    const pageTitle = results[0].title;
    const detailUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages|coordinates&exintro&explaintext&titles=${encodeURIComponent(pageTitle)}&pithumbsize=1000&format=json&origin=*`;
    const detailRes = await fetch(detailUrl);
    const detailData = await detailRes.json();
    const pages = detailData.query?.pages;
    if (!pages) return null;
    const pageId = Object.keys(pages)[0];
    const page = pages[pageId];

    if (!page || page.missing === "") return null;

    const extract = page.extract || '';
    const sentences = extract.split(/(?<=[.!?])\s+/);
    const firstSentence = sentences[0] || '';

    let location = 'India';
    const inMatch = firstSentence.match(/in ([A-Z][a-zA-Z\s]+)(?:,|\.|\b)/);
    if (inMatch && inMatch[1]) {
      location = inMatch[1].trim();
    }

    return {
      name: pageTitle,
      location: location,
      confidence: 0.9,
      summary: extract.substring(0, 300) + (extract.length > 300 ? "..." : "")
    };
  } catch (err) {
    console.error("Wikipedia fetch failed:", err);
    return null;
  }
}

async function runLocalWikipediaTimeline(name: string): Promise<{ name: string; builtYear: number; eras: TimelineEra[] }> {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const results = searchData.query?.search;
    if (!results || results.length === 0) throw new Error("Not found");

    const pageTitle = results[0].title;
    const detailUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exintro&explaintext&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`;
    const detailRes = await fetch(detailUrl);
    const detailData = await detailRes.json();
    const pages = detailData.query?.pages;
    if (!pages) throw new Error("No pages");
    const pageId = Object.keys(pages)[0];
    const page = pages[pageId];

    const extract = page.extract || '';
    const yearRegex = /\b(1\d{3}|20[0-2]\d)\b/g;
    const matches = extract.match(yearRegex) || [];
    const numberMatches = matches.map((m: string) => Number(m));
    const uniqueYearsSet = new Set<number>(numberMatches);
    const uniqueYearsArray = Array.from(uniqueYearsSet);
    const years = uniqueYearsArray
      .filter((y: number) => y >= 500 && y <= 2026)
      .sort((a, b) => a - b);

    const sentences = extract.split(/(?<=[.!?])\s+/);
    const eras: TimelineEra[] = [];
    let builtYear = 1800;

    if (years.length > 0) {
      builtYear = years[0];
    }

    years.forEach((yr) => {
      const sentence = sentences.find((s: string) => s.includes(yr.toString()));
      if (sentence) {
        let cleanDesc = sentence.trim();
        if (cleanDesc.length > 200) {
          cleanDesc = cleanDesc.substring(0, 197) + '...';
        }

        let title = 'Historic Milestone';
        let appearance = 'The structure reflects the architecture and natural environment of its time.';

        if (yr === builtYear) {
          title = 'Establishment & Origins';
          appearance = `The monument is recently built, showing fresh masonry work and architectural carvings.`;
        } else if (yr === 2026) {
          title = 'Modern Day Preservation';
          appearance = 'Well-preserved stonework surrounded by tourist amenities and paved pathways.';
        } else if (cleanDesc.toLowerCase().includes('build') || cleanDesc.toLowerCase().includes('construct')) {
          title = 'Construction Extension';
          appearance = 'Scaffolding and raw construction materials visible as workers expand the structure.';
        } else if (cleanDesc.toLowerCase().includes('restore') || cleanDesc.toLowerCase().includes('repair')) {
          title = 'Major Restoration';
          appearance = 'Repaired stone walls, clean courtyards, and restored facades showing preserved elements.';
        }

        eras.push({
          year: yr,
          title: title,
          description: cleanDesc,
          appearance: appearance
        });
      }
    });

    if (eras.length === 0) {
      eras.push({
        year: builtYear,
        title: 'Establishment',
        description: `${pageTitle} is documented as being founded.`,
        appearance: 'Raw construction and early architectural lines.'
      });
    }

    if (!eras.some(e => e.year === 2026)) {
      eras.push({
        year: 2026,
        title: 'Modern Day Preservation',
        description: `${pageTitle} stands today as an iconic cultural landmark preserved for future generations.`,
        appearance: 'Symmetrical grounds, tourist walkway pathways, modern landscape preservation.'
      });
    }

    // Sort ascending
    eras.sort((a, b) => a.year - b.year);

    return {
      name: pageTitle,
      builtYear: builtYear,
      eras: eras
    };
  } catch (err) {
    // Final absolute default
    return {
      name: name,
      builtYear: 1800,
      eras: [
        { year: 1800, title: 'Foundations', description: `${name} is commissioned and early construction begins on its foundations.`, appearance: 'Wooden frameworks, fresh stonework, busy building grounds.' },
        { year: 1900, title: 'Historical Development', description: `${name} undergoes minor expansions and architectural changes under regional administration.`, appearance: 'Weathered stone surfaces, horse carts nearby, vintage landscape.' },
        { year: 2026, title: 'Modern Heritage', description: `${name} stands preserved today, serving as a popular destination for tourists and history enthusiasts.`, appearance: 'Polished masonry, paved access roads, crowds of modern visitors.' }
      ]
    };
  }
}
