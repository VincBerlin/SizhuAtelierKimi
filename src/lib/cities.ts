// Bundled Place-of-Birth source (REQ-013 / T-403, OQ-003 resolved default).
//
// The place-of-birth autocomplete reads ONLY from this curated, in-bundle list —
// it NEVER calls a public geocoder per keystroke. Public-OpenStreetMap geocoding
// per keystroke is explicitly forbidden by the operator (policy-guard AT-013-3);
// a SHIPPED-SCAN test (tests/unit/delta-cities-source.test.ts) keeps any public
// geocoder host / `fetch` / `XHR` out of `src/`. Because the data is bundled,
// there is no network boundary here: matching is pure string logic.
//
// Format is "City, Country" so a single string is both the value stored on the
// poster personalization and the human-readable suggestion shown in the dropdown.

/** Curated list of major birth-place cities, "City, Country". */
export const CITIES: readonly string[] = [
  // Germany (incl. the FROZEN AT-013-2 anchor: Stuttgart → "Stuttgart, Germany")
  'Berlin, Germany',
  'Hamburg, Germany',
  'Munich, Germany',
  'Cologne, Germany',
  'Frankfurt, Germany',
  'Stuttgart, Germany',
  'Düsseldorf, Germany',
  'Leipzig, Germany',
  'Dresden, Germany',
  'Nuremberg, Germany',
  // Austria / Switzerland
  'Vienna, Austria',
  'Zurich, Switzerland',
  'Geneva, Switzerland',
  // United Kingdom & Ireland
  'London, United Kingdom',
  'Manchester, United Kingdom',
  'Birmingham, United Kingdom',
  'Edinburgh, United Kingdom',
  'Dublin, Ireland',
  // France
  'Paris, France',
  'Marseille, France',
  'Lyon, France',
  'Toulouse, France',
  'Nice, France',
  // Spain
  'Madrid, Spain',
  'Barcelona, Spain',
  'Valencia, Spain',
  'Seville, Spain',
  // Rest of Europe
  'Amsterdam, Netherlands',
  'Brussels, Belgium',
  'Lisbon, Portugal',
  'Porto, Portugal',
  'Rome, Italy',
  'Milan, Italy',
  'Naples, Italy',
  'Warsaw, Poland',
  'Prague, Czechia',
  'Budapest, Hungary',
  'Stockholm, Sweden',
  'Copenhagen, Denmark',
  'Oslo, Norway',
  'Helsinki, Finland',
  'Athens, Greece',
  'Istanbul, Türkiye',
  // Americas
  'New York, United States',
  'Los Angeles, United States',
  'Chicago, United States',
  'San Francisco, United States',
  'Toronto, Canada',
  'Vancouver, Canada',
  'Mexico City, Mexico',
  'São Paulo, Brazil',
  'Buenos Aires, Argentina',
  // Asia-Pacific & Middle East
  'Tokyo, Japan',
  'Osaka, Japan',
  'Seoul, South Korea',
  'Beijing, China',
  'Shanghai, China',
  'Hong Kong, China',
  'Singapore, Singapore',
  'Bangkok, Thailand',
  'Mumbai, India',
  'Delhi, India',
  'Dubai, United Arab Emirates',
  'Sydney, Australia',
  'Melbourne, Australia',
  'Auckland, New Zealand',
  'Cape Town, South Africa',
] as const

/** Max number of suggestions surfaced at once (keeps the dropdown bounded). */
export const MAX_CITY_SUGGESTIONS = 8

/**
 * Case-insensitive, substring match over the bundled list. Returns at most
 * `MAX_CITY_SUGGESTIONS` "City, Country" entries. A blank/whitespace query
 * returns an empty list (no dropdown). Pure: no I/O, no network.
 */
export function searchCities(query: string): string[] {
  const q = query.trim().toLowerCase()
  if (q === '') return []
  const hits: string[] = []
  for (const city of CITIES) {
    if (city.toLowerCase().includes(q)) {
      hits.push(city)
      if (hits.length >= MAX_CITY_SUGGESTIONS) break
    }
  }
  return hits
}
