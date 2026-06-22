import { useState, useEffect } from "react";
import { publicApi } from "../lib/api/public";

// Each item is a frontend-visible course. groupName is the public category (its course group).
export interface CatalogCourse {
  id: string;
  courseName: string;
  description: string | null;
  imageUrl: string | null;
  duration: string | null;
  groupId: string;
  groupName: string;
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
        const all = res.courses as CatalogCourse[];
        setCourses(category ? all.filter((c) => c.groupName.toLowerCase() === category.toLowerCase()) : all);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load courses"))
      .finally(() => setLoading(false));
  }, [category]);

  return { courses, loading, error };
}
