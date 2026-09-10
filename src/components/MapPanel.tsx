import { useEffect, useMemo, useState } from "react";
import { CircleMarker, GeoJSON, MapContainer, Pane, TileLayer, Tooltip } from "react-leaflet";
import type { PathOptions } from "leaflet";

import { loadGeography } from "../data/loadGeography";
import { useFilters } from "../state/FilterContext";
import type { GeographyData, StateFeatureProperties } from "../types/geography";

type UnitTypeTotal = { type: string; quantity: number };
type CityAggregate = { city: string; filterCity: string; state: string; quantity: number; units: number; responsibles: number; unitTypes: UnitTypeTotal[]; dominantType: string; latitude: number; longitude: number };

const unitTypeColors: Record<string, string> = { A: "#234f74", B: "#3f7394", C: "#5b8fa3", D: "#72a091", CN: "#a96f7a", DN: "#c18b5b", "Não identificado": "#8a98a4" };
const colorForType = (type: string) => unitTypeColors[type] ?? "#8796a5";
const stateFillColor = (quantity: number, maximum: number) => quantity ? `hsl(204 70% ${Math.round(88 - 55 * (quantity / maximum))}%)` : "#e8eef2";

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

export function MapPanel() {
  const { filteredFacts, drillTo } = useFilters();
  const [geography, setGeography] = useState<GeographyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [highlightedUnitType, setHighlightedUnitType] = useState<string | null>(null);

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
    const groups = new Map<string, { filterCity: string; quantity: number; units: Set<string>; responsibles: Set<string>; unitTypes: Map<string, number> }>();
    filteredFacts.forEach((fact) => {
      if (!fact.city || !fact.state) return;
      const key = `${normalize(fact.city)}|${fact.state}`;
      const group = groups.get(key) ?? { filterCity: fact.city, quantity: 0, units: new Set(), responsibles: new Set(), unitTypes: new Map() };
      group.quantity += fact.quantity;
      group.units.add(fact.unitSummary);
      group.responsibles.add(fact.responsibleName);
      group.unitTypes.set(fact.unitType, (group.unitTypes.get(fact.unitType) ?? 0) + fact.quantity);
      groups.set(key, group);
    });
    return [...groups.entries()].flatMap(([key, group]) => {
      const point = points.get(key);
      if (!point) return [];
      const unitTypes = [...group.unitTypes.entries()].map(([type, quantity]) => ({ type, quantity })).sort((a, b) => b.quantity - a.quantity);
      return [{ city: group.filterCity, filterCity: group.filterCity, state: point.state, quantity: group.quantity, units: group.units.size, responsibles: group.responsibles.size, unitTypes, dominantType: unitTypes[0]?.type ?? "Não identificado", latitude: point.latitude, longitude: point.longitude }];
    });
  }, [filteredFacts, geography]);
  const maxCity = Math.max(...cities.map((city) => city.quantity), 1);

  const stateStyle = (feature?: GeoJSON.Feature<GeoJSON.Geometry, StateFeatureProperties>): PathOptions => {
    const total = stateTotals.get(feature?.properties.state ?? "") ?? 0;
    return { color: "#ffffff", weight: 1.3, fillColor: stateFillColor(total, maxState), fillOpacity: total ? 0.82 : 0.4 };
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
            <Pane name="forms-tooltips" style={{ zIndex: 700, pointerEvents: "none" }} />
            <Pane name="state-polygons" style={{ zIndex: 410 }}><GeoJSON key={`states-${filteredFacts.length}`} data={geography.states} style={stateStyle} onEachFeature={(feature, layer) => {
              const state = feature.properties?.state;
              if (state) layer.on({ click: () => drillTo({ state: [state] }) });
            }} /></Pane>
            <Pane name="city-bubbles" style={{ zIndex: 430 }}>{cities.map((city) => (
              <CircleMarker key={`${city.city}-${city.state}`} center={[city.latitude, city.longitude]} radius={Math.max(5, 5 + 18 * Math.sqrt(city.quantity / maxCity)) + (highlightedUnitType === city.dominantType ? 2 : 0)} pathOptions={{ color: "#003770", fillColor: colorForType(city.dominantType), fillOpacity: !highlightedUnitType || highlightedUnitType === city.dominantType ? .9 : .12, opacity: !highlightedUnitType || highlightedUnitType === city.dominantType ? 1 : .18, weight: highlightedUnitType === city.dominantType ? 3 : 2 }} eventHandlers={{ click: () => drillTo({ state: [city.state], city: [city.filterCity] }) }}>
                <Tooltip pane="forms-tooltips" sticky direction="top" opacity={.96} className="map-tooltip"><strong>{city.city}/{city.state}</strong><br /><span>Tipo predominante: <b>{city.dominantType}</b></span><br />{city.quantity.toLocaleString("pt-BR")} respondidos<br />{city.units} unidades · {city.responsibles} responsáveis<br /><span>Composição: {city.unitTypes.map((item) => `${item.type} ${item.quantity.toLocaleString("pt-BR")}`).join(" · ")}</span></Tooltip>
              </CircleMarker>
            ))}</Pane>
          </MapContainer>
          <div className="map-legend"><span className="state-scale"><i className="legend-state" /> Volume por UF <small>menor</small><i className="legend-state-gradient" /><small>maior</small></span>{Object.entries(unitTypeColors).map(([type, color]) => <button type="button" className={highlightedUnitType === type ? "active" : highlightedUnitType ? "muted" : ""} aria-pressed={highlightedUnitType === type} key={type} onClick={() => setHighlightedUnitType((current) => current === type ? null : type)} title={`Destacar cidades do tipo ${type}`}><i className="legend-city" style={{ backgroundColor: color }} /> Tipo {type}</button>)}<span className="map-city-count">{cities.length} cidades localizadas</span></div>
          <details className="map-alternative">
            <summary>Consultar dados do mapa em lista</summary>
            <ul>{cities.slice().sort((a, b) => b.quantity - a.quantity).map((city) => <li key={`${city.city}-list`}><button type="button" onClick={() => drillTo({ state: [city.state], city: [city.filterCity] })}>{city.city}/{city.state}: {city.quantity.toLocaleString("pt-BR")}</button></li>)}</ul>
          </details>
        </>
      )}
    </section>
  );
}
