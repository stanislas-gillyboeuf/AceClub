import { beforeEach, describe, expect, it, vi } from "vitest";

const send = vi.fn();
const batchSend = vi.fn();

vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
    batch = { send: batchSend };
  },
}));

type Mailer = typeof import("../../services/mailer");
let mailer: Mailer;
let makeGhostEmail: () => string;

beforeEach(async () => {
  process.env.RESEND_API_KEY = "test-key";
  send.mockReset().mockResolvedValue({ data: { id: "1" }, error: null });
  batchSend.mockReset().mockImplementation(async (chunk: unknown[]) => ({ data: { data: chunk.map(() => ({})) }, error: null }));
  vi.resetModules();
  mailer = await import("../../services/mailer");
  ({ makeGhostEmail } = await import("../../lib/technical-email"));
});

const content = { subject: "S", html: "<p>h</p>", text: "t" };

describe("mailer guard", () => {
  it("sendEmail refuses a technical address without calling the provider", async () => {
    const result = await mailer.sendEmail({ to: makeGhostEmail(), ...content });
    expect(result).toEqual({ success: false, reason: "TechnicalAddress" });
    expect(send).not.toHaveBeenCalled();
  });

  it("sendEmail still sends to a real address", async () => {
    const result = await mailer.sendEmail({ to: "marie@gmail.com", ...content });
    expect(result.success).toBe(true);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("sendBatchEmails removes technical addresses from the batch and counts them as failed", async () => {
    const result = await mailer.sendBatchEmails([
      { to: "a@mail.fr", ...content },
      { to: makeGhostEmail(), ...content },
      { to: "b@mail.fr", ...content },
    ]);
    expect(result).toEqual({ sent: 2, failed: 1 });
    const sentTo = batchSend.mock.calls.flatMap((call) => (call[0] as { to: string[] }[]).map((e) => e.to[0]));
    expect(sentTo).toEqual(["a@mail.fr", "b@mail.fr"]);
  });

  it("a batch made only of technical addresses never reaches the provider", async () => {
    const result = await mailer.sendBatchEmails([{ to: makeGhostEmail(), ...content }]);
    expect(result).toEqual({ sent: 0, failed: 1 });
    expect(batchSend).not.toHaveBeenCalled();
  });
});
