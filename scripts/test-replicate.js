#!/usr/bin/env node
/**
 * Test Replicate API - Image Generation
 * Run: node scripts/test-replicate.js
 */

const Replicate = require("replicate");

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const TEST_MODEL = "openai/gpt-image-2";

async function main() {
  console.log("=== Replicate API Test ===");
  console.log(`Model: ${TEST_MODEL}`);
  console.log(`Token: ${process.env.REPLICATE_API_TOKEN ? "✓ set" : "✗ missing"}`);
  
  if (!process.env.REPLICATE_API_TOKEN) {
    console.error("ERROR: REPLICATE_API_TOKEN not set");
    process.exit(1);
  }

  try {
    console.log("\n1. Listing model info...");
    const model = await replicate.models.get("openai", "gpt-image-2");
    console.log(`   Model: ${model.owner}/${model.name}`);
    console.log(`   Latest version: ${model.latest_version?.id}`);

    console.log("\n2. Running prediction...");
    const startTime = Date.now();
    
    const prediction = await replicate.predictions.create({
      version: model.latest_version.id,
      input: {
        prompt: "A clean white background e-commerce product photo of a handbag, professional studio lighting, high quality",
        aspect_ratio: "1:1",
        num_outputs: 1,
      },
    });

    console.log(`   Prediction ID: ${prediction.id}`);
    console.log(`   Status: ${prediction.status}`);

    // Poll for completion
    let result = prediction;
    while (result.status !== "succeeded" && result.status !== "failed") {
      await new Promise(r => setTimeout(r, 2000));
      result = await replicate.predictions.get(result.id);
      console.log(`   Status: ${result.status}...`);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    
    if (result.status === "succeeded") {
      console.log(`\n3. SUCCESS! (${elapsed}s)`);
      console.log(`   Output: ${JSON.stringify(result.output)}`);
    } else {
      console.log(`\n4. FAILED: ${result.error?.join?.(", ") || result.error}`);
    }

  } catch (err) {
    console.error("\nERROR:", err.message);
    if (err.response?.data) {
      console.error("Details:", JSON.stringify(err.response.data, null, 2));
    }
    process.exit(1);
  }
}

main();
