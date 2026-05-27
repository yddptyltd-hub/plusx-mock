import staticData from "@/data/pools.json";
import { fetchLivePools } from "@/lib/livePools";
import { PoolDetailClient } from "./PoolDetailClient";

export async function generateStaticParams() {
  try {
    const live = await fetchLivePools();
    return live.map((p) => ({ id: p.id }));
  } catch {
    // Fallback to static snapshot if live API is unreachable at build time
    return staticData.pools.map((p) => ({ id: p.id }));
  }
}

export const dynamicParams = false;

export default function PoolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <PoolDetailClient params={params} />;
}
