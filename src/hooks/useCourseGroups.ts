import { useState, useEffect } from "react";
import { publicApi } from "../lib/api/public";

export interface PublicCourseGroup {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
}

export function useCourseGroups() {
  const [groups, setGroups] = useState<PublicCourseGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi
      .getCourseGroups()
      .then((res) => setGroups(res.groups))
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, []);

  return { groups, loading };
}
