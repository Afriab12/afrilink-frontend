import { Country, AfricanRegion } from "@/types";

export const AFRICAN_REGIONS: AfricanRegion[] = [
  'West Africa',
  'East Africa',
  'Southern Africa',
  'North Africa',
  'Central Africa',
];

export const AFRICAN_COUNTRIES: Country[] = [
  // West Africa
  {
    code: 'NG',
    name: 'Nigeria',
    region: 'West Africa',
    flag: '🇳🇬',
    capital: 'Abuja',
    population: '223 Million',
    description: "Africa's economic powerhouse, home to vibrant Nollywood cinema, Afrobeats global music movement, and thriving tech ecosystems in Lagos.",
    popularInterests: ['Afrobeats', 'Tech Startups', 'Nollywood', 'Fintech', 'Fashion'],
  },
  {
    code: 'GH',
    name: 'Ghana',
    region: 'West Africa',
    flag: '🇬🇭',
    capital: 'Accra',
    population: '34 Million',
    description: "The Black Star of Africa, renowned for rich Akan heritage, highlife melodies, Chale Wote arts, and welcoming diaspora initiatives.",
    popularInterests: ['Highlife', 'Art & Culture', 'Diaspora Connection', 'Food & Jollof', 'Education'],
  },
  {
    code: 'SN',
    name: 'Senegal',
    region: 'West Africa',
    flag: '🇸🇳',
    capital: 'Dakar',
    population: '18 Million',
    description: "Cultural capital of West Africa, famed for Teranga hospitality, Dak'Art Biennale contemporary arts, and passionate wrestling traditions.",
    popularInterests: ['Teranga Arts', 'Football', 'Fashion', 'Music & Mbalax', 'Literature'],
  },
  {
    code: 'CI',
    name: "Côte d'Ivoire",
    region: 'West Africa',
    flag: '🇨🇮',
    capital: 'Yamoussoukro',
    population: '29 Million',
    description: "The pulse of Francophone West Africa, world-famous for premium cocoa, Coupé-Décalé rhythms, and Abidjan's dynamic creative scene.",
    popularInterests: ['Coupé-Décalé', 'Gastronomy', 'Fashion Design', 'Sports', 'Business'],
  },
  {
    code: 'LR',
    name: 'Liberia',
    region: 'West Africa',
    flag: '🇱🇷',
    capital: 'Monrovia',
    population: '5.4 Million',
    description: "Africa's oldest republic, noted for rich cultural heritage, vibrant coastal communities, and spirited youth innovation.",
    popularInterests: ['History', 'Coastal Life', 'Youth Innovation', 'Music', 'Sports'],
  },

  // East Africa
  {
    code: 'KE',
    name: 'Kenya',
    region: 'East Africa',
    flag: '🇰🇪',
    capital: 'Nairobi',
    population: '55 Million',
    description: "The Silicon Savannah, pioneer in mobile payments (M-Pesa), renowned for majestic wildlife sanctuaries and world-class marathon champions.",
    popularInterests: ['Silicon Savannah', 'Wildlife Conservation', 'Athletics', 'Gengetone', 'AgriTech'],
  },
  {
    code: 'UG',
    name: 'Uganda',
    region: 'East Africa',
    flag: '🇺🇬',
    capital: 'Kampala',
    population: '48 Million',
    description: "The Pearl of Africa, endowed with lush landscapes, Lake Victoria's expansive waters, and an extraordinarily creative youth population.",
    popularInterests: ['Pearl of Africa', 'Nyege Nyege Arts', 'Coffee Culture', 'Startups', 'Eco-tourism'],
  },
  {
    code: 'TZ',
    name: 'Tanzania',
    region: 'East Africa',
    flag: '🇹🇿',
    capital: 'Dodoma',
    population: '65 Million',
    description: "Home of Mount Kilimanjaro, the Serengeti, Zanzibar spices, and the infectious, globally celebrated Bongo Flava sound.",
    popularInterests: ['Bongo Flava', 'Kilimanjaro', 'Zanzibar Culture', 'Swahili Heritage', 'Tourism'],
  },
  {
    code: 'RW',
    name: 'Rwanda',
    region: 'East Africa',
    flag: '🇷🇼',
    capital: 'Kigali',
    population: '14 Million',
    description: "The Land of a Thousand Hills, leading continental digital transformation, green sustainability, and cutting-edge governance.",
    popularInterests: ['Clean Energy', 'Tech Innovation', 'Ecotourism', 'Coffee', 'Pan-African Unity'],
  },

  // Southern Africa
  {
    code: 'ZA',
    name: 'South Africa',
    region: 'Southern Africa',
    flag: '🇿🇦',
    capital: 'Pretoria',
    population: '60 Million',
    description: "The Rainbow Nation, originator of the worldwide Amapiano sensation, rich biodiversity, and deep literary and constitutional legacy.",
    popularInterests: ['Amapiano', 'Rugby & Cricket', 'Cinema', 'Wine & Dining', 'Fintech'],
  },
  {
    code: 'ZM',
    name: 'Zambia',
    region: 'Southern Africa',
    flag: '🇿🇲',
    capital: 'Lusaka',
    population: '20 Million',
    description: "Heart of the Victoria Falls, rich mineral traditions, peaceful democratic milestones, and blossoming youth technology hubs.",
    popularInterests: ['Victoria Falls', 'Music', 'Mining Tech', 'Nature Conservation', 'Youth Enterprise'],
  },
  {
    code: 'ZW',
    name: 'Zimbabwe',
    region: 'Southern Africa',
    flag: '🇿🇼',
    capital: 'Harare',
    population: '16 Million',
    description: "Famed for Great Zimbabwe stone architecture, sublime Shona stone sculpture, and extraordinarily resilient, educated entrepreneurs.",
    popularInterests: ['Sculpture & Art', 'Zimdancehall', 'Agriculture', 'Education', 'Tourism'],
  },

  // North Africa
  {
    code: 'EG',
    name: 'Egypt',
    region: 'North Africa',
    flag: '🇪🇬',
    capital: 'Cairo',
    population: '110 Million',
    description: "Cradle of ancient civilizations, home to the Pyramids of Giza, the Nile River, and North Africa's largest entertainment industry.",
    popularInterests: ['Ancient History', 'Arabic Cinema', 'Tech Hubs', 'Food & Culinary', 'Football'],
  },
  {
    code: 'MA',
    name: 'Morocco',
    region: 'North Africa',
    flag: '🇲🇦',
    capital: 'Rabat',
    population: '38 Million',
    description: "Gateway connecting Africa and Europe, steeped in artisanal craft, historic medinas, Atlas mountain wonders, and football brilliance.",
    popularInterests: ['Medina Architecture', 'Gastronomy', 'Football', 'Berber Culture', 'Renewable Energy'],
  },
  {
    code: 'DZ',
    name: 'Algeria',
    region: 'North Africa',
    flag: '🇩🇿',
    capital: 'Algiers',
    population: '45 Million',
    description: "The largest nation in Africa by area, celebrated for Sahara landscapes, Raï music heritage, and revolutionary history.",
    popularInterests: ['Raï Music', 'Sahara Expeditions', 'Architecture', 'Sports', 'Literature'],
  },

  // Central Africa
  {
    code: 'CM',
    name: 'Cameroon',
    region: 'Central Africa',
    flag: '🇨🇲',
    capital: 'Yaoundé',
    population: '28 Million',
    description: "Africa in miniature, featuring bilingual French-English culture, Makossa and Bikutsi music legends, and football pedigree.",
    popularInterests: ['Makossa Music', 'Football Lions', 'Cultural Diversity', 'Art & Craft', 'Agribusiness'],
  },
  {
    code: 'CD',
    name: 'DR Congo',
    region: 'Central Africa',
    flag: '🇨🇩',
    capital: 'Kinshasa',
    population: '100 Million',
    description: "The beating musical heart of Africa, inventors of Congolese Rumba, the world-famous Sapeur fashion subculture, and immense natural wealth.",
    popularInterests: ['Congolese Rumba', 'La Sape Fashion', 'Visual Arts', 'Mineral Tech', 'Ecology'],
  },
  {
    code: 'GA',
    name: 'Gabon',
    region: 'Central Africa',
    flag: '🇬🇦',
    capital: 'Libreville',
    population: '2.4 Million',
    description: "The green jewel of Central Africa, with 80% pristine rainforest cover, national parks, and progressive environmental conservation.",
    popularInterests: ['Rainforest Conservation', 'Eco-Tourism', 'Traditional Music', 'Atlantic Coast', 'Heritage'],
  },
];

