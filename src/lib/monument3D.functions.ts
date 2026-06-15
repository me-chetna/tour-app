export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Edge {
  v1: number;
  v2: number;
}

export interface Hotspot {
  id: string;
  name: string;
  coords: Point3D;
  culture: string;
  history: string;
  past: string;
  cuisine: string;
  dance: string;
  dress: string;
  traditional_food: string;
}

export interface Monument3DData {
  id: string;
  name: string;
  vertices: Point3D[];
  edges: Edge[];
  hotspots: Hotspot[];
}

// ----------------------------------------------------
// GEOMETRY GENERATION HELPERS
// ----------------------------------------------------

// Taj Mahal 3D Mesh Generator
function getTajMahalGeometry(): { vertices: Point3D[]; edges: Edge[] } {
  const vertices: Point3D[] = [];
  const edges: Edge[] = [];

  // 1. Base Chamber (isometric box)
  // Indices 0 to 7
  const baseSize = 50;
  const baseHeight = 30;
  const baseOffsetZ = 40; // lower it down

  vertices.push({ x: -baseSize, y: baseOffsetZ, z: -baseSize }); // 0
  vertices.push({ x: baseSize, y: baseOffsetZ, z: -baseSize });  // 1
  vertices.push({ x: baseSize, y: baseOffsetZ, z: baseSize });   // 2
  vertices.push({ x: -baseSize, y: baseOffsetZ, z: baseSize });  // 3
  vertices.push({ x: -baseSize, y: baseOffsetZ - baseHeight, z: -baseSize }); // 4
  vertices.push({ x: baseSize, y: baseOffsetZ - baseHeight, z: -baseSize });  // 5
  vertices.push({ x: baseSize, y: baseOffsetZ - baseHeight, z: baseSize });   // 6
  vertices.push({ x: -baseSize, y: baseOffsetZ - baseHeight, z: baseSize });  // 7

  // Edges for Base Chamber
  edges.push({ v1: 0, v2: 1 }, { v1: 1, v2: 2 }, { v1: 2, v2: 3 }, { v1: 3, v2: 0 }); // Bottom
  edges.push({ v1: 4, v2: 5 }, { v1: 5, v2: 6 }, { v1: 6, v2: 7 }, { v1: 7, v2: 4 }); // Top
  edges.push({ v1: 0, v2: 4 }, { v1: 1, v2: 5 }, { v1: 2, v2: 6 }, { v1: 3, v2: 7 }); // Verticals

  // 2. Central Onion Dome
  // We model this using 4 horizontal rings of decreasing/increasing radii stacked vertically
  // Indices 8 to 39
  const domeCenterY = baseOffsetZ - baseHeight; // starts at top of chamber
  const ringHeights = [0, -15, -28, -36];
  const ringRadii = [28, 32, 24, 0]; // ends at a single peak point

  let vertIndexOffset = vertices.length; // should be 8
  const steps = 8; // 8 points per ring

  for (let r = 0; r < ringHeights.length; r++) {
    const yVal = domeCenterY + ringHeights[r];
    const radius = ringRadii[r];

    if (radius === 0) {
      // Dome peak point
      vertices.push({ x: 0, y: yVal, z: 0 });
      // Connect all points of the previous ring to this peak
      const prevRingOffset = vertIndexOffset + (r - 1) * steps;
      const peakIndex = vertices.length - 1;
      for (let s = 0; s < steps; s++) {
        edges.push({ v1: prevRingOffset + s, v2: peakIndex });
      }
    } else {
      // Render ring vertices
      for (let s = 0; s < steps; s++) {
        const angle = (s * 2 * Math.PI) / steps;
        const xVal = radius * Math.cos(angle);
        const zVal = radius * Math.sin(angle);
        vertices.push({ x: xVal, y: yVal, z: zVal });

        // Connect ring in circle
        const currIdx = vertIndexOffset + r * steps + s;
        const nextIdx = vertIndexOffset + r * steps + ((s + 1) % steps);
        edges.push({ v1: currIdx, v2: nextIdx });

        // Connect vertically to previous ring
        if (r > 0) {
          const prevIdx = vertIndexOffset + (r - 1) * steps + s;
          edges.push({ v1: prevIdx, v2: currIdx });
        }
      }
    }
  }

  // 3. Four Corner Minarets
  // indices 40 to 47 (4 corner pillars, represented as lines running from base plane up)
  const minaretOffset = 65;
  const minaretHeight = 45;
  const corners = [
    { x: -minaretOffset, z: -minaretOffset },
    { x: minaretOffset, z: -minaretOffset },
    { x: minaretOffset, z: minaretOffset },
    { x: -minaretOffset, z: minaretOffset }
  ];

  corners.forEach((c) => {
    // Bottom point
    vertices.push({ x: c.x, y: baseOffsetZ, z: c.z });
    const bIdx = vertices.length - 1;

    // Top point
    vertices.push({ x: c.x, y: baseOffsetZ - minaretHeight, z: c.z });
    const tIdx = vertices.length - 1;

    edges.push({ v1: bIdx, v2: tIdx });
  });

  return { vertices, edges };
}

