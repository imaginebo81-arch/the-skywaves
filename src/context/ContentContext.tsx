import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { publicApi } from "../lib/api/public";
import { defaultSiteContent, type SiteContent } from "../data/siteContent";

interface ContentContextValue {
  content: SiteContent;
  loading: boolean;
}

const ContentContext = createContext<ContentContextValue>({
  content: defaultSiteContent,
  loading: true,
});

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    publicApi
      .getContent()
      .then((res) => {
        if (active && res?.content) setContent(res.content);
      })
      .catch(() => {
        // Keep the bundled defaults if the API is unreachable.
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return <ContentContext.Provider value={{ content, loading }}>{children}</ContentContext.Provider>;
}

export function useContent(): SiteContent {
  return useContext(ContentContext).content;
}

export function useContentState(): ContentContextValue {
  return useContext(ContentContext);
}
