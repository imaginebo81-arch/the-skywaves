import { STORAGE_BUCKET, supabase } from "../../supabase";
import { ApiError } from "../../lib/errors";

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function uploadToStorage(file: Express.Multer.File, folder: string): Promise<string> {
  const ext = EXT_BY_MIME[file.mimetype];
  if (!ext) throw ApiError.badRequest("Only JPEG, PNG or WebP images are allowed");

  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  const path = `${folder}/${stamp}-${rand}.${ext}`;

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });
  if (error) throw ApiError.internal(`Upload failed: ${error.message}`);
  return path;
}

export async function uploadProfilePhoto(file: Express.Multer.File): Promise<string> {
  return uploadToStorage(file, "registrations");
}

export async function uploadSubjectImage(file: Express.Multer.File): Promise<string> {
  return uploadToStorage(file, "subjects");
}

export async function uploadCourseImage(file: Express.Multer.File): Promise<string> {
  return uploadToStorage(file, "courses");
}

export async function uploadFeedbackPhoto(file: Express.Multer.File): Promise<string> {
  return uploadToStorage(file, "feedbacks");
}

export async function uploadStudentPhoto(file: Express.Multer.File): Promise<string> {
  return uploadToStorage(file, "students");
}

export async function uploadEmployeePhoto(file: Express.Multer.File): Promise<string> {
  return uploadToStorage(file, "employees");
}

// Images are served through our own domain (same-origin proxy) instead of the raw
// Supabase/Kong host. Some ISPs (e.g. Jio) block *.up.railway.app, which broke image
// loading on those networks. The proxy streams bytes from storage via the app domain.
export async function signedPhotoUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `/api/public/image?p=${encodeURIComponent(path)}`;
}
