interface GeocodingResult {
  latitude: number;
  longitude: number;
}

export async function geocodeAddress(
  address: string,
): Promise<GeocodingResult | null> {
  const query = encodeURIComponent(address);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "AceClub/1.0",
      },
    });

    if (!response.ok) {
      console.error(
        `[GEOCODING] Nominatim API error: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    const data = (await response.json()) as {
      lat?: string;
      lon?: string;
    }[];

    if (!data || data.length === 0) {
      console.warn(`[GEOCODING] No results for address: ${address}`);
      return null;
    }

    const { lat, lon } = data[0];
    if (!lat || !lon) {
      console.warn(`[GEOCODING] Missing coordinates for address: ${address}`);
      return null;
    }

    return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
  } catch (error) {
    console.error("[GEOCODING] Error:", error);
    return null;
  }
}
