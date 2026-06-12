// =============================================================================
// City Places Data — used by the Map Planner screen
// =============================================================================

import { states } from './states';

export type PlaceType = "attraction" | "restaurant" | "market";

export interface NearbyEat {
  name: string;
  rating: number;
  distance: string;
  cost: number;
  cuisine: string;
  aiSuggestion: string;
}

export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  lat: number;
  lng: number;
  rating: number;
  duration: number; // minutes
  cost: number; // INR
  description: string;
  image: any; // require() image
  inPlan: boolean;
  day: number; // which day (1, 2, etc.), 0 if not in plan
  order: number; // order within the day
  nearbyEats: NearbyEat[];
  travelTimeToNext: number; // minutes to next stop
}

export interface CityPlanData {
  cityId: string;
  cityName: string;
  citySubtitle: string;
  stateName: string;
  totalDays: number;
  centerLat: number;
  centerLng: number;
  zoomDelta: number;
  places: Place[];
}

// =============================================================================
// Jaipur — The Pink City
// =============================================================================

const jaipurPlaces: Place[] = [
  // ── Day 1 attractions (in plan) ────────────────────────────────────────────
  {
    id: "jaipur-hawa-mahal",
    name: "Hawa Mahal",
    type: "attraction",
    lat: 26.9239,
    lng: 75.7267,
    rating: 4.6,
    duration: 60,
    cost: 200,
    description:
      "The five-storey honeycomb facade of the Palace of Winds \u2014 953 tiny jharokhas built so royal women could watch street life unseen.",
    image: require("@/assets/images/places/hawa_mahal.png"),
    inPlan: true,
    day: 1,
    order: 1,
    travelTimeToNext: 6,
    nearbyEats: [
      {
        name: "Laxmi Misthan Bhandar",
        rating: 4.5,
        distance: "0.3 km",
        cost: 450,
        cuisine: "Rajasthani Sweets",
        aiSuggestion:
          "Try the legendary Ghewar and Pyaaz Kachori \u2014 a 100-year-old recipe",
      },
    ],
  },
  {
    id: "jaipur-city-palace",
    name: "City Palace",
    type: "attraction",
    lat: 26.9258,
    lng: 75.8237,
    rating: 4.5,
    duration: 120,
    cost: 500,
    description:
      "A stunning blend of Rajput and Mughal architecture, the palace complex houses museums, courtyards, and the famous Peacock Gate.",
    image: require("@/assets/images/places/city_palace.png"),
    inPlan: true,
    day: 1,
    order: 2,
    travelTimeToNext: 5,
    nearbyEats: [
      {
        name: "Laxmi Misthan Bhandar",
        rating: 4.5,
        distance: "0.6 km",
        cost: 450,
        cuisine: "Rajasthani",
        aiSuggestion:
          "Order the Dal Baati Churma and Mirchi Vada \u2014 classic Pink City street food",
      },
    ],
  },
  {
    id: "jaipur-jantar-mantar",
    name: "Jantar Mantar",
    type: "attraction",
    lat: 26.9248,
    lng: 75.8246,
    rating: 4.4,
    duration: 75,
    cost: 200,
    description:
      "UNESCO World Heritage site housing the world\u2019s largest stone sundial and 19 astronomical instruments built by Maharaja Jai Singh II.",
    image: require("@/assets/images/places/jantar_mantar.png"),
    inPlan: true,
    day: 1,
    order: 3,
    travelTimeToNext: 6,
    nearbyEats: [
      {
        name: "Rawat Mishtan Bhandar",
        rating: 4.3,
        distance: "0.4 km",
        cost: 350,
        cuisine: "Street Food",
        aiSuggestion:
          "The Pyaaz Kachori here is rated #1 in all of Jaipur",
      },
    ],
  },

  // ── Day 2 attractions (in plan) ────────────────────────────────────────────
  {
    id: "jaipur-amber-fort",
    name: "Amber Fort",
    type: "attraction",
    lat: 26.9855,
    lng: 75.8513,
    rating: 4.7,
    duration: 150,
    cost: 500,
    description:
      "Majestic hilltop fort overlooking Maota Lake \u2014 a masterpiece of Rajput architecture with the dazzling Sheesh Mahal (Mirror Palace).",
    image: require("@/assets/images/places/amber_fort.png"),
    inPlan: true,
    day: 2,
    order: 1,
    travelTimeToNext: 20,
    nearbyEats: [
      {
        name: "1135 AD",
        rating: 4.6,
        distance: "0.2 km",
        cost: 1200,
        cuisine: "Royal Rajasthani",
        aiSuggestion:
          "Dine inside the fort walls \u2014 try the Laal Maas and Ker Sangri",
      },
    ],
  },
  {
    id: "jaipur-jal-mahal",
    name: "Jal Mahal",
    type: "attraction",
    lat: 26.953,
    lng: 75.846,
    rating: 4.3,
    duration: 30,
    cost: 0,
    description:
      "The Water Palace appears to float in the middle of Man Sagar Lake \u2014 best viewed at sunset when the Aravalli hills glow golden.",
    image: require("@/assets/images/places/jal_mahal.png"),
    inPlan: true,
    day: 2,
    order: 2,
    travelTimeToNext: 15,
    nearbyEats: [
      {
        name: "Tapri Central",
        rating: 4.2,
        distance: "0.8 km",
        cost: 250,
        cuisine: "Cafe & Tea",
        aiSuggestion:
          "Sunset chai with a view \u2014 try the Masala Bun Maska",
      },
    ],
  },
  {
    id: "jaipur-nahargarh",
    name: "Nahargarh Fort",
    type: "attraction",
    lat: 26.9387,
    lng: 75.8153,
    rating: 4.5,
    duration: 90,
    cost: 200,
    description:
      "Perched on the Aravalli hills, this fortress offers panoramic views of Jaipur city \u2014 especially magical at sunset.",
    image: require("@/assets/images/places/nahargarh.png"),
    inPlan: true,
    day: 2,
    order: 3,
    travelTimeToNext: 0,
    nearbyEats: [
      {
        name: "Padao Restaurant",
        rating: 4.4,
        distance: "0.1 km",
        cost: 600,
        cuisine: "Indian",
        aiSuggestion:
          "Rooftop dining with a 360\u00B0 view of the city \u2014 Paneer Lababdar is a must",
      },
    ],
  },

  // ── Available attraction (not in plan) ─────────────────────────────────────
  {
    id: "jaipur-albert-hall",
    name: "Albert Hall Museum",
    type: "attraction",
    lat: 26.9119,
    lng: 75.8191,
    rating: 4.2,
    duration: 90,
    cost: 150,
    description:
      "Indo-Saracenic architecture housing ancient artifacts, Egyptian mummy, and Persian carpet collection.",
    image: require("@/assets/images/states/rajasthan.png"),
    inPlan: false,
    day: 0,
    order: 0,
    travelTimeToNext: 0,
    nearbyEats: [],
  },

  // ── Restaurants (not in plan) ──────────────────────────────────────────────
  {
    id: "jaipur-lmb",
    name: "Laxmi Misthan Bhandar (LMB)",
    type: "restaurant",
    lat: 26.922,
    lng: 75.823,
    rating: 4.5,
    duration: 60,
    cost: 450,
    description:
      "Legendary sweet shop since 1727 \u2014 famous across India for its Ghewar, Rasgulla, and Rajasthani thali.",
    image: require("@/assets/images/states/rajasthan.png"),
    inPlan: false,
    day: 0,
    order: 0,
    travelTimeToNext: 0,
    nearbyEats: [],
  },
  {
    id: "jaipur-rawat",
    name: "Rawat Mishtan Bhandar",
    type: "restaurant",
    lat: 26.915,
    lng: 75.8,
    rating: 4.3,
    duration: 45,
    cost: 350,
    description:
      "Home of Jaipur\u2019s #1 Pyaaz Kachori \u2014 crispy onion-filled pastry served with tangy chutney since 1960.",
    image: require("@/assets/images/states/rajasthan.png"),
    inPlan: false,
    day: 0,
    order: 0,
    travelTimeToNext: 0,
    nearbyEats: [],
  },

  // ── Markets (not in plan) ──────────────────────────────────────────────────
  {
    id: "jaipur-johari-bazaar",
    name: "Johari Bazaar",
    type: "market",
    lat: 26.9225,
    lng: 75.8245,
    rating: 4.4,
    duration: 90,
    cost: 0,
    description:
      "The gem bazaar of Jaipur \u2014 centuries-old market for precious stones, Kundan jewelry, and Meenakari work.",
    image: require("@/assets/images/states/rajasthan.png"),
    inPlan: false,
    day: 0,
    order: 0,
    travelTimeToNext: 0,
    nearbyEats: [],
  },
  {
    id: "jaipur-bapu-bazaar",
    name: "Bapu Bazaar",
    type: "market",
    lat: 26.917,
    lng: 75.821,
    rating: 4.2,
    duration: 60,
    cost: 0,
    description:
      "Colorful bazaar for Jaipuri quilts (razai), mojari shoes, bandhani fabrics, and blue pottery.",
    image: require("@/assets/images/states/rajasthan.png"),
    inPlan: false,
    day: 0,
    order: 0,
    travelTimeToNext: 0,
    nearbyEats: [],
  },
];

