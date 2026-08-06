#!/usr/bin/env python3
"""Relaciona cidades do snapshot às malhas simplificadas oficiais do IBGE."""

from __future__ import annotations

import argparse
import gzip
import json
import shutil
import tempfile
import unicodedata
import urllib.request
from pathlib import Path
from typing import Iterable


LOCALITIES_URL = "https://servicodados.ibge.gov.br/api/v1/localidades/municipios"
MUNICIPAL_MESH_URL = (
    "https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR"
    "?formato=application/vnd.geo%2Bjson&qualidade=minima&intrarregiao=municipio"
)
STATE_MESH_URL = (
    "https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR"
    "?formato=application/vnd.geo%2Bjson&qualidade=minima&intrarregiao=UF"
)
STATES_URL = "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
USER_AGENT = "SestSenatDashboard/1.0 (dados geograficos publicos)"

# Alguns nomes do InspectApp identificam bairros ou nomes operacionais de unidades.
# O valor de destino é sempre um município oficial do IBGE na mesma UF.
MUNICIPALITY_ALIASES = {
    ("BELO HORIZONTE (JARDIM VITORIA)", "MG"): "BELO HORIZONTE",
    ("BELO HORIZONTE (SERRA VERDE)", "MG"): "BELO HORIZONTE",
    ("FERNAO DIAS", "SP"): "SAO PAULO",
    ("MANAUS (JORGE TEIXEIRA)", "AM"): "MANAUS",
    ("MANAUS (PLANALTO)", "AM"): "MANAUS",
    ("PACIENCIA", "RJ"): "RIO DE JANEIRO",
    ("SANTANA DO LIVRAMENTO", "RS"): "SANT'ANA DO LIVRAMENTO",
    ("SANTO AMARO", "SP"): "SAO PAULO",
    ("SAO PAULO (PARQUE NOVO MUNDO)", "SP"): "SAO PAULO",
    ("SAO PAULO (VILA JAGUARA)", "SP"): "SAO PAULO",
    ("VALE DO ACO", "MG"): "SANTANA DO PARAISO",
}


def normalized_name(value: str) -> str:
    decomposed = unicodedata.normalize("NFKD", value)
    ascii_value = "".join(character for character in decomposed if not unicodedata.combining(character))
    return " ".join(ascii_value.upper().replace("’", "'").split())


def fetch_json(url: str) -> object:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept-Encoding": "gzip"})
    with urllib.request.urlopen(request, timeout=90) as response:
        content = response.read()
        if response.headers.get("Content-Encoding") == "gzip":
            content = gzip.decompress(content)
    return json.loads(content)


def iter_points(coordinates: object) -> Iterable[tuple[float, float]]:
    if isinstance(coordinates, list) and len(coordinates) >= 2 and all(isinstance(value, (int, float)) for value in coordinates[:2]):
        yield float(coordinates[0]), float(coordinates[1])
    elif isinstance(coordinates, list):
        for child in coordinates:
            yield from iter_points(child)


def geometry_center(geometry: dict[str, object]) -> tuple[float, float]:
    points = list(iter_points(geometry.get("coordinates")))
    if not points:
        raise ValueError("Geometria sem coordenadas.")
    longitudes = [point[0] for point in points]
    latitudes = [point[1] for point in points]
    return (sum(latitudes) / len(latitudes), sum(longitudes) / len(longitudes))


def state_from_municipality(item: dict[str, object]) -> str:
    immediate = item.get("regiao-imediata") or {}
    intermediate = immediate.get("regiao-intermediaria") or {}
    state = intermediate.get("UF") or {}
    return str(state.get("sigla") or "")


def build_geography(facts_path: Path) -> tuple[list[dict[str, object]], dict[str, object], list[dict[str, str]]]:
    facts = json.loads(facts_path.read_text(encoding="utf-8"))
    requested = {
        (normalized_name(str(fact["city"])), str(fact["state"]))
        for fact in facts
        if fact.get("city") and fact.get("state")
    }

    localities = fetch_json(LOCALITIES_URL)
    locality_index = {
        (normalized_name(str(item["nome"])), state_from_municipality(item)): item
        for item in localities
    }
    resolved: dict[tuple[str, str], dict[str, object]] = {}
    for key in requested:
        canonical_key = (MUNICIPALITY_ALIASES.get(key, key[0]), key[1])
        if canonical_key in locality_index:
            resolved[key] = locality_index[canonical_key]
    unresolved = [
        {"city": city, "state": state, "reason": "municipality-not-found"}
        for city, state in sorted(requested - resolved.keys())
    ]

    municipality_mesh = fetch_json(MUNICIPAL_MESH_URL)
    mesh_by_id = {
        str(feature["properties"]["codarea"]): feature
        for feature in municipality_mesh["features"]
    }
    cities: list[dict[str, object]] = []
    for key, locality in sorted(resolved.items()):
        municipality_id = str(locality["id"])
        feature = mesh_by_id.get(municipality_id)
        if not feature:
            unresolved.append({"city": key[0], "state": key[1], "reason": "mesh-not-found"})
            continue
        latitude, longitude = geometry_center(feature["geometry"])
        cities.append(
            {
                "municipalityId": municipality_id,
                "city": str(locality["nome"]),
                "normalizedCity": key[0],
                "state": key[1],
                "latitude": round(latitude, 6),
                "longitude": round(longitude, 6),
                "positionType": "ibge-simplified-mesh-center",
            }
        )

    states = fetch_json(STATES_URL)
    state_names = {str(item["id"]): {"state": item["sigla"], "name": item["nome"]} for item in states}
    state_mesh = fetch_json(STATE_MESH_URL)
    for feature in state_mesh["features"]:
        feature["properties"].update(state_names.get(str(feature["properties"]["codarea"]), {}))
    return cities, state_mesh, unresolved


def write_atomically(output_dir: Path, cities: list[dict[str, object]], states: dict[str, object], unresolved: list[dict[str, str]]) -> None:
    output_dir.parent.mkdir(parents=True, exist_ok=True)
    temp_dir = Path(tempfile.mkdtemp(prefix=f".{output_dir.name}-", dir=output_dir.parent))
    try:
        payloads = {"cities.json": cities, "states.geojson": states, "unresolved.json": unresolved}
        for name, payload in payloads.items():
            (temp_dir / name).write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        if output_dir.exists():
            shutil.rmtree(output_dir)
        temp_dir.replace(output_dir)
    finally:
        if temp_dir.exists():
            shutil.rmtree(temp_dir)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--facts", type=Path, default=Path("public/data/formularios-respondidos/facts.json"))
    parser.add_argument("--output", type=Path, default=Path("public/data/geography"))
    args = parser.parse_args()
    cities, states, unresolved = build_geography(args.facts.resolve())
    write_atomically(args.output.resolve(), cities, states, unresolved)
    print(f"OK: {len(cities)} cidades localizadas; {len(unresolved)} pendências.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
