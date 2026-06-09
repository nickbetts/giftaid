import { put } from "@vercel/blob";

export async function storeUploadFile(fileName: string, contents: string) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const byteSize = Buffer.byteLength(contents, "utf8");

  if (!token) {
    return {
      url: `inline://${fileName}`,
      contentType: "text/csv",
      size: byteSize,
    };
  }

  const blob = await put(`uploads/${Date.now()}-${fileName}`, contents, {
    access: "public",
    addRandomSuffix: true,
    contentType: "text/csv",
    token,
  });

  return {
    url: blob.url,
    contentType: blob.contentType,
    size: byteSize,
  };
}
