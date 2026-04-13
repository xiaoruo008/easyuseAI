import "dotenv/config";

async function main() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const url = process.env.SUPABASE_URL ?? "";

  // ① 列出已有 bucket
  const listRes = await fetch(`${url}/storage/v1/bucket`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  const listText = await listRes.text();
  console.log("[1] 列出 bucket:", listRes.status, listText.slice(0, 300));

  // ② 尝试直接上传到 public bucket
  const upRes = await fetch(`${url}/storage/v1/object/cases/test.txt`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "text/plain",
      "x-upsert": "true",
    },
    body: "test",
  });
  const upText = await upRes.text();
  console.log("[2] 上传测试:", upRes.status, upText.slice(0, 300));
}

main().catch(console.error);