// Hawa Mahal 3D Mesh Generator
function getHawaMahalGeometry(): { vertices: Point3D[]; edges: Edge[] } {
  const vertices: Point3D[] = [];
  const edges: Edge[] = [];

  // Hawa Mahal is a wide tiered facade (screen) with stepped rows of windows
  // We model it as 5 tiers, stacked vertically, with slight curvature along the z-axis
  const tiersCount = 5;
  const colsCount = 7;
  const cellWidth = 18;
  const cellHeight = 16;
  const bottomY = 50;

  for (let t = 0; t < tiersCount; t++) {
    const yVal = bottomY - t * cellHeight;
    // Number of columns decreases slightly as we go up to create a tapering facade look
    const activeCols = colsCount - (t > 2 ? (t - 2) * 2 : 0);
    const startCol = (colsCount - activeCols) / 2;

    for (let c = 0; c <= activeCols; c++) {
      const colIndex = startCol + c;
      const xVal = (colIndex - colsCount / 2) * cellWidth;
      // Slight curve along Z-depth
      const zVal = -15 * Math.cos(((colIndex - colsCount / 2) / (colsCount / 2)) * (Math.PI / 2.5));

      vertices.push({ x: xVal, y: yVal, z: zVal });
      const currIdx = vertices.length - 1;

      // Connect horizontally
      if (c > 0) {
        edges.push({ v1: currIdx - 1, v2: currIdx });
      }

      // Connect vertically to corresponding point in previous tier
      if (t > 0) {
        // Find corresponding vertex in the tier below
        const prevTierY = yVal + cellHeight;
        // Simple search for nearest vertex below
        let nearestIdx = -1;
        let minDist = 9999;
        for (let i = 0; i < currIdx; i++) {
          if (Math.abs(vertices[i].y - prevTierY) < 1) {
            const dist = Math.abs(vertices[i].x - xVal);
            if (dist < minDist) {
              minDist = dist;
              nearestIdx = i;
            }
          }
        }
        if (nearestIdx !== -1 && minDist < cellWidth * 0.8) {
          edges.push({ v1: nearestIdx, v2: currIdx });
        }
      }
    }
  }

  return { vertices, edges };
}

// Qutub Minar 3D Mesh Generator
function getQutubMinarGeometry(): { vertices: Point3D[]; edges: Edge[] } {
  const vertices: Point3D[] = [];
  const edges: Edge[] = [];

  // Tapering cylinder tower
  // 5 tiers/stages, each with an 8-sided ring. Tapers from bottom radius 25 to top radius 8
  const stages = 5;
  const ringPoints = 8;
  const stageHeight = 22;
  const bottomY = 55;

  for (let s = 0; s <= stages; s++) {
    const yVal = bottomY - s * stageHeight;
    // Linear radius taper
    const radius = 25 - s * 3.4;

    for (let p = 0; p < ringPoints; p++) {
      const angle = (p * 2 * Math.PI) / ringPoints;
      const xVal = radius * Math.cos(angle);
      const zVal = radius * Math.sin(angle);

      vertices.push({ x: xVal, y: yVal, z: zVal });
      const currIdx = vertices.length - 1;

      // Connect ring in circle
      const nextIdx = s * ringPoints + ((p + 1) % ringPoints);
      edges.push({ v1: currIdx, v2: nextIdx });

      // Connect vertically to stage below
      if (s > 0) {
        const prevIdx = (s - 1) * ringPoints + p;
        edges.push({ v1: prevIdx, v2: currIdx });
      }
    }
  }

  return { vertices, edges };
}

// ----------------------------------------------------
// MONUMENTS DATABASE & HOTSPOTS DEFINITIONS
// ----------------------------------------------------

