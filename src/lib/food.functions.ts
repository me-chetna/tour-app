const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

export interface FoodAlternative {
  name: string;
  whyBetter: string;
  nutritionBenefit: string;
  portability: string;
}

export interface FoodScanResult {
  identifiedFood: string;
  brand: string;
  nutritionalSummary: string;
  alternatives: FoodAlternative[];
}

export const FOOD_PRESETS: Record<string, FoodScanResult> = {
  'lays': {
    identifiedFood: "Lay's Potato Chips",
    brand: "Lay's (PepsiCo)",
    nutritionalSummary: "High in sodium, trans fats, and empty calories. Leads to water retention and quick dehydration on long road trips.",
    alternatives: [
      {
        name: "Roasted Makhana (Foxnuts)",
        whyBetter: "Light, crunchy, low in calories, and roasted in minimal ghee/olive oil instead of deep frying.",
        nutritionBenefit: "Excellent source of protein, fiber, and potassium with zero trans fat.",
        portability: "Extremely lightweight, does not break easily in zip-lock bags, and stays fresh for weeks."
      },
      {
        name: "Roasted Chickpeas (Chana)",
        whyBetter: "Savory, crunchy snack that satisfies chip cravings but releases energy slowly to keep you full.",
        nutritionBenefit: "High plant protein, complex carbohydrates, and iron. Keeps blood sugar stable.",
        portability: "Highly stable, compact packaging, does not melt or crumble."
      },
      {
        name: "Baked Vegetable Straws / Chips",
        whyBetter: "Baked instead of fried, with significantly less oil, salt, and preservatives.",
        nutritionBenefit: "Vitamins A & C, low fat content, and made from real vegetables like spinach, beets, and carrots.",
        portability: "Lightweight bags, easily resealable for long train or car trips."
      }
    ]
  },
  'coke': {
    identifiedFood: "Coca-Cola Soda",
    brand: "Coca-Cola",
    nutritionalSummary: "Packed with high-fructose corn syrup and caffeine. Causes sharp insulin spikes followed by fatigue, crashes, and mild dehydration.",
    alternatives: [
      {
        name: "Tender Coconut Water",
        whyBetter: "100% natural, refreshing drink that matches your body's fluid balance.",
        nutritionBenefit: "Rich in essential electrolytes (potassium, magnesium) for natural hydration without added sugars.",
        portability: "Packaged in tetra-packs or natural shells, leak-proof, and easy to drink on-the-go."
      },
      {
        name: "Masala Chaas (Spiced Buttermilk)",
        whyBetter: "Traditional Indian cooling drink that aids digestion during long travels.",
        nutritionBenefit: "Probiotics for gut health, calcium, and vitamin B12. Helps soothe travel fatigue.",
        portability: "Comes in convenient travel cartons/bottles, best consumed chilled or at room temperature."
      },
      {
        name: "Nimbu Pani (Spiced Lemonade)",
        whyBetter: "Tangy, low-sugar beverage that instantly refreshes and helps with motion sickness.",
        nutritionBenefit: "High in Vitamin C, boosts immunity, and contains rock salt to replenish lost sodium.",
        portability: "Easily prepared in a reusable travel bottle or purchased in ready-to-drink containers."
      }
    ]
  },
  'oreo': {
    identifiedFood: "Oreo Cookies",
    brand: "Nabisco (Mondelēz)",
    nutritionalSummary: "Extremely high sugar, refined wheat flour, and saturated palm oils. Promotes fatigue and sugar cravings shortly after eating.",
    alternatives: [
      {
        name: "Granola Oats & Nut Bar",
        whyBetter: "Dense in whole oats and almonds that provide sustained energy during long hikes or drives.",
        nutritionBenefit: "High dietary fiber, healthy monounsaturated fats, and slow-release energy.",
        portability: "Individually wrapped, fits in pockets, does not melt or crumble easily."
      },
      {
        name: "Dry Fruits & Nuts Mix",
        whyBetter: "Naturally sweet and highly calorie-dense snack that fuels active travel.",
        nutritionBenefit: "Packed with antioxidants, proteins, magnesium, and natural fruit sugars.",
        portability: "Stays fresh without refrigeration, extremely compact, and resealable."
      },
      {
        name: "Dark Chocolate Oatmeal Cookies",
        whyBetter: "Lower sugar alternative made with whole grains and antioxidant-rich dark chocolate.",
        nutritionBenefit: "High fiber, lower glycemic index, and provides a gentle cocoa boost.",
        portability: "Sturdy, easy to store in side-pouches of travel backpacks."
      }
    ]
  },
  'maggi': {
    identifiedFood: "Maggi Instant Noodles",
    brand: "Nestlé",
    nutritionalSummary: "Made of refined flour (Maida), palm oil, and high sodium content in the tastemaker. Stiffens digestion and lacks dietary fiber.",
    alternatives: [
      {
        name: "Millet Instant Cup Noodles",
        whyBetter: "Made from healthy millets (Ragi, Jowar) instead of refined maida flour, cooked in under 5 minutes.",
        nutritionBenefit: "High iron, calcium, and complex carbs. Promotes easy digestion while traveling.",
        portability: "Comes in travel cups — just add hot water, convenient for hotel stays or train journeys."
      },
      {
        name: "Roasted Seeds Mix (Pumpkin, Sunflower, Flax)",
        whyBetter: "Ready-to-eat savory snack that requires no cooking or hot water prep.",
        nutritionBenefit: "Rich in Omega-3 fatty acids, zinc, magnesium, and plant proteins.",
        portability: "Extremely compact, lightweight pouches that slip into any pocket."
      },
      {
        name: "Instant Masala Oats Cup",
        whyBetter: "Warm, savory meal option made with 100% whole grain oats and travel spices.",
        nutritionBenefit: "Beta-glucan fiber (excellent for cholesterol), low fat, and very filling.",
        portability: "Lightweight cups with folding spoons, just add hot water."
      }
    ]
  },
  'kitkat': {
    identifiedFood: "KitKat Chocolate Bar",
    brand: "Nestlé",
    nutritionalSummary: "High refined sugar and saturated fats. Melts easily in warm weather, creating travel mess, and causes rapid energy crashes.",
    alternatives: [
      {
        name: "Whey Protein Travel Bar",
        whyBetter: "Fills you up, satisfies sweet cravings, and doesn't melt easily.",
        nutritionBenefit: "15-20g of high-quality whey protein, low active sugar, and essential amino acids.",
        portability: "Sturdy wrapper, stays solid at room temperature, great for post-activity energy."
      },
      {
        name: "Stuffed Dates with Almonds",
        whyBetter: "Natural caramel-like sweetness from dates paired with the crunch of almonds.",
        nutritionBenefit: "High potassium, fiber, copper, and healthy fats. Natural energy booster.",
        portability: "Does not melt, highly stable, packed in lightweight boxes."
      },
      {
        name: "Granola Crisp Bars",
        whyBetter: "Baked whole grains that offer a satisfying crunch similar to wafers, but with real nutrients.",
        nutritionBenefit: "Fiber-rich, low sodium, sweetened with natural honey or jaggery.",
        portability: "Individual packages, lightweight, and durable during travel."
      }
    ]
  },
  'kurkure': {
    identifiedFood: "Kurkure Masala Munch",
    brand: "PepsiCo",
    nutritionalSummary: "Fried cornmeal and rice meal snack coated in high sodium, spice extracts, and preservatives. Heavy on gut and causes acid reflux during travel.",
    alternatives: [
      {
        name: "Roasted Popcorn",
        whyBetter: "Air-popped whole grain snack that is high in volume but low in calorie density.",
        nutritionBenefit: "100% whole grain, rich in polyphenols (antioxidants), and high fiber.",
        portability: "Large volume but very light, keeps fresh in zip bags."
      },
      {
        name: "Spicy Puffed Rice (Sukha Bhel)",
        whyBetter: "Classic Indian travel snack made with puffed rice, roasted peanuts, chana, and dry spices.",
        nutritionBenefit: "Extremely low calorie, low fat, and peanut addition adds protein.",
        portability: "Very dry and stable, does not spoil, and easy to share."
      },
      {
        name: "Soya Chips / Crisps",
        whyBetter: "Crunchy savory snacks made from soybean flour, providing a similar texture to Kurkure.",
        nutritionBenefit: "Significantly higher protein and fiber than potato/corn snacks, baked rather than fried.",
        portability: "Resistant to crushing, easy to carry in zip bags."
      }
    ]
  }
};

