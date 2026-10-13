import ImageKit, { NotFoundError } from "@imagekit/nodejs";
import type { env } from "./env.js";

export async function deleteImageKitAsset(env: env, storedFileId: string | null) {
  if (!storedFileId) return;
  const client = new ImageKit({ privateKey: env.IMAGEKIT_PRIVATE_KEY });
  try {
    await client.files.delete(storedFileId);
  } catch (e: unknown) {
    if (e instanceof NotFoundError) return;
    throw e;
  }
}