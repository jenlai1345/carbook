import * as React from "react";
import Parse from "../lib/parseClient";

// 你現有的型別
type Option = { id: string; name: string };

type UseBrandOptionsResult = {
  options: Option[];
  setOptions: React.Dispatch<React.SetStateAction<Option[]>>;
  loading: boolean;
  error: unknown | null;
};

// 24 小時 TTL（可依需要調）
const TTL_MS = 24 * 60 * 60 * 1000;

export function useBrandOptions(
  userId: string,
  nameFilter: string // debounced keyword
): UseBrandOptionsResult {
  const [options, setOptions] = React.useState<Option[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<unknown | null>(null);

  // 建一個每位用戶/關鍵字專屬的快取 key（或只依 userId；若要全清單先傳 "" 的 nameFilter）
  const cacheKey = React.useMemo(
    () => `brandOpts:${userId}:${nameFilter || "__all__"}`,
    [userId, nameFilter]
  );

  // 1) 嘗試讀取快取：第一次 render 立即顯示
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(cacheKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { ts: number; data: Option[] };
      // 如果還沒過期，就先用
      if (parsed?.data && Date.now() - parsed.ts < TTL_MS) {
        setOptions(parsed.data);
      }
    } catch {
      // 忽略 parse 失敗
    }
  }, [cacheKey]);

  // 2) SWR：背景去取最新；回來後更新 UI 並覆蓋快取
  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // 等 user ready（避免 owner 為 null 查不到資料）
        const user =
          (await Parse.User.currentAsync()) || Parse.User.current() || null;
        if (!user || !userId) {
          // 沒 user 就不要查；但保留快取顯示
          return;
        }

        const q = new Parse.Query("Brand");
        q.equalTo("owner", user);
        if (nameFilter) q.matches("name", nameFilter, "i");
        q.ascending("name");
        q.limit(1000);

        const rows = await q.find();
        if (!alive) return;

        const fresh = rows
          .map((x) => ({ id: x.id as string, name: x.get("name") as string }))
          .filter((o) => !!o.id);

        setOptions(fresh);

        if (typeof window !== "undefined") {
          const payload = JSON.stringify({ ts: Date.now(), data: fresh });
          localStorage.setItem(cacheKey, payload);
        }
      } catch (e) {
        if (!alive) return;
        setError(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [cacheKey, nameFilter, userId]);

  return { options, setOptions, loading, error };
}
