import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { MiniMaxCNProvider } from "../lib/image/providers/minimax-cn";
import type { ImageTaskInput } from "../lib/image/types";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const prompt =
    "Fashion lifestyle photography. The garment is EXACTLY THE SAME lavender suit — same lapels, same buttons, same silhouette, same color. The suit is naturally placed in a stylish modern cafe corner, warm afternoon sunlight, coffee and books nearby. Lifestyle mood, Xiaohongshu style. The full garment must be visible. Do NOT change clothing.";

  const provider = new MiniMaxCNProvider();
  const input: ImageTaskInput = {
    type: "product_photo",
    prompt,
    referenceImageUrl: "",
    aspectRatio: "1:1",
  };

  const result = await provider.generate(input);
  console.log("imageUrl starts with data:", result.imageUrl.startsWith("data:"));
  console.log("imageUrl length:", result.imageUrl.length);

  let buffer: ArrayBuffer;
  if (result.imageUrl.startsWith("data:")) {
    const b64 = result.imageUrl.replace(/^data:image\/\w+;base64,/, "");
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++)
      bytes[i] = binary.charCodeAt(i);
    buffer = bytes.buffer;
    console.log("base64 size:", buffer.byteLength);
  } else {
    const res = await fetch(result.imageUrl);
    buffer = await res.arrayBuffer();
    console.log("URL size:", buffer.byteLength);
  }

  const { error } = await supabase.storage
    .from("cases")
    .upload("fashion-lifestyle.jpg", buffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error) throw new Error("upload: " + error.message);

  const { data } = supabase.storage
    .from("cases")
    .getPublicUrl("fashion-lifestyle.jpg");

  console.log("OK:", data.publicUrl);
}

main().catch(console.error);
