import { describe, it, expect, afterEach } from "vitest";
import { addBufferToUsage, getBufferTokens } from "../../open-sse/utils/usageTracking.js";

describe("USAGE_BUFFER_TOKENS", () => {
  const saved = process.env.USAGE_BUFFER_TOKENS;
  afterEach(() => {
    if (saved === undefined) delete process.env.USAGE_BUFFER_TOKENS;
    else process.env.USAGE_BUFFER_TOKENS = saved;
  });

  it("defaults to 2000 when unset, empty, or invalid", () => {
    expect(getBufferTokens({})).toBe(2000);
    expect(getBufferTokens({ USAGE_BUFFER_TOKENS: "" })).toBe(2000);
    expect(getBufferTokens({ USAGE_BUFFER_TOKENS: "-5" })).toBe(2000);
    expect(getBufferTokens({ USAGE_BUFFER_TOKENS: "abc" })).toBe(2000);
  });

  it("0 reports the provider's real counts unchanged", () => {
    process.env.USAGE_BUFFER_TOKENS = "0";
    const usage = { prompt_tokens: 36, completion_tokens: 11, total_tokens: 47 };
    expect(addBufferToUsage(usage)).toEqual(usage);
  });

  it("applies a custom buffer", () => {
    process.env.USAGE_BUFFER_TOKENS = "500";
    expect(addBufferToUsage({ prompt_tokens: 36, completion_tokens: 11, total_tokens: 47 }))
      .toEqual({ prompt_tokens: 536, completion_tokens: 11, total_tokens: 547 });
  });

  it("keeps the upstream default when unset", () => {
    delete process.env.USAGE_BUFFER_TOKENS;
    expect(addBufferToUsage({ prompt_tokens: 36 }).prompt_tokens).toBe(2036);
  });
});