const GENERIC_FOOD_FALLBACK: FoodScanResult = {
  identifiedFood: "Packaged Food Snack",
  brand: "Unknown Brand",
  nutritionalSummary: "Likely contains refined carbohydrates, preservatives, sodium, or artificial sugars. Can lead to energy crashes and hydration issues on active trips.",
  alternatives: [
    {
      name: "Mixed Nuts and Seeds",
      whyBetter: "Gives sustained energy release, does not spoil, and contains zero artificial additives.",
      nutritionBenefit: "Healthy fats, protein, and dietary fiber.",
      portability: "Extremely compact, pocket-friendly, and lightweight."
    },
    {
      name: "Fresh Fruits (Banana or Apple)",
      whyBetter: "Naturally packaged, hydrating, and provides easy-to-digest carbs for quick energy.",
      nutritionBenefit: "High in potassium, vitamin C, and dietary fiber.",
      portability: "Apple and bananas are easy to carry and require no washing/peeling tools."
    },
    {
      name: "Roasted Makhana or Chana",
      whyBetter: "Crunchy, dry, savory snack that does not crumble or spoil, providing a clean alternative to chips.",
      nutritionBenefit: "Rich in plant protein and essential minerals.",
      portability: "Very lightweight, easily packable in bags."
    }
  ]
};