export const MONUMENTS_3D: Record<string, Monument3DData> = {
  'taj-mahal': {
    id: 'taj-mahal',
    name: 'Taj Mahal (Agra)',
    ...getTajMahalGeometry(),
    hotspots: [
      {
        id: 'dome',
        name: 'The Central Onion Dome',
        coords: { x: 0, y: -18, z: 0 },
        past: "Commissioned in 1631 by Mughal Emperor Shah Jahan after his favorite wife Mumtaz Mahal passed away giving birth to their 14th child.",
        history: "Construction of the white marble dome took over 20,000 artisans and was completed in 1648. It is built as a double dome to project grand proportions outside while maintaining an intimate interior height.",
        culture: "A masterpiece of Indo-Islamic architecture. Symbolizes eternal love and features intricate pietra dura stone inlays of semi-precious gems like lapis lazuli and carnelian.",
        cuisine: "Mughlai Cuisine — rich, slow-cooked curries flavored with saffron, cardamom, and rose water. Heavily influenced by Persian culinary styles.",
        traditional_food: "Agra Petha (sweet ash gourd candy), Mughlai Biryani, Shahi Tukda (cardamom bread pudding), and rich Paneer Pasanda.",
        dance: "Kathak — a major classical Indian dance. Thrived in the Mughal courts next to the Taj Mahal, characterized by rapid spins (chakkars) and rhythmic footwork (tatkar).",
        dress: "Chikankari Embroidery and traditional Anarkali suits. Men wear sherwanis, while women drape rich silk sarees or wear heavily embroidered lehengas."
      },
      {
        id: 'minaret',
        name: 'The Corner Minarets',
        coords: { x: 65, y: baseMinaretHeight(), z: 65 },
        past: "The minarets were built slightly leaning outwards. This ingenious 17th-century safety design ensures that in the event of an earthquake, the towers would collapse away from the central dome.",
        history: "Rising 40 meters high, each minaret is divided into three equal storeys by two balconies, constructed in perfect symmetry to frame the mausoleum.",
        culture: "Reflects the Islamic concept of paradise, mirroring the pillars supporting the throne of God. They frame the garden path, leading visitors' eyes directly to the dome.",
        cuisine: "Uttar Pradesh local food — street snacks that travelers eat outside the monument complexes, featuring rich spicy chats and sweet parathas.",
        traditional_food: "Bedai Sabzi (spicy puffed lentil bread served with potato curry) and sweet Jalebis — a staple breakfast in Agra.",
        dance: "Charkula Dance — a traditional folk dance from the nearby Braj region, where dancers balance heavy multi-tiered wooden pyramids with oil lamps on their heads.",
        dress: "Khadi wear and block prints. Cotton dhotis and handloom sarees are popular regional travel wear due to the warm climate of the plains."
      }
    ]
  },
  'hawa-mahal': {
    id: 'hawa-mahal',
    name: 'Hawa Mahal (Jaipur)',
    ...getHawaMahalGeometry(),
    hotspots: [
      {
        id: 'facade',
        name: 'The Honeycomb Facade',
        coords: { x: 0, y: 18, z: -15 },
        past: "Built in 1799 by Maharaja Sawai Pratap Singh. The palace was designed as an extension of the Royal City Palace zenana chambers.",
        history: "Constructed of red and pink sandstone, it features 953 small windows (jharokhas) decorated with intricate latticework. The screen was built so royal women could observe busy street festivals in privacy.",
        culture: "Designed in the shape of Lord Krishna's crown (the Maharaja was a devout devotee). The windows act as a natural air conditioner, blowing cool breeze through the palace.",
        cuisine: "Royal Rajasthani Cuisine — spicy, dry foods designed to withstand hot desert travel, using rich ghee, local berries, and mathri snacks.",
        traditional_food: "Dal Baati Churma (baked wheat balls with lentils and sweetened crumble), Ker Sangri (desert bean curry), and sweet Mawa Kachori.",
        dance: "Ghoomar — a traditional Rajasthani folk dance performed by women in swirling colorful skirts, moving in circles with graceful hand gestures.",
        dress: "Bandhani (tie-dye) textiles and Lehariya patterns. Women wear colorful Ghagra Cholis with heavy silver jewelry, while men wear traditional Rajasthani Safas (turbans)."
      },
      {
        id: 'courtyard',
        name: 'The Inner Courtyard',
        coords: { x: -36, y: 34, z: -10 },
        past: "Originally served as a cooling sanctuary where the royal family held private gatherings away from the heat of the city.",
        history: "Features fountains and open arches built around a central courtyard. It connects the Hawa Mahal screen to the main Palace chambers.",
        culture: "A blend of Rajput and Mughal architecture. Features yellow limestone floors and delicate floral marble carvings representing the spring season.",
        cuisine: "Jaipur Street Cuisine — famous savory snacks and sweet dairy items prepared in the nearby Johari and Bapu Bazaars.",
        traditional_food: "Pyaaz Kachori (crispy fried onion pastry), Mirchi Vada (spicy green chili fritters), and thick Kulhad Lassi served in clay cups.",
        dance: "Kalbelia Dance — the famous 'Snake Charmer' dance of Rajasthan. Features fast, snake-like movements performed to the beat of the 'been' wind instrument.",
        dress: "Mojaris (embroidered leather shoes) and block-printed cotton kurtas. Travel wear includes indigo-dyed fabrics to protect from the harsh desert sun."
      }
    ]
  },
  'qutub-minar': {
    id: 'qutub-minar',
    name: 'Qutub Minar (Delhi)',
    ...getQutubMinarGeometry(),
    hotspots: [
      {
        id: 'base',
        name: 'The Victory Tower Base',
        coords: { x: 0, y: 33, z: 25 },
        past: "Commissioned in 1199 by Qutb-ud-din Aibak, the founder of the Delhi Sultanate, to mark the start of Islamic rule in North India.",
        history: "Aibak only managed to finish the base storey. His successor Iltutmish added three more sandstone storeys, and Firoz Shah Tughlaq rebuilt the top storeys in white marble after a lightning strike.",
        culture: "Showcases early Indo-Islamic carvings, featuring calligraphic verses from the Quran intertwined with traditional Hindu floral motifs.",
        cuisine: "Old Delhi Mughlai Cuisine — aromatic and rich, centered around tandoors, clay ovens, and slow-stewed meats.",
        traditional_food: "Nihari (slow-cooked beef stew), Seekh Kababs, Daulat Ki Chaat (fluffy milk foam dessert), and Khameeri Roti.",
        dance: "Kathak and Sufi Whirling — Sufi devotional music (Qawwali) flourished in the surrounding dargahs of Mehrauli and Nizamuddin.",
        dress: "Traditional Lucknowi Chikankari, pathani suits, cotton kurtas, salwar-kameez, and hand-woven silk stoles. Woolen pashmina shawls are worn during the chilly winters."
      },
      {
        id: 'ironpillar',
        name: 'The Rust-Resistant Iron Pillar',
        coords: { x: 20, y: 55, z: -15 },
        past: "Constructed during the Gupta Empire in the 4th century CE, dedicated to Lord Vishnu, and later moved to the Qutub complex.",
        history: "Made of 98% wrought iron, this 7-meter pillar has stood in the open air for over 1600 years without rusting, a metallurgical marvel studied worldwide.",
        culture: "Represents the height of ancient Indian metalworking skills. Local folklore says if you can stand with your back to the pillar and wrap your hands around it, your wish will come true.",
        cuisine: "Delhi Chaat Culture — spicy, tangy street food that travelers eat around the Mehrauli ruins and archaeological parks.",
        traditional_food: "Aloo Tikki Chaat, Golgappe (crispy hollow balls filled with spiced water), Dahi Bhalla, and sweet Rabri Jalebi.",
        dance: "Sufi Kathak — a fusion dance style combining classical Kathak hand movements with spiritual Sufi whirling and devotional poetry.",
        dress: "Khadi kurtas, cotton Nehru jackets (sadris), and bandhani stoles. Lightweight garments are preferred for exploring the massive ruins."
      }
    ]
  }
};

