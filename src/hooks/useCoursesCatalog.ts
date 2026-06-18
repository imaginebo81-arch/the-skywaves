import { useState, useEffect } from "react";
import { publicApi } from "../lib/api/public";

// Each item is a subject (isCourse=false) or a bare course with no subjects (isCourse=true).
// courseName acts as the category grouping on the frontend.
export interface CatalogSubject {
  id: string;
  subjectName: string;
  description: string | null;
  imageUrl: string | null;
  duration: string | null;
  courseId: string;
  courseName: string;
  isCourse: boolean;
}

export function useCoursesCatalog(category?: string) {
  const [courses, setCourses] = useState<CatalogSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    publicApi
      .getCoursesCatalog()
      .then((res) => {
        const all = res.courses as CatalogSubject[];
        setCourses(category ? all.filter((c) => c.courseName.toLowerCase() === category.toLowerCase()) : all);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load courses"))
      .finally(() => setLoading(false));
  }, [category]);

  return { courses, loading, error };
}
