import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearCommuneMemoryCache,
  communeLookupKey,
  resolveCommunes,
} from "../../server/club-member/lib/geo-commune";

function fakeFetch(body: unknown, ok = true) {
  return vi.fn(async () => ({ ok, json: async () => body }) as Response) as unknown as typeof fetch & ReturnType<typeof vi.fn>;
}

describe("resolveCommunes", () => {
  beforeEach(() => clearCommuneMemoryCache());

  it("resolves a single match to its INSEE code", async () => {
    const fetchFn = fakeFetch([{ nom: "Rennes", code: "35238" }]);
    const key = communeLookupKey({ postalCode: "35000", city: "Rennes" });
    const result = await resolveCommunes([{ postalCode: "35000", city: "Rennes" }], { fetchFn });
    expect(result.get(key)).toEqual({ status: "found", code: "35238", name: "Rennes" });
  });

  it("asks the API once per distinct pair, whatever the spelling", async () => {
    const fetchFn = fakeFetch([{ nom: "Saint-Malo", code: "35288" }]);
    await resolveCommunes(
      [
        { postalCode: "35400", city: "St Malo" },
        { postalCode: "35400", city: "St-Malo" },
        { postalCode: "35400", city: "st malo" },
      ],
      { fetchFn },
    );
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("answers from the cache the second time", async () => {
    const fetchFn = fakeFetch([{ nom: "Rennes", code: "35238" }]);
    await resolveCommunes([{ postalCode: "35000", city: "Rennes" }], { fetchFn });
    await resolveCommunes([{ postalCode: "35000", city: "Rennes" }], { fetchFn });
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("reports ambiguity instead of guessing", async () => {
    const fetchFn = fakeFetch([
      { nom: "Cesson", code: "77000" },
      { nom: "Cesson-Sévigné", code: "35051" },
    ]);
    const result = await resolveCommunes([{ postalCode: "35510" }], { fetchFn });
    expect(result.get(communeLookupKey({ postalCode: "35510" }))).toEqual({ status: "ambiguous" });
  });

  it("never throws when the service fails, and does not cache the failure", async () => {
    const failing = vi.fn(async () => {
      throw new Error("network down");
    }) as unknown as typeof fetch;
    const key = communeLookupKey({ postalCode: "35000", city: "Rennes" });
    const down = await resolveCommunes([{ postalCode: "35000", city: "Rennes" }], { fetchFn: failing });
    expect(down.get(key)).toEqual({ status: "unavailable" });

    const up = await resolveCommunes([{ postalCode: "35000", city: "Rennes" }], {
      fetchFn: fakeFetch([{ nom: "Rennes", code: "35238" }]),
    });
    expect(up.get(key)).toEqual({ status: "found", code: "35238", name: "Rennes" });
  });

  it("treats a non-OK response as unavailable and skips empty lookups", async () => {
    const fetchFn = fakeFetch([], false);
    const result = await resolveCommunes([{ postalCode: "35000" }, {}], { fetchFn });
    expect(result.get(communeLookupKey({ postalCode: "35000" }))).toEqual({ status: "unavailable" });
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});
