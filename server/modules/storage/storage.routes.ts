import { Router } from "express";
import multer from "multer";
import { asyncHandler, ok } from "../../lib/http";
import { ApiError } from "../../lib/errors";
import { requireAdmin } from "../../middleware/auth";
import { supabase, STORAGE_BUCKET } from "../../supabase";
import { uploadCourseImage, uploadFeedbackPhoto, uploadProfilePhoto, uploadSubjectImage, uploadStudentPhoto, uploadEmployeePhoto, signedPhotoUrl } from "./storage.service";

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

// Same-origin image proxy: streams stored objects through the app domain so images
// load on networks that block the raw storage host (e.g. Jio + *.up.railway.app).
export const publicImageRouter = Router();
publicImageRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const path = typeof req.query.p === "string" ? req.query.p : "";
    if (!path || path.includes("..") || path.startsWith("/")) {
      throw ApiError.badRequest("Invalid image path");
    }
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).download(path);
    if (error || !data) throw ApiError.notFound("Image not found");
    const buffer = Buffer.from(await data.arrayBuffer());
    const ext = path.split(".").pop()?.toLowerCase() ?? "";
    res.setHeader("Content-Type", data.type || MIME_BY_EXT[ext] || "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=86400, immutable");
    res.send(buffer);
  })
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 },
});

export const publicUploadsRouter = Router();

publicUploadsRouter.post(
  "/profile-photo",
  upload.single("photo"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest("No photo uploaded");
    const path = await uploadProfilePhoto(req.file);
    ok(res, { path }, 201);
  })
);

publicUploadsRouter.post(
  "/feedback-photo",
  upload.single("photo"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest("No photo uploaded");
    const path = await uploadFeedbackPhoto(req.file);
    ok(res, { path }, 201);
  })
);

export const adminUploadsRouter = Router();
adminUploadsRouter.use(requireAdmin);

adminUploadsRouter.post(
  "/subject-image",
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest("No image uploaded");
    const path = await uploadSubjectImage(req.file);
    const url = await signedPhotoUrl(path);
    ok(res, { path, url }, 201);
  })
);

adminUploadsRouter.post(
  "/course-image",
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest("No image uploaded");
    const path = await uploadCourseImage(req.file);
    const url = await signedPhotoUrl(path);
    ok(res, { path, url }, 201);
  })
);

adminUploadsRouter.post(
  "/student-photo",
  upload.single("photo"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest("No photo uploaded");
    const path = await uploadStudentPhoto(req.file);
    const url = await signedPhotoUrl(path);
    ok(res, { path, url }, 201);
  })
);

adminUploadsRouter.post(
  "/employee-photo",
  upload.single("photo"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest("No photo uploaded");
    const path = await uploadEmployeePhoto(req.file);
    const url = await signedPhotoUrl(path);
    ok(res, { path, url }, 201);
  })
);
