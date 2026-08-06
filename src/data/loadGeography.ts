import type { CityPoint, GeographyData, StateFeatureCollection } from "../types/geography";

async function fetchGeo<T>(file: string): Promise<T> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/geography/${file}`);
  if (!response.ok) throw new Error(`Falha ao carregar ${file} (${response.status}).`);
  return response.json() as Promise<T>;
}

export async function loadGeography(): Promise<GeographyData> {
  const [cities, states] = await Promise.all([
    fetchGeo<CityPoint[]>("cities.json"),
    fetchGeo<StateFeatureCollection>("states.geojson"),
  ]);
  return { cities, states };
}
