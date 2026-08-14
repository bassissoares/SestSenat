import { useEffect, useMemo, useState } from "react";
import { CircleMarker, GeoJSON, MapContainer, Pane, TileLayer, Tooltip } from "react-leaflet";
import { loadGeography } from "../data/loadGeography";
import type { GeographyData } from "../types/geography";
import type { ResponseDimensions } from "../types/responses";
import { percentage } from "../data/responseAnalytics";

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

export function ResponsesMap({ facts, denominators, eligibleKeys, dimensions, onCity }: { facts: number[][]; denominators: number[][]; eligibleKeys: Set<string>; dimensions: ResponseDimensions; onCity: (city: string) => void }) {
  const [geo, setGeo] = useState<GeographyData | null>(null);
  const [metric, setMetric] = useState<"volume" | "rate">("volume");
  useEffect(() => { loadGeography().then(setGeo); }, []);
  const cities = useMemo(() => {
    const totals = new Map<string, { city: string; state: string; quantity: number; base: number }>();
    facts.forEach(row => {
      const unit = dimensions.units[row[4]];
      if (!unit.city || !unit.state) return;
      const key = `${normalize(unit.city)}|${unit.state}`;
      const item = totals.get(key) ?? { city: unit.city, state: unit.state, quantity: 0, base: 0 };
      item.quantity += row[12]; totals.set(key, item);
    });
    denominators.filter(row => eligibleKeys.has(`${row[0]}|${row[1]}|${row[2]}`)).forEach(row => {
      const unit = dimensions.units[row[4]];
      if (!unit.city || !unit.state) return;
      const key = `${normalize(unit.city)}|${unit.state}`;
      const item = totals.get(key) ?? { city: unit.city, state: unit.state, quantity: 0, base: 0 };
      item.base += row[6]; totals.set(key, item);
    });
    if (!geo) return [];
    const points = new Map(geo.cities.map(city => [`${city.normalizedCity}|${city.state}`, city]));
    return [...totals.entries()].flatMap(([key, value]) => { const point = points.get(key); return point ? [{ ...value, rate: percentage(value.quantity, value.base), latitude: point.latitude, longitude: point.longitude }] : []; });
  }, [facts, denominators, eligibleKeys, dimensions, geo]);
  const max = Math.max(...cities.map(city => metric === "volume" ? city.quantity : city.rate), 1);
  if (!geo) return <div className="map-fallback">Carregando mapa da questão…</div>;
  return <>
    <div className="map-metric-toggle segmented" aria-label="Métrica do mapa"><button className={metric === "volume" ? "active" : ""} onClick={() => setMetric("volume")}>Volume</button><button className={metric === "rate" ? "active" : ""} onClick={() => setMetric("rate")}>Percentual</button></div>
    <MapContainer className="interactive-map response-map" center={[-14.5, -52.5]} zoom={4} minZoom={3} maxZoom={10}>
      <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Pane name="response-states" style={{ zIndex: 410 }}><GeoJSON data={geo.states} style={{ color: "#fff", weight: 1, fillColor: "#dceaf3", fillOpacity: .55 }} /></Pane>
      <Pane name="response-cities" style={{ zIndex: 430 }}>{cities.filter(city => city.quantity > 0).map(city => { const value = metric === "volume" ? city.quantity : city.rate; return <CircleMarker key={`${city.city}-${city.state}`} center={[city.latitude, city.longitude]} radius={6 + 18 * Math.sqrt(value / max)} pathOptions={{ color: "#003770", fillColor: metric === "volume" ? "#20AAEE" : "#F4C430", fillOpacity: .85, weight: 2 }} eventHandlers={{ click: () => onCity(city.city) }}><Tooltip sticky><strong>{city.city}/{city.state}</strong><br />{city.quantity.toLocaleString("pt-BR")} seleções<br />{city.rate.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% sobre {city.base.toLocaleString("pt-BR")} elegíveis</Tooltip></CircleMarker>; })}</Pane>
    </MapContainer>
    <div className="map-legend"><span><i className="legend-city" /> {metric === "volume" ? "Volume da questão" : "Incidência sobre elegíveis"} por cidade</span><span className="map-city-count">{cities.filter(city => city.quantity > 0).length} cidades</span></div>
  </>;
}
