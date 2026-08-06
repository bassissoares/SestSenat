import { useEffect, useMemo, useState } from "react";
import { CircleMarker, GeoJSON, MapContainer, Popup, TileLayer } from "react-leaflet";
import type { PathOptions } from "leaflet";

import { loadGeography } from "../data/loadGeography";
import { useFilters } from "../state/FilterContext";
import type { GeographyData, StateFeatureProperties } from "../types/geography";

type CityAggregate = { city: string; state: string; quantity: number; units: number; responsibles: number; latitude: number; longitude: number };

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

export function MapPanel() {
  const { filteredFacts, drillTo } = useFilters();
  const [geography, setGeography] = useState<GeographyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadGeography().then((data) => active && setGeography(data)).catch((cause: unknown) => active && setError(cause instanceof Error ? cause.message : "Falha geográfica."));
    return () => { active = false; };
  }, []);

  const stateTotals = useMemo(() => {
    const totals = new Map<string, number>();
    filteredFacts.forEach((fact) => fact.state && totals.set(fact.state, (totals.get(fact.state) ?? 0) + fact.quantity));
    return totals;
  }, [filteredFacts]);
  const maxState = Math.max(...stateTotals.values(), 1);

  const cities = useMemo<CityAggregate[]>(() => {
    if (!geography) return [];
    const points = new Map(geography.cities.map((city) => [`${city.normalizedCity}|${city.state}`, city]));
    const groups = new Map<string, { quantity: number; units: Set<string>; responsibles: Set<string> }>();
    filteredFacts.forEach((fact) => {
      if (!fact.city || !fact.state) return;
      const key = `${normalize(fact.city)}|${fact.state}`;
      const group = groups.get(key) ?? { quantity: 0, units: new Set(), responsibles: new Set() };
      group.quantity += fact.quantity;
      group.units.add(fact.unitSummary);
      group.responsibles.add(fact.responsibleName);
      groups.set(key, group);
    });
    return [...groups.entries()].flatMap(([key, group]) => {
      const point = points.get(key);
      if (!point) return [];
      return [{ city: point.city, state: point.state, quantity: group.quantity, units: group.units.size, responsibles: group.responsibles.size, latitude: point.latitude, longitude: point.longitude }];
    });
  }, [filteredFacts, geography]);
  const maxCity = Math.max(...cities.map((city) => city.quantity), 1);

  const stateStyle = (feature?: GeoJSON.Feature<GeoJSON.Geometry, StateFeatureProperties>): PathOptions => {
    const total = stateTotals.get(feature?.properties.state ?? "") ?? 0;
    const intensity = total / maxState;
    return { color: "#ffffff", weight: 1.3, fillColor: total ? `rgb(${Math.round(32 - 10 * intensity)}, ${Math.round(170 - 60 * intensity)}, ${Math.round(238 - 20 * intensity)})` : "#dce7ef", fillOpacity: total ? 0.72 : 0.35 };
  };

  return (
    <section className="panel map-panel" id="secao-1" aria-labelledby="map-title">
      <header className="panel-header">
        <div><p className="eyebrow">DISTRIBUIÇÃO TERRITORIAL</p><h2 id="map-title">Mapa por cidade</h2></div>
        <span className="panel-note">Pontos aproximados pelo centro da malha municipal do IBGE</span>
      </header>
      {error ? <div className="map-fallback" role="status">Mapa indisponível. As demais análises continuam ativas. {error}</div> : !geography ? <div className="map-fallback" role="status">Carregando mapa…</div> : (
        <>
          <MapContainer className="interactive-map" center={[-14.5, -52.5]} zoom={4} minZoom={3} maxZoom={10} scrollWheelZoom>
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <GeoJSON key={`states-${filteredFacts.length}`} data={geography.states} style={stateStyle} onEachFeature={(feature, layer) => {
              const state = feature.properties?.state;
              if (state) layer.on({ click: () => drillTo({ state: [state] }) });
            }} />
            {cities.map((city) => (
              <CircleMarker key={`${city.city}-${city.state}`} center={[city.latitude, city.longitude]} radius={Math.max(5, 5 + 18 * Math.sqrt(city.quantity / maxCity))} pathOptions={{ color: "#003770", fillColor: "#ffd500", fillOpacity: .82, weight: 2 }} eventHandlers={{ click: () => drillTo({ state: [city.state], city: [city.city] }) }}>
                <Popup><strong>{city.city}/{city.state}</strong><br />{city.quantity.toLocaleString("pt-BR")} respondidos<br />{city.units} unidades · {city.responsibles} responsáveis</Popup>
              </CircleMarker>
            ))}
          </MapContainer>
          <div className="map-legend"><span><i className="legend-city" /> Cidade</span><span><i className="legend-state" /> Volume por UF</span><span>{cities.length} cidades localizadas</span></div>
          <details className="map-alternative">
            <summary>Consultar dados do mapa em lista</summary>
            <ul>{cities.slice().sort((a, b) => b.quantity - a.quantity).map((city) => <li key={`${city.city}-list`}><button type="button" onClick={() => drillTo({ state: [city.state], city: [city.city] })}>{city.city}/{city.state}: {city.quantity.toLocaleString("pt-BR")}</button></li>)}</ul>
          </details>
        </>
      )}
    </section>
  );
}
