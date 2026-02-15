import "dotenv/config";
import { auth } from "../auth";
import { db } from "../db";
import { user, account } from "../db/schema/auth/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { ulid } from "ulid";

const EMAIL = process.argv[2] || "nicolas@impulselab.ai";

// Generate a secure random password
const password = crypto.randomBytes(16).toString("base64url");

async function main() {
  const ctx = await auth.$context;

  const [foundUser] = await db.select().from(user).where(eq(user.email, EMAIL)).limit(1);

  if (!foundUser) {
    console.error(`User not found: ${EMAIL}`);
    process.exit(1);
  }

  console.log(`Found user: ${foundUser.name} (${foundUser.id})`);

  // Hash the password using Better Auth's internal hasher
  const hashedPassword = await ctx.password.hash(password);

  // Check if a credential account already exists
  const [existing] = await db
    .select()
    .from(account)
    .where(and(eq(account.userId, foundUser.id), eq(account.providerId, "credential")))
    .limit(1);

  if (existing) {
    // Update existing credential account
    await db
      .update(account)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(account.id, existing.id));
    console.log("Updated existing credential account.");
  } else {
    // Create credential account
    await db.insert(account).values({
      id: ulid(),
      accountId: foundUser.id,
      providerId: "credential",
      userId: foundUser.id,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("Created new credential account.");
  }

  console.log("\nPassword set successfully!");
  console.log(`Email: ${EMAIL}`);
  console.log(`Password: ${password}`);
}

main().catch(console.error);