const jaipurPlan: CityPlanData = {
  cityId: "jaipur",
  cityName: "Jaipur",
  citySubtitle: "The Pink City",
  stateName: "Rajasthan",
  totalDays: 2,
  centerLat: 26.9124,
  centerLng: 75.7873,
  zoomDelta: 0.08,
  places: jaipurPlaces,
};

// =============================================================================
// North Goa — Beaches & Bohemia
// =============================================================================

const northGoaPlaces: Place[] = [
  // ── Day 1 attractions (in plan) ────────────────────────────────────────────
  {
    id: "north-goa-aguada-fort",
    name: "Aguada Fort",
    type: "attraction",
    lat: 15.4929,
    lng: 73.7738,
    rating: 4.5,
    duration: 75,
    cost: 0,
    description:
      "A well-preserved 17th-century Portuguese fort perched above Sinquerim Beach, crowned by a four-storey lighthouse with sweeping Arabian Sea views.",
    image: require("@/assets/images/states/north_goa.png"),
    inPlan: true,
    day: 1,
    order: 1,
    travelTimeToNext: 18,
    nearbyEats: [
      {
        name: "Banyan Tree",
        rating: 4.4,
        distance: "0.5 km",
        cost: 800,
        cuisine: "Goan-Portuguese",
        aiSuggestion:
          "Try the Prawn Balchao and Sol Kadhi under the old banyan tree",
      },
    ],
  },
  {
    id: "north-goa-baga-beach",
    name: "Baga Beach",
    type: "attraction",
    lat: 15.5553,
    lng: 73.7514,
    rating: 4.3,
    duration: 120,
    cost: 0,
    description:
      "The heart of North Goa nightlife \u2014 golden sands lined with shacks, water sports, and lively beach parties that run till dawn.",
    image: require("@/assets/images/states/north_goa.png"),
    inPlan: true,
    day: 1,
    order: 2,
    travelTimeToNext: 12,
    nearbyEats: [
      {
        name: "Britto's",
        rating: 4.3,
        distance: "0.1 km",
        cost: 650,
        cuisine: "Goan Seafood",
        aiSuggestion:
          "The butter-garlic prawns with a chilled Kingfisher is the quintessential Baga experience",
      },
    ],
  },
  {
    id: "north-goa-anjuna-flea-market",
    name: "Anjuna Flea Market",
    type: "attraction",
    lat: 15.575,
    lng: 73.7416,
    rating: 4.1,
    duration: 90,
    cost: 0,
    description:
      "A legendary Wednesday market born from the hippie era \u2014 haggle for boho jewelry, vintage clothes, spices, and handcrafted souvenirs.",
    image: require("@/assets/images/states/north_goa.png"),
    inPlan: true,
    day: 1,
    order: 3,
    travelTimeToNext: 10,
    nearbyEats: [
      {
        name: "Curlies Beach Shack",
        rating: 4.2,
        distance: "0.3 km",
        cost: 500,
        cuisine: "Beach Cafe",
        aiSuggestion:
          "Grab a cold coconut and try their Goan fish thali right on the sand",
      },
    ],
  },

  // ── Day 2 attractions (in plan) ────────────────────────────────────────────
  {
    id: "north-goa-chapora-fort",
    name: "Chapora Fort",
    type: "attraction",
    lat: 15.605,
    lng: 73.737,
    rating: 4.4,
    duration: 45,
    cost: 0,
    description:
      "The iconic \"Dil Chahta Hai\" fort \u2014 crumbling red-laterite walls with jaw-dropping views of Vagator Beach and the Chapora River.",
    image: require("@/assets/images/states/north_goa.png"),
    inPlan: true,
    day: 2,
    order: 1,
    travelTimeToNext: 35,
    nearbyEats: [
      {
        name: "Thalassa",
        rating: 4.5,
        distance: "0.6 km",
        cost: 1100,
        cuisine: "Greek-Mediterranean",
        aiSuggestion:
          "Sunset views from the cliff \u2014 order the grilled calamari and feta salad",
      },
    ],
  },
  {
    id: "north-goa-bom-jesus",
    name: "Basilica of Bom Jesus",
    type: "attraction",
    lat: 15.5009,
    lng: 73.9116,
    rating: 4.6,
    duration: 60,
    cost: 0,
    description:
      "UNESCO World Heritage baroque basilica housing the mortal remains of St. Francis Xavier \u2014 a masterpiece of Portuguese colonial architecture.",
    image: require("@/assets/images/states/north_goa.png"),
    inPlan: true,
    day: 2,
    order: 2,
    travelTimeToNext: 0,
    nearbyEats: [
      {
        name: "Vinayak Family Restaurant",
        rating: 4.1,
        distance: "0.4 km",
        cost: 350,
        cuisine: "Goan",
        aiSuggestion:
          "Authentic Goan home-style cooking \u2014 the Pork Vindaloo is fiery perfection",
      },
    ],
  },

  // ── Restaurants (not in plan) ──────────────────────────────────────────────
  {
    id: "north-goa-curlies",
    name: "Curlies Beach Shack",
    type: "restaurant",
    lat: 15.5738,
    lng: 73.7362,
    rating: 4.2,
    duration: 75,
    cost: 500,
    description:
      "Legendary Anjuna beach shack since the 1980s \u2014 trance music, psychedelic decor, and fresh seafood under the stars.",
    image: require("@/assets/images/states/goa.png"),
    inPlan: false,
    day: 0,
    order: 0,
    travelTimeToNext: 0,
    nearbyEats: [],
  },
  {
    id: "north-goa-thalassa",
    name: "Thalassa",
    type: "restaurant",
    lat: 15.5995,
    lng: 73.7345,
    rating: 4.5,
    duration: 90,
    cost: 1100,
    description:
      "Cliff-top Greek restaurant overlooking Vagator Beach \u2014 famous for its sunset views, live music, and Mediterranean platters.",
    image: require("@/assets/images/states/goa.png"),
    inPlan: false,
    day: 0,
    order: 0,
    travelTimeToNext: 0,
    nearbyEats: [],
  },

  // ── Markets (not in plan) ──────────────────────────────────────────────────
  {
    id: "north-goa-saturday-night-market",
    name: "Saturday Night Market",
    type: "market",
    lat: 15.5635,
    lng: 73.7558,
    rating: 4.3,
    duration: 120,
    cost: 0,
    description:
      "Arpora\u2019s buzzing night bazaar \u2014 live bands, global street food, handmade crafts, and a carnival atmosphere every Saturday.",
    image: require("@/assets/images/states/goa.png"),
    inPlan: false,
    day: 0,
    order: 0,
    travelTimeToNext: 0,
    nearbyEats: [],
  },
];