// Helper minaret height reference
function baseMinaretHeight(): number {
  return 5;
}

// ----------------------------------------------------
// 3D PERSPECTIVE PROJECTION ALGORITHM
// ----------------------------------------------------

export function project3DTo2D(
  point: Point3D,
  pitch: number, // pitch (rotation around X-axis)
  yaw: number,   // yaw (rotation around Y-axis)
  width: number,
  height: number
): { x: number; y: number; z: number } {
  // Center of screen
  const cx = width / 2;
  const cy = height / 2;

  // 1. Rotate around Y-axis (Yaw)
  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  const x1 = point.x * cosY - point.z * sinY;
  const z1 = point.x * sinY + point.z * cosY;

  // 2. Rotate around X-axis (Pitch)
  const cosP = Math.cos(pitch);
  const sinP = Math.sin(pitch);
  const y2 = point.y * cosP - z1 * sinP;
  const z2 = point.y * sinP + z1 * cosP;

  // 3. Perspective Projection
  const distance = 200; // camera distance
  const focalLength = 160; // scale factor
  
  // Prevent division by zero / clipping behind camera
  const depth = distance + z2;
  const factor = depth > 10 ? focalLength / depth : 1;

  const screenX = cx + x1 * factor;
  const screenY = cy + y2 * factor;

  return { x: screenX, y: screenY, z: z2 };
}
