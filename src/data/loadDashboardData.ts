import type { DashboardData, Dimensions, Fact, Manifest } from "../types/dashboard";

const dataUrl = (file: string) => `${import.meta.env.BASE_URL}data/formularios-respondidos/${file}`;

async function fetchJson<T>(file: string): Promise<T> {
  const response = await fetch(dataUrl(file), { cache: "no-cache" });
  if (!response.ok) throw new Error(`Falha ao carregar ${file} (${response.status}).`);
  return response.json() as Promise<T>;
}

export async function loadDashboardData(): Promise<DashboardData> {
  const [facts, manifest, dimensions] = await Promise.all([
    fetchJson<Fact[]>("facts.json"),
    fetchJson<Manifest>("manifest.json"),
    fetchJson<Dimensions>("dimensions.json"),
  ]);
  if (facts.length !== manifest.publishedRows) {
    throw new Error("A quantidade de agrupamentos diverge do manifesto da carga.");
  }
  return { facts, manifest, dimensions };
}
