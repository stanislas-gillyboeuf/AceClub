interface GeocodingResult {
  latitude: number;
  longitude: number;
}

export async function geocodeAddress(
  address: string,
): Promise<GeocodingResult | null> {
  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (!token) {
    console.warn("[GEOCODING] MAPBOX_ACCESS_TOKEN not set, skipping geocoding");
    return null;
  }

  const query = encodeURIComponent(address);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${token}&limit=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(
        `[GEOCODING] Mapbox API error: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    const data = (await response.json()) as {
      features?: { center?: [number, number] }[];
    };

    if (!data.features || data.features.length === 0) {
      console.warn(`[GEOCODING] No results for address: ${address}`);
      return null;
    }

    const [longitude, latitude] = data.features[0].center!;
    return { latitude, longitude };
  } catch (error) {
    console.error("[GEOCODING] Error:", error);
    return null;
  }
}
