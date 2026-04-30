/**
 * Test script for Replicate API
 * Usage: node scripts/test-replicate.js
 *
 * Verifies:
 * 1. REPLICATE_API_TOKEN is configured
 * 2. API key is valid (can authenticate)
 * 3. Can create and complete a prediction
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const API_TOKEN = process.env.REPLICATE_API_TOKEN;

if (!API_TOKEN) {
  console.error("❌ REPLICATE_API_TOKEN is not set in .env");
  process.exit(1);
}

const displayToken = API_TOKEN.slice(0, 8) + "...";
console.log(`🔑 Using token: ${displayToken}`);

async function main() {
  // Load Replicate SDK
  let Replicate;
  try {
    Replicate = require("replicate");
    console.log("✅ Replicate package loaded");
  } catch (e) {
    console.error("❌ Failed to load 'replicate' package. Run: npm install replicate");
    process.exit(1);
  }

  const client = new Replicate({ auth: API_TOKEN });

  // Test 1: Try a lightweight run call to verify auth
  // Using a very fast model with minimal steps to verify the token works
  console.log("\n📡 Test 1: Verifying API authentication (lightweight run)...");
  try {
    // Call client.run with flux-schnell which is fast
    // This will throw if auth is invalid
    const output = await client.run("black-forest-labs/flux-schnell", {
      input: {
        prompt: "a cute cat",
        num_inference_steps: 4,
        width: 512,
        height: 512,
      },
    });
    console.log("✅ API authentication successful!");
    console.log("   Output type:", typeof output, Array.isArray(output) ? "(array)" : "");

    // Extract URL from output
    // Replicate v1.x output: array of objects with url() method or toString()
    let imageUrl = null;
    if (typeof output === "string" && output.startsWith("http")) {
      imageUrl = output;
    } else if (output && typeof output === "object") {
      if ("href" in output && typeof output.href === "string") {
        // Standard URL object
        imageUrl = output.href;
      } else if ("url" in output) {
        // FileOutput: { url: fn() } or { url: "..." }
        const urlProp = output.url;
        const resolved = typeof urlProp === "function" ? urlProp() : urlProp;
        if (typeof resolved === "string" && resolved.startsWith("http")) {
          imageUrl = resolved;
        } else if (resolved && typeof resolved === "object" && "href" in resolved) {
          imageUrl = resolved.href;
        }
      } else if (Array.isArray(output)) {
        for (const item of output) {
          if (typeof item === "string" && item.startsWith("http")) {
            imageUrl = item;
          } else if (item && typeof item === "object") {
            // Try toString() which Replicate objects implement
            const asString = String(item);
            if (asString.startsWith("http")) {
              imageUrl = asString;
            } else if ("url" in item) {
              const urlProp = item.url;
              const resolved = typeof urlProp === "function" ? urlProp() : urlProp;
              if (typeof resolved === "string" && resolved.startsWith("http")) {
                imageUrl = resolved;
                } else if (resolved && typeof resolved === "object" && "href" in resolved) {
                  imageUrl = resolved.href;
                }
            }
          }
          if (imageUrl) break;
        }
      } else {
        // Fallback: try toString()
        const asString = String(output);
        if (asString.startsWith("http")) {
          imageUrl = asString;
        }
      }
    }
    console.log("   Image URL:", imageUrl ?? "(not found in output)");
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    if (err.includes("401") || err.includes("unauthorized") || err.includes("Unauthenticated")) {
      console.error(`❌ Invalid API token (401 Unauthorized)`);
    } else {
      console.error(`❌ API test failed: ${err}`);
    }
    process.exit(1);
  }

  console.log("\n🎉 All tests passed! Replicate API is configured correctly.");
}

main().catch((e) => {
  console.error("❌ Unexpected error:", e);
  process.exit(1);
});