const northGoaPlan: CityPlanData = {
  cityId: "north-goa",
  cityName: "North Goa",
  citySubtitle: "Beaches & Bohemia",
  stateName: "Goa",
  totalDays: 2,
  centerLat: 15.5,
  centerLng: 73.83,
  zoomDelta: 0.12,
  places: northGoaPlaces,
};

// =============================================================================
// Manali — Valley of the Gods
// =============================================================================

const manaliPlaces: Place[] = [
  // ── Day 1 attractions (in plan) ────────────────────────────────────────────
  {
    id: "manali-hadimba-temple",
    name: "Hadimba Temple",
    type: "attraction",
    lat: 32.2433,
    lng: 77.1735,
    rating: 4.5,
    duration: 60,
    cost: 0,
    description:
      "A 1553 wooden pagoda temple dedicated to Hadimba Devi, nestled inside towering cedar forests \u2014 one of Himachal\u2019s most sacred shrines.",
    image: require("@/assets/images/states/himachal.png"),
    inPlan: true,
    day: 1,
    order: 1,
    travelTimeToNext: 10,
    nearbyEats: [
      {
        name: "Cafe 1947",
        rating: 4.3,
        distance: "0.7 km",
        cost: 400,
        cuisine: "Italian-Himalayan",
        aiSuggestion:
          "Wood-fired pizzas in a cozy Himalayan cabin \u2014 the truffle mushroom pizza is a must-try",
      },
    ],
  },
  {
    id: "manali-mall-road",
    name: "Mall Road",
    type: "attraction",
    lat: 32.2396,
    lng: 77.1888,
    rating: 4.2,
    duration: 90,
    cost: 0,
    description:
      "The bustling heart of Manali \u2014 a lively promenade lined with shops, cafes, and stunning views of the Beas River valley.",
    image: require("@/assets/images/states/himachal.png"),
    inPlan: true,
    day: 1,
    order: 2,
    travelTimeToNext: 12,
    nearbyEats: [
      {
        name: "Chopsticks",
        rating: 4.1,
        distance: "0.1 km",
        cost: 350,
        cuisine: "Tibetan-Chinese",
        aiSuggestion:
          "Best momos in Manali \u2014 try the jhol momos with fiery Sichuan chutney",
      },
    ],
  },
  {
    id: "manali-vashisht",
    name: "Vashisht Hot Springs",
    type: "attraction",
    lat: 32.264,
    lng: 77.195,
    rating: 4.3,
    duration: 75,
    cost: 0,
    description:
      "Ancient natural hot-water springs inside a stone temple complex \u2014 the sulfur-rich waters are believed to cure skin ailments.",
    image: require("@/assets/images/states/himachal.png"),
    inPlan: true,
    day: 1,
    order: 3,
    travelTimeToNext: 8,
    nearbyEats: [
      {
        name: "Freedom Cafe",
        rating: 4.2,
        distance: "0.2 km",
        cost: 300,
        cuisine: "Bakery & Cafe",
        aiSuggestion:
          "Freshly baked banana bread and mountain honey latte on a sunny terrace",
      },
    ],
  },

  // ── Day 2 attractions (in plan) ────────────────────────────────────────────
  {
    id: "manali-solang-valley",
    name: "Solang Valley",
    type: "attraction",
    lat: 32.315,
    lng: 77.1575,
    rating: 4.6,
    duration: 180,
    cost: 500,
    description:
      "Snow-capped adventure paradise \u2014 paragliding, zorbing, skiing in winter, and a gondola ride to 3,000 m with 360\u00B0 Himalayan panoramas.",
    image: require("@/assets/images/states/himachal.png"),
    inPlan: true,
    day: 2,
    order: 1,
    travelTimeToNext: 25,
    nearbyEats: [
      {
        name: "Solang Valley Dhaba",
        rating: 3.9,
        distance: "0.3 km",
        cost: 200,
        cuisine: "Himachali",
        aiSuggestion:
          "Hot Maggi and chai at 3,000 meters \u2014 the best comfort food after a cold adventure",
      },
    ],
  },
  {
    id: "manali-jogini-waterfall",
    name: "Jogini Waterfall",
    type: "attraction",
    lat: 32.256,
    lng: 77.179,
    rating: 4.4,
    duration: 120,
    cost: 0,
    description:
      "A scenic 3 km trek through apple orchards and pine forests leads to this stunning 150-foot cascade \u2014 a hidden gem of Old Manali.",
    image: require("@/assets/images/states/himachal.png"),
    inPlan: true,
    day: 2,
    order: 2,
    travelTimeToNext: 0,
    nearbyEats: [
      {
        name: "Lazy Dog Lounge",
        rating: 4.4,
        distance: "0.9 km",
        cost: 450,
        cuisine: "Continental & Cafe",
        aiSuggestion:
          "Reward your trek with a wood-fired pizza and cold apple cider",
      },
    ],
  },

  // ── Restaurants (not in plan) ──────────────────────────────────────────────
  {
    id: "manali-lazy-dog",
    name: "Lazy Dog Lounge",
    type: "restaurant",
    lat: 32.2465,
    lng: 77.1838,
    rating: 4.4,
    duration: 75,
    cost: 450,
    description:
      "Bohemian riverside cafe in Old Manali \u2014 wood-fired pizzas, craft cocktails, live acoustic music, and fairy-lit garden seating.",
    image: require("@/assets/images/states/himachal.png"),
    inPlan: false,
    day: 0,
    order: 0,
    travelTimeToNext: 0,
    nearbyEats: [],
  },
  {
    id: "manali-johnsons-cafe",
    name: "Johnson\u2019s Cafe",
    type: "restaurant",
    lat: 32.2415,
    lng: 77.1872,
    rating: 4.3,
    duration: 60,
    cost: 600,
    description:
      "Iconic heritage cafe with European charm \u2014 famous for its grilled trout, apple pie, and roaring fireplace on snowy evenings.",
    image: require("@/assets/images/states/himachal.png"),
    inPlan: false,
    day: 0,
    order: 0,
    travelTimeToNext: 0,
    nearbyEats: [],
  },

  // ── Markets (not in plan) ──────────────────────────────────────────────────
  {
    id: "manali-old-manali-market",
    name: "Old Manali Market",
    type: "market",
    lat: 32.248,
    lng: 77.1825,
    rating: 4.2,
    duration: 60,
    cost: 0,
    description:
      "Quirky lanes filled with Tibetan handicrafts, woolen shawls, Kullu caps, prayer flags, and hippie-chic boutiques.",
    image: require("@/assets/images/states/himachal.png"),
    inPlan: false,
    day: 0,
    order: 0,
    travelTimeToNext: 0,
    nearbyEats: [],
  },
];

const manaliPlan: CityPlanData = {
  cityId: "manali",
  cityName: "Manali",
  citySubtitle: "Valley of the Gods",
  stateName: "Himachal Pradesh",
  totalDays: 2,
  centerLat: 32.2432,
  centerLng: 77.1892,
  zoomDelta: 0.08,
  places: manaliPlaces,
};

// =============================================================================
// Master map & helper
// =============================================================================

export const cityPlansMap: Record<string, CityPlanData> = {
  jaipur: jaipurPlan,
  "north-goa": northGoaPlan,
  manali: manaliPlan,
};

function getCityCoords(cityName: string): { lat: number; lng: number } {
  let hash = 0;
  for (let i = 0; i < cityName.length; i++) {
    hash = cityName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Consistent lat/lng within India boundary
  const latMin = 10.0;
  const latMax = 28.0;
  const lngMin = 73.0;
  const lngMax = 86.0;
  
  const latVal = latMin + (Math.abs(hash) % 1000) / 1000 * (latMax - latMin);
  const lngVal = lngMin + (Math.abs(hash >> 3) % 1000) / 1000 * (lngMax - lngMin);
  
  return { lat: latVal, lng: lngVal };
}

/**
 * Look up a city plan by its ID.
 * Returns a custom generated plan when the city is not found in predefined plans.
 */
export function getCityPlan(cityId: string): CityPlanData | null {
  const existing = cityPlansMap[cityId];
  if (existing) {
    return existing;
  }
  
  // Fallback to dynamic plan generation based on states list
  for (const state of states) {
    const city = state.cities.find(c => c.id === cityId);
    if (city) {
      const center = getCityCoords(city.name);
      
      const places: Place[] = [
        {
          id: `${cityId}-p1`,
          name: `${city.name} Palace & Museum`,
          type: 'attraction',
          lat: center.lat + 0.005,
          lng: center.lng - 0.008,
          rating: 4.6,
          duration: 90,
          cost: 150,
          description: `A majestic architectural landmark in the heart of ${city.name}, showing the rich history and cultural heritage of the region.`,
          image: city.image,
          inPlan: true,
          day: 1,
          order: 1,
          travelTimeToNext: 8,
          nearbyEats: [
            {
              name: 'The Traditional Kitchen',
              rating: 4.5,
              distance: '0.4 km',
              cost: 400,
              cuisine: 'Local Heritage Thali',
              aiSuggestion: `Try their special local thali featuring local specialties prepared with regional spices.`
            }
          ]
        },
        {
          id: `${cityId}-p2`,
          name: `${city.name} Lake & Gardens`,
          type: 'attraction',
          lat: center.lat - 0.004,
          lng: center.lng + 0.006,
          rating: 4.5,
          duration: 60,
          cost: 50,
          description: `A tranquil oasis featuring serene water bodies, manicured flower beds, and ancient pavilions perfect for an afternoon stroll.`,
          image: city.image,
          inPlan: true,
          day: 1,
          order: 2,
          travelTimeToNext: 12,
          nearbyEats: [
            {
              name: 'Lakeview Cafe',
              rating: 4.3,
              distance: '0.2 km',
              cost: 250,
              cuisine: 'Teas & Snacks',
              aiSuggestion: 'Grab their signature hot chai and freshly baked samosas while looking at the water.'
            }
          ]
        },
        {
          id: `${cityId}-p3`,
          name: 'Scenic Sunset Point',
          type: 'attraction',
          lat: center.lat + 0.008,
          lng: center.lng + 0.012,
          rating: 4.7,
          duration: 45,
          cost: 0,
          description: `The highest vantage point in ${city.name}, offering spectacular panoramic views of the city skyline and surrounding hills at dusk.`,
          image: city.image,
          inPlan: true,
          day: 1,
          order: 3,
          travelTimeToNext: 0,
          nearbyEats: [
            {
              name: 'Hilltop Diner',
              rating: 4.4,
              distance: '0.5 km',
              cost: 500,
              cuisine: 'North Indian',
              aiSuggestion: 'Tandoori starters and paneer tikka are highly recommended here.'
            }
          ]
        },
        {
          id: `${cityId}-p4`,
          name: 'Heritage Spiritual Shrine',
          type: 'attraction',
          lat: center.lat - 0.009,
          lng: center.lng - 0.005,
          rating: 4.8,
          duration: 45,
          cost: 0,
          description: `A historic sacred temple known for its intricate stone carvings, peaceful atmosphere, and daily evening prayers.`,
          image: city.image,
          inPlan: true,
          day: 2,
          order: 1,
          travelTimeToNext: 15,
          nearbyEats: [
            {
              name: 'Pure Veg Bhavan',
              rating: 4.6,
              distance: '0.3 km',
              cost: 200,
              cuisine: 'Sattvik Vegetarian',
              aiSuggestion: 'Delicious ghee roast dosa and filter coffee.'
            }
          ]
        },
        {
          id: `${cityId}-p5`,
          name: 'Regional Culture Museum',
          type: 'attraction',
          lat: center.lat - 0.002,
          lng: center.lng - 0.012,
          rating: 4.4,
          duration: 90,
          cost: 100,
          description: `An engaging museum showcasing regional textiles, folk art, archaeological findings, and vintage photographs.`,
          image: city.image,
          inPlan: true,
          day: 2,
          order: 2,
          travelTimeToNext: 0,
          nearbyEats: [
            {
              name: 'Museum Cafe',
              rating: 4.1,
              distance: '0.1 km',
              cost: 180,
              cuisine: 'Beverages & Desserts',
              aiSuggestion: 'Try their chocolate brownies and cold coffee.'
            }
          ]
        },
        {
          id: `${cityId}-p6`,
          name: 'Royal Heritage Haveli',
          type: 'attraction',
          lat: center.lat + 0.012,
          lng: center.lng - 0.003,
          rating: 4.3,
          duration: 60,
          cost: 120,
          description: `An ancestral mansion meticulously preserved, showing the aristocratic lifestyle of the former merchants.`,
          image: city.image,
          inPlan: false,
          day: 0,
          order: 0,
          travelTimeToNext: 0,
          nearbyEats: []
        },
        {
          id: `${cityId}-r1`,
          name: 'The local Spice Garden',
          type: 'restaurant',
          lat: center.lat + 0.004,
          lng: center.lng + 0.003,
          rating: 4.5,
          duration: 60,
          cost: 450,
          description: `Renowned for regional cuisines served in an open-air garden setting with traditional music.`,
          image: city.image,
          inPlan: false,
          day: 0,
          order: 0,
          travelTimeToNext: 0,
          nearbyEats: []
        },
        {
          id: `${cityId}-m1`,
          name: 'Main Heritage Bazaar',
          type: 'market',
          lat: center.lat - 0.006,
          lng: center.lng - 0.002,
          rating: 4.4,
          duration: 90,
          cost: 0,
          description: `A lively and colorful marketplace famous for handicrafts, spices, silk sarees, and local souvenirs.`,
          image: city.image,
          inPlan: false,
          day: 0,
          order: 0,
          travelTimeToNext: 0,
          nearbyEats: []
        }
      ];
      
      return {
        cityId,
        cityName: city.name,
        citySubtitle: city.description.split('—')[0].trim() || 'Beautiful Destination',
        stateName: state.name,
        totalDays: 2,
        centerLat: center.lat,
        centerLng: center.lng,
        zoomDelta: 0.04,
        places
      };
    }
  }
  
  return null;
}
