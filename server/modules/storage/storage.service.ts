import { STORAGE_BUCKET, supabase } from "../../supabase";
import { ApiError } from "../../lib/errors";

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function uploadProfilePhoto(file: Express.Multer.File): Promise<string> {
  const ext = EXT_BY_MIME[file.mimetype];
  if (!ext) throw ApiError.badRequest("Only JPEG, PNG or WebP images are allowed");

  const stamp = Date.now().toString(36);
  const rand = Math.round(Number(`0.${stamp}`) * 1e9).toString(36);
  const path = `registrations/${stamp}-${rand}.${ext}`;

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });
  if (error) throw ApiError.internal(`Photo upload failed: ${error.message}`);
  return path;
}

export async function signedPhotoUrl(path: string | null, expiresIn = 3600): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(path, expiresIn);
  if (error) return null;
  return data?.signedUrl ?? null;
}
