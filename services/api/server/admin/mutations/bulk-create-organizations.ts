import { Context } from "hono";
import { streamSSE } from "hono/streaming";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { bulkCreateOrganizationsValidator } from "../validators";
import { auth } from "../../../auth";
import { reverseGeocode, delay } from "../../organization/services/geocoding";
import { generatePin } from "../../organization/services/pin";
import { db } from "../../../db";
import { organization } from "../../../db/schema/auth/schema";
import { eq, like } from "drizzle-orm";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function getUniqueSlug(baseSlug: string): Promise<string> {
  const [existing] = await db
    .select({ id: organization.id })
    .from(organization)
    .where(eq(organization.slug, baseSlug))
    .limit(1);

  if (!existing) return baseSlug;

  const similar = await db
    .select({ slug: organization.slug })
    .from(organization)
    .where(like(organization.slug, `${baseSlug}-%`));

  const usedNumbers = similar
    .map((s) => {
      const match = s.slug.match(new RegExp(`^${baseSlug}-(\\d+)$`));
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => n > 0);

  const nextNumber = usedNumbers.length > 0 ? Math.max(...usedNumbers) + 1 : 1;
  return `${baseSlug}-${nextNumber}`;
}

export const bulkCreateOrganizations = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof bulkCreateOrganizationsValidator>;
  const { clubs } = validated;

  return streamSSE(c, async (stream) => {
    const results = { created: 0, errors: 0 };

    await stream.writeSSE({
      event: "start",
      data: JSON.stringify({ total: clubs.length }),
    });

    for (let i = 0; i < clubs.length; i++) {
      const club = clubs[i];

      try {
        const baseSlug = slugify(club.nom);
        if (!baseSlug) {
          results.errors++;
          await stream.writeSSE({
            event: "error",
            data: JSON.stringify({
              index: i,
              clubId: club.clubId,
              nom: club.nom,
              error: "Could not generate slug from name",
              ...results,
            }),
          });
          continue;
        }

        const slug = await getUniqueSlug(baseSlug);

        // Reverse geocode with rate limiting
        let address: string | null = null;
        if (club.lat && club.lng) {
          const geocodeResult = await reverseGeocode(club.lat, club.lng);
          if (geocodeResult) {
            address = geocodeResult.address;
          }
          await delay(1100);
        }

        const metadata = {
          fftClubId: club.clubId,
          fftVille: club.ville,
          fftTerrains: club.terrainPratiqueLibelle,
          fftPratiques: club.pratiques,
          source: "fft-import",
        };

        const createdOrg = await auth.api.createOrganization({
          body: {
            name: club.nom.trim(),
            slug,
            metadata,
          },
          headers: c.req.raw.headers,
        });

        if (createdOrg && createdOrg.id) {
          const updateData: Record<string, unknown> = {
            pin: generatePin(),
            latitude: club.lat,
            longitude: club.lng,
          };
          if (address) {
            updateData.address = address;
          }

          await db.update(organization).set(updateData).where(eq(organization.id, createdOrg.id));

          results.created++;
        }

        await stream.writeSSE({
          event: "progress",
          data: JSON.stringify({
            index: i,
            total: clubs.length,
            clubId: club.clubId,
            nom: club.nom,
            slug,
            address,
            status: "created",
            ...results,
          }),
        });
      } catch (error) {
        results.errors++;
        await stream.writeSSE({
          event: "error",
          data: JSON.stringify({
            index: i,
            clubId: club.clubId,
            nom: club.nom,
            error: (error as Error).message,
            ...results,
          }),
        });
      }
    }

    await stream.writeSSE({
      event: "complete",
      data: JSON.stringify(results),
    });
  });
};