export const AFRICAN_INTERESTS = [
  { id: 'tech', label: 'Technology & Startups', icon: '💻', count: '142k' },
  { id: 'football', label: 'African Football & Sports', icon: '⚽', count: '320k' },
  { id: 'music', label: 'Afrobeats & Amapiano Music', icon: '🎵', count: '450k' },
  { id: 'business', label: 'Pan-African Business & Trade', icon: '📈', count: '98k' },
  { id: 'fashion', label: 'African Fashion & Design', icon: '👗', count: '185k' },
  { id: 'food', label: 'African Food & Culinary Arts', icon: '🍲', count: '210k' },
  { id: 'culture', label: 'History, Heritage & Culture', icon: '🏺', count: '130k' },
  { id: 'education', label: 'Education & Scholarships', icon: '📚', count: '88k' },
  { id: 'comedy', label: 'Comedy & Entertainment', icon: '🎭', count: '275k' },
  { id: 'travel', label: 'Travel & Explore Africa', icon: '✈️', count: '160k' },
  { id: 'creative', label: 'Visual Arts, Film & Cinema', icon: '🎨', count: '115k' },
  { id: 'community', label: 'Community Development', icon: '🤝', count: '74k' },
];

export function getCountryByCode(code: string): Country | undefined {
  return AFRICAN_COUNTRIES.find((c) => c.code.toUpperCase() === code.toUpperCase());
}

export function getCountriesByRegion(region: AfricanRegion): Country[] {
  return AFRICAN_COUNTRIES.filter((c) => c.region === region);
}
