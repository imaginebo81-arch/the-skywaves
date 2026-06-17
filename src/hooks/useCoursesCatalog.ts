import { useState, useEffect } from "react";
import { publicApi } from "../lib/api/public";

export interface CatalogCourse {
  id: string;
  courseName: string;
  duration: string | null;
  description: string | null;
  imageUrl: string | null;
  category: string | null;
  subjects: { id: string; subjectName: string; description: string | null; imageUrl: string | null }[];
}

export function useCoursesCatalog(category?: string) {
  const [courses, setCourses] = useState<CatalogCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    publicApi
      .getCoursesCatalog()
      .then((res) => {
        const all = res.courses;
        setCourses(category ? all.filter((c) => c.category?.toLowerCase() === category.toLowerCase()) : all);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load courses"))
      .finally(() => setLoading(false));
  }, [category]);

  return { courses, loading, error };
}
