import { TokenDetailClient } from "./TokenDetailClient";
import fs from "node:fs/promises";
import path from "node:path";

export async function generateStaticParams() {
  try {
    const file = path.join(process.cwd(), "public", "data", "price_graph.json");
    const graph = JSON.parse(await fs.readFile(file, "utf-8"));
    const addresses = Object.keys(graph.tokens || {});
    return addresses.map((address) => ({ address: address.toLowerCase() }));
  } catch {
    return [];
  }
}

export const dynamicParams = false;

export default function TokenPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  return <TokenDetailClient params={params} />;
}
