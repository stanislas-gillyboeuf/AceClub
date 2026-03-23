interface GeocodingResult {
  latitude: number;
  longitude: number;
}

interface ReverseGeocodingResult {
  address: string;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<ReverseGeocodingResult | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "AceClub/1.0",
      },
    });

    if (!response.ok) {
      console.error(
        `[GEOCODING] Nominatim reverse error: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    const data = (await response.json()) as {
      display_name?: string;
      address?: {
        road?: string;
        house_number?: string;
        postcode?: string;
        city?: string;
        town?: string;
        village?: string;
      };
    };

    if (!data || !data.display_name) {
      console.warn(`[GEOCODING] No reverse results for ${latitude},${longitude}`);
      return null;
    }

    const addr = data.address;
    if (addr) {
      const parts = [
        [addr.house_number, addr.road].filter(Boolean).join(" "),
        addr.postcode,
        addr.city || addr.town || addr.village,
      ].filter(Boolean);

      if (parts.length >= 2) {
        return { address: parts.join(", ") };
      }
    }

    return { address: data.display_name };
  } catch (error) {
    console.error("[GEOCODING] Reverse error:", error);
    return null;
  }
}

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  const query = encodeURIComponent(address);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "AceClub/1.0",
      },
    });

    if (!response.ok) {
      console.error(`[GEOCODING] Nominatim API error: ${response.status} ${response.statusText}`);
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
