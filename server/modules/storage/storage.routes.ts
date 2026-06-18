import { Router } from "express";
import multer from "multer";
import { asyncHandler, ok } from "../../lib/http";
import { ApiError } from "../../lib/errors";
import { requireAdmin } from "../../middleware/auth";
import { uploadCourseImage, uploadFeedbackPhoto, uploadProfilePhoto, uploadSubjectImage, uploadStudentPhoto, uploadEmployeePhoto, signedPhotoUrl } from "./storage.service";

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
