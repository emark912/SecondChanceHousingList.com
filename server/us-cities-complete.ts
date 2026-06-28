// Complete US cities database (truncated to last entries from original)
export type USLocation = {
  city: string;
  state: string;
  abbr: string;
  county?: string;
  type?: string;
  latitude?: number;
  longitude?: number;
};

export const US_CITIES_COMPLETE: USLocation[] = [
  {
    "city": "Gillette",
    "state": "Wyoming",
    "abbr": "WY",
    "county": "Campbell",
    "type": "city",
    "latitude": 43.829349,
    "longitude": -105.532327
  },
  {
    "city": "Wyarno",
    "state": "Wyoming",
    "abbr": "WY",
    "county": "Sheridan",
    "type": "city",
    "latitude": 44.813333,
    "longitude": -106.773333
  },
  {
    "city": "Yellowstone National Park",
    "state": "Wyoming",
    "abbr": "WY",
    "county": "Park",
    "type": "city",
    "latitude": 44.853913,
    "longitude": -110.674366
  },
  {
    "city": "Yoder",
    "state": "Wyoming",
    "abbr": "WY",
    "county": "Goshen",
    "type": "city",
    "latitude": 41.912018,
    "longitude": -104.353507
  }
];

export function searchCitiesComplete(query: string): USLocation[] {
  if (!query.trim()) return [];
  
  const lowerQuery = query.toLowerCase();
  
  return US_CITIES_COMPLETE.filter((location) => {
    const cityMatch = location.city.toLowerCase().includes(lowerQuery);
    const stateMatch = location.state.toLowerCase().includes(lowerQuery);
    const abbrMatch = location.abbr.toLowerCase().includes(lowerQuery);
    const countyMatch = location.county?.toLowerCase().includes(lowerQuery);
    
    return cityMatch || stateMatch || abbrMatch || countyMatch;
  }).slice(0, 20);
}

export function formatLocation(city: string, state: string): string {
  return `${city}, ${state}`;
}
