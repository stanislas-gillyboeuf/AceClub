const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const USER_AGENT = "AceClub/1.0";

interface NominatimAddress {
  road?: string;
  house_number?: string;
  postcode?: string;
  city?: string;
  town?: string;
  village?: string;
}

interface GeocodingResult {
  latitude: number;
  longitude: number;
  address: string;
}

function formatNominatimAddress(
  addr: NominatimAddress | undefined,
  fallback: string,
): string {
  if (!addr) return fallback;
  const parts = [
    [addr.house_number, addr.road].filter(Boolean).join(" "),
    addr.postcode,
    addr.city || addr.town || addr.village,
  ].filter(Boolean);
  return parts.length >= 2 ? parts.join(", ") : fallback;
}

export async function geocodeAddress(
  address: string,
  signal?: AbortSignal,
): Promise<GeocodingResult | null> {
  const query = encodeURIComponent(address);
  const url = `${NOMINATIM_BASE}/search?q=${query}&format=json&limit=1&addressdetails=1`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal,
    });
    if (!response.ok) return null;

    const data = (await response.json()) as {
      lat?: string;
      lon?: string;
      display_name?: string;
      address?: NominatimAddress;
    }[];

    if (!data?.length || !data[0].lat || !data[0].lon) return null;

    const item = data[0];

    return {
      latitude: parseFloat(item.lat!),
      longitude: parseFloat(item.lon!),
      address: formatNominatimAddress(item.address, item.display_name ?? address),
    };
  } catch {
    return null;
  }
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<string | null> {
  const url = `${NOMINATIM_BASE}/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal,
    });
    if (!response.ok) return null;

    const data = (await response.json()) as {
      display_name?: string;
      address?: NominatimAddress;
    };

    if (!data?.display_name) return null;

    return formatNominatimAddress(data.address, data.display_name);
  } catch {
    return null;
  }
}