// 1. Scan packaged food item (Vision API)
export async function scanFoodItem(params: { imageDataUrl: string; hint?: string; apiKey?: string }): Promise<FoodScanResult> {
  const key = params.apiKey || process.env.EXPO_PUBLIC_LOVABLE_API_KEY || process.env.LOVABLE_API_KEY;

  if (!key) {
    return runLocalFoodIdentification(params);
  }

  const prompt = `You identify packaged food items from a photo. Suggest 3 healthier, trip-friendly alternatives that are easy to carry, store well, and are nutritious for traveling. Respond ONLY with strict JSON:
{
  "identifiedFood": "Name of the packaged food",
  "brand": "Brand name if visible, or Unknown",
  "nutritionalSummary": "Brief summary of its cons (e.g. high sodium, high sugar, energy crashes, dehydration risk on trips)",
  "alternatives": [
    {
      "name": "Alternative food name",
      "whyBetter": "Reason why it is a better travel option",
      "nutritionBenefit": "Nutritional benefit (e.g. high protein, low sugar)",
      "portability": "How easy it is to carry during trips"
    }
  ]
}`;

  try {
    if (key.startsWith("AIzaSy")) {
      const content = await callGeminiDirect(key, prompt, params.imageDataUrl);
      return extractJson<FoodScanResult>(content);
    }

    const content = await callGateway({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: prompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Identify this packaged food and generate travel alternatives." + (params.hint ? ` Hint: item filename is ${params.hint}.` : "")
            },
            { type: "image_url", image_url: { url: params.imageDataUrl } }
          ]
        }
      ]
    }, key);
    return extractJson<FoodScanResult>(content);
  } catch (err) {
    console.warn("AI Food scan failed, falling back to local scanner:", err);
    return runLocalFoodIdentification(params);
  }
}

// 2. Search food item by text query
export async function searchFoodItem(params: { name: string; apiKey?: string }): Promise<FoodScanResult> {
  const key = params.apiKey || process.env.EXPO_PUBLIC_LOVABLE_API_KEY || process.env.LOVABLE_API_KEY;

  const normalized = params.name.toLowerCase().trim();
  for (const presetKey of Object.keys(FOOD_PRESETS)) {
    if (normalized.includes(presetKey) || presetKey.includes(normalized)) {
      return FOOD_PRESETS[presetKey];
    }
  }

  if (!key) {
    return runLocalWikipediaFoodSearch(params.name);
  }

  const prompt = `Identify healthy, travel-friendly alternatives for the packaged food item: "${params.name}". Return a JSON object with: {"identifiedFood": string, "brand": string, "nutritionalSummary": string, "alternatives": Array<{"name": string, "whyBetter": string, "nutritionBenefit": string, "portability": string}>}. Provide exactly 3 healthy, non-perishable travel alternative snacks.`;

  try {
    if (key.startsWith("AIzaSy")) {
      const content = await callGeminiTextDirect(key, prompt);
      return extractJson<FoodScanResult>(content);
    }

    const content = await callGateway({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    }, key);
    return extractJson<FoodScanResult>(content);
  } catch (err) {
    console.warn("AI Food alternatives search failed, falling back to local search:", err);
    return runLocalWikipediaFoodSearch(params.name);
  }
}

// ----------------------------------------------------
// LOCAL FALLBACK ENGINES
// ----------------------------------------------------

function runLocalFoodIdentification(params: { imageDataUrl: string; hint?: string }): FoodScanResult {
  let searchHint = params.hint;
  if (searchHint) {
    searchHint = searchHint.replace(/\.[a-zA-Z0-9]+$/, '');
    searchHint = searchHint.replace(/[\s_-]+/g, ' ').trim();
  }

  if (searchHint) {
    const lowerHint = searchHint.toLowerCase();
    for (const presetKey of Object.keys(FOOD_PRESETS)) {
      if (lowerHint.includes(presetKey) || presetKey.includes(lowerHint)) {
        return FOOD_PRESETS[presetKey];
      }
    }
  }

  return GENERIC_FOOD_FALLBACK;
}

async function runLocalWikipediaFoodSearch(name: string): Promise<FoodScanResult> {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const results = searchData.query?.search;
    if (!results || results.length === 0) throw new Error("Not found");

    const pageTitle = results[0].title;
    const detailUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`;
    const detailRes = await fetch(detailUrl);
    const detailData = await detailRes.json();
    const pages = detailData.query?.pages;
    if (!pages) throw new Error("No pages");
    const pageId = Object.keys(pages)[0];
    const page = pages[pageId];

    const extract = (page.extract || '').substring(0, 250);

    return {
      identifiedFood: pageTitle,
      brand: "Packaged Product",
      nutritionalSummary: extract || `Packaged food item associated with ${pageTitle}. High in sugars, sodium, or oils which can impact travel energy.`,
      alternatives: GENERIC_FOOD_FALLBACK.alternatives
    };
  } catch (err) {
    return {
      identifiedFood: name,
      brand: "Unknown Packaged Snack",
      nutritionalSummary: `Packaged travel snack. Fast calories that might lead to carbohydrate fatigue or hydration drop on active trips.`,
      alternatives: GENERIC_FOOD_FALLBACK.alternatives
    };
  }
}

// ----------------------------------------------------
// API REQUEST HELPERS
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

async function callGeminiTextDirect(apiKey: string, prompt: string): Promise<string> {
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
            { text: prompt }
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
