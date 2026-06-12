/**
 * WanderIndia — Indian states & cities dataset.
 *
 * Every `image` field uses a static `require()` with a string‑literal path
 * so Metro can resolve the asset at build time.
 */

import { ImageSource } from 'expo-image';

/* ── Types ────────────────────────────────────────────────────────── */

export interface CityType {
  id: string;
  name: string;
  description: string;
  curatedSpots: number;
  starterPlan: string;
  image: ImageSource;
}

export interface StateType {
  id: string;
  name: string;
  tagline: string;
  subtitle: string;
  emoji: string;
  citiesReady: number;
  image: ImageSource;
  cities: CityType[];
}

/* ── Data ─────────────────────────────────────────────────────────── */

export const states: StateType[] = [
  /* ─── Rajasthan ─────────────────────────────────────────────────── */
  {
    id: 'rajasthan',
    name: 'Rajasthan',
    tagline: 'LAND OF KINGS',
    subtitle: 'Forts, deserts, royal palaces',
    emoji: '🏰',
    citiesReady: 2,
    image: require('@/assets/images/states/rajasthan.png'),
    cities: [
      {
        id: 'jaipur',
        name: 'Jaipur',
        description:
          'The Pink City — a living museum of Rajput grandeur with bustling bazaars, majestic forts, and ornate havelis draped in sunset hues.',
        curatedSpots: 24,
        starterPlan: '3-day starter plan',
        image: require('@/assets/images/states/rajasthan.png'),
      },
      {
        id: 'udaipur',
        name: 'Udaipur',
        description:
          'The City of Lakes — romantic palaces floating on still waters, winding marble lanes, and Aravalli sunsets that painters chase.',
        curatedSpots: 18,
        starterPlan: '3-day starter plan',
        image: require('@/assets/images/states/rajasthan.png'),
      },
    ],
  },

  /* ─── Goa ───────────────────────────────────────────────────────── */
  {
    id: 'goa',
    name: 'Goa',
    tagline: 'SUN, SAND & SUSEGAD',
    subtitle: 'Beaches, shacks, Portuguese charm',
    emoji: '🏖️',
    citiesReady: 1,
    image: require('@/assets/images/states/goa.png'),
    cities: [
      {
        id: 'north-goa',
        name: 'North Goa',
        description:
          'Golden sand beaches meet bohemian nightlife — beach shacks, flea markets, and whitewashed churches under swaying palms.',
        curatedSpots: 20,
        starterPlan: '3-day starter plan',
        image: require('@/assets/images/states/north_goa.png'),
      },
    ],
  },

  /* ─── Himachal Pradesh ──────────────────────────────────────────── */
  {
    id: 'himachal',
    name: 'Himachal Pradesh',
    tagline: 'ABODE OF THE SNOWS',
    subtitle: 'Snow, cedar valleys, mountain villages',
    emoji: '🏔️',
    citiesReady: 1,
    image: require('@/assets/images/states/himachal.png'),
    cities: [
      {
        id: 'manali',
        name: 'Manali',
        description:
          'A Himalayan gem cradled by cedar forests and snow peaks — adventure trails by day, bonfire stories by night.',
        curatedSpots: 16,
        starterPlan: '3-day starter plan',
        image: require('@/assets/images/states/himachal.png'),
      },
    ],
  },

  /* ─── Kerala ────────────────────────────────────────────────────── */
  {
    id: 'kerala',
    name: 'Kerala',
    tagline: "GOD'S OWN COUNTRY",
    subtitle: 'Backwaters, tea hills, ayurveda',
    emoji: '🌴',
    citiesReady: 2,
    image: require('@/assets/images/states/kerala.png'),
    cities: [
      {
        id: 'munnar',
        name: 'Munnar',
        description:
          'Emerald tea plantations cascading over misty hills — spice-scented air, winding trails, and dawns painted in gold.',
        curatedSpots: 14,
        starterPlan: '3-day starter plan',
        image: require('@/assets/images/states/kerala.png'),
      },
      {
        id: 'alleppey',
        name: 'Alleppey',
        description:
          'Venice of the East — glide through palm-fringed backwaters on a houseboat while the world slows to a gentle ripple.',
        curatedSpots: 12,
        starterPlan: '2-day starter plan',
        image: require('@/assets/images/states/kerala.png'),
      },
    ],
  },

  /* ─── Uttarakhand ───────────────────────────────────────────────── */
  {
    id: 'uttarakhand',
    name: 'Uttarakhand',
    tagline: 'DEVBHOOMI — LAND OF GODS',
    subtitle: 'Ganga, yoga, Himalayan lakes',
    emoji: '🕉️',
    citiesReady: 2,
    image: require('@/assets/images/states/uttarakhand.png'),
    cities: [
      {
        id: 'rishikesh',
        name: 'Rishikesh',
        description:
          'Yoga capital of the world — the Ganga roars through forested gorges while temple bells echo off ancient ghats.',
        curatedSpots: 18,
        starterPlan: '3-day starter plan',
        image: require('@/assets/images/states/uttarakhand.png'),
      },
      {
        id: 'mussoorie',
        name: 'Mussoorie',
        description:
          'Queen of the Hills — misty promenades, colonial charm, and panoramic Himalayan views from every winding road.',
        curatedSpots: 12,
        starterPlan: '2-day starter plan',
        image: require('@/assets/images/states/uttarakhand.png'),
      },
    ],
  },

  /* ─── Tamil Nadu ────────────────────────────────────────────────── */
  {
    id: 'tamilnadu',
    name: 'Tamil Nadu',
    tagline: 'TEMPLES & LONG COASTLINES',
    subtitle: 'Dravidian temples, French colonies, hills',
    emoji: '🛕',
    citiesReady: 2,
    image: require('@/assets/images/states/tamilnadu.png'),
    cities: [
      {
        id: 'chennai',
        name: 'Chennai',
        description:
          "Gateway to the South — a vibrant metropolis where ancient temples share skylines with art-deco theatres and Marina's endless shore.",
        curatedSpots: 20,
        starterPlan: '3-day starter plan',
        image: require('@/assets/images/states/tamilnadu.png'),
      },
      {
        id: 'pondicherry',
        name: 'Pondicherry',
        description:
          'A Franco-Tamil jewel — pastel colonial streets, tranquil ashrams, and café terraces overlooking the Bay of Bengal.',
        curatedSpots: 16,
        starterPlan: '2-day starter plan',
        image: require('@/assets/images/states/tamilnadu.png'),
      },
    ],
  },
];
