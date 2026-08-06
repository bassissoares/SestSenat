#!/usr/bin/env python3
"""Valida o snapshot CSV e gera dados públicos do módulo de formulários."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import shutil
import sys
import tempfile
from collections import Counter
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable


SCHEMA_VERSION = "1.1.0"
HEADERS = (
    "ano",
    "mes",
    "formulario_id",
    "formulario_nome",
    "conselho",
    "unidade_resumida",
    "unidade_detalhe",
    "responsavel_id",
    "responsavel_nome",
    "quantidade",
)
UNIT_PATTERN = re.compile(
    r"^\[IdUnidade=(?P<id>\d+)\],\s*"
    r"\[Unidade=(?P<name>.*?)\],\s*"
    r"\[Situação=(?P<status>.*?)\],\s*"
    r"\[Conselho=(?P<council>.*?)\],\s*"
    r"\[UF=(?P<state>[A-Z]{2})\]$"
)
CITY_PATTERN = re.compile(r"-\s*(?P<city>.+?)/(?P<state>[A-Z]{2})$")
CITY_WITHOUT_STATE_PATTERN = re.compile(r"-\s*(?P<city>[^-/]+)$")
UNIT_TYPE_PATTERN = re.compile(r"^(?P<type>[A-Za-z]+)\s+\d+\b")


class ImportValidationError(ValueError):
    """Erro bloqueante no contrato do snapshot."""


@dataclass(frozen=True)
class ImportResult:
    input_rows: int
    published_rows: int
    discarded_rows: int
    total: int
    years: tuple[int, ...]
    warnings: tuple[str, ...]
    source_hash: str


def normalized_text(value: str) -> str:
    return " ".join(value.strip().split())


def positive_int(value: str, field: str, line: int) -> int:
    try:
        parsed = int(value.strip())
    except (TypeError, ValueError) as exc:
        raise ImportValidationError(
            f"Linha {line}: {field} deve ser inteiro; recebido {value!r}."
        ) from exc
    if parsed <= 0:
        raise ImportValidationError(
            f"Linha {line}: {field} deve ser maior que zero; recebido {parsed}."
        )
    return parsed


def parse_unit(detail: str) -> dict[str, object | None]:
    normalized = normalized_text(detail)
    if not normalized:
        return {
            "unitId": None,
            "unitName": None,
            "unitStatus": None,
            "city": None,
            "state": None,
            "geoStatus": "missing-detail",
        }

    match = UNIT_PATTERN.match(normalized)
    if not match:
        return {
            "unitId": None,
            "unitName": normalized,
            "unitStatus": None,
            "city": None,
            "state": None,
            "geoStatus": "unparsed-detail",
        }

    groups = match.groupdict()
    city_match = CITY_PATTERN.search(groups["name"])
    city_without_state = CITY_WITHOUT_STATE_PATTERN.search(groups["name"])
    city = (
        city_match.group("city").strip()
        if city_match
        else city_without_state.group("city").strip()
        if city_without_state
        else None
    )
    return {
        "unitId": int(groups["id"]),
        "unitName": groups["name"],
        "unitStatus": groups["status"],
        "city": city,
        "state": city_match.group("state") if city_match else groups["state"],
        "geoStatus": "city-detected" if city else "city-missing",
    }


def parse_unit_type(unit_summary: str) -> str:
    """Extrai o tipo operacional que antecede o número da unidade."""
    match = UNIT_TYPE_PATTERN.match(normalized_text(unit_summary))
    return match.group("type").upper() if match else "Não identificado"


def read_rows(input_path: Path) -> tuple[list[list[str]], bool]:
    with input_path.open("r", encoding="utf-8-sig", newline="") as source:
        sample = source.read(8192)
        source.seek(0)
        try:
            dialect = csv.Sniffer().sniff(sample, delimiters=",;\t")
        except csv.Error:
            dialect = csv.excel
        rows = [row for row in csv.reader(source, dialect) if any(cell.strip() for cell in row)]

    if not rows:
        raise ImportValidationError("O CSV está vazio.")

    has_header = tuple(cell.strip() for cell in rows[0]) == HEADERS
    if has_header:
        rows = rows[1:]
    elif any(cell.strip() in HEADERS for cell in rows[0]):
        raise ImportValidationError(
            "Cabeçalho parcial ou fora de ordem. Use os dez nomes canônicos."
        )
    return rows, has_header


def transform_rows(rows: Iterable[list[str]]) -> tuple[list[dict[str, object]], list[str]]:
    facts: list[dict[str, object]] = []
    warnings: list[str] = []
    keys: set[tuple[object, ...]] = set()

    for line, row in enumerate(rows, start=1):
        if len(row) != len(HEADERS):
            raise ImportValidationError(
                f"Linha {line}: esperadas 10 colunas; recebidas {len(row)}."
            )

        year = positive_int(row[0], "ano", line)
        month = positive_int(row[1], "mes", line)
        if month > 12:
            raise ImportValidationError(f"Linha {line}: mês fora do intervalo 1–12.")

        form_id = positive_int(row[2], "formulario_id", line)
        form_name = normalized_text(row[3])
        council = normalized_text(row[4])
        unit_summary = normalized_text(row[5])
        responsible_id = positive_int(row[7], "responsavel_id", line)
        responsible_name = normalized_text(row[8])
        quantity = positive_int(row[9], "quantidade", line)

        required_texts = {
            "formulario_nome": form_name,
            "conselho": council,
            "unidade_resumida": unit_summary,
            "responsavel_nome": responsible_name,
        }
        empty_fields = [field for field, value in required_texts.items() if not value]
        if empty_fields:
            raise ImportValidationError(
                f"Linha {line}: campos obrigatórios vazios: {', '.join(empty_fields)}."
            )

        unit = parse_unit(row[6])
        if unit["geoStatus"] != "city-detected":
            warnings.append(f"Linha {line}: localização {unit['geoStatus']}.")

        key = (
            year,
            month,
            form_id,
            form_name,
            council,
            unit_summary,
            normalized_text(row[6]),
            responsible_id,
            responsible_name,
        )
        if key in keys:
            raise ImportValidationError(f"Linha {line}: agrupamento duplicado no snapshot.")
        keys.add(key)

        facts.append(
            {
                "year": year,
                "month": month,
                "formId": form_id,
                "formName": form_name,
                "council": council,
                "unitSummary": unit_summary,
                "unitType": parse_unit_type(unit_summary),
                **unit,
                "responsibleName": responsible_name,
                "quantity": quantity,
            }
        )
    return facts, warnings


def unique_sorted(facts: list[dict[str, object]], field: str) -> list[object]:
    return sorted({fact[field] for fact in facts}, key=lambda value: str(value))


def build_outputs(input_path: Path, min_year: int | None = None) -> tuple[dict[str, object], ImportResult]:
    source_bytes = input_path.read_bytes()
    source_hash = hashlib.sha256(source_bytes).hexdigest()
    rows, had_header = read_rows(input_path)
    all_facts, warnings = transform_rows(rows)
    facts = [fact for fact in all_facts if min_year is None or int(fact["year"]) >= min_year]
    discarded_rows = len(all_facts) - len(facts)
    if not facts:
        raise ImportValidationError("Nenhum agrupamento permaneceu após o corte temporal.")
    years = sorted({int(fact["year"]) for fact in facts})
    months = sorted({int(fact["month"]) for fact in facts})
    totals_by_year = Counter()
    total = 0
    for fact in facts:
        quantity = int(fact["quantity"])
        total += quantity
        totals_by_year[int(fact["year"])] += quantity

    generated_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    manifest = {
        "schemaVersion": SCHEMA_VERSION,
        "module": "formularios-respondidos",
        "datasetVersion": source_hash[:16],
        "generatedAt": generated_at,
        "periodStart": min(f"{fact['year']}-{int(fact['month']):02d}" for fact in facts),
        "periodEnd": max(f"{fact['year']}-{int(fact['month']):02d}" for fact in facts),
        "sourceLabel": "Formulários respondidos — InspectApp",
        "sourceSha256": source_hash,
        "inputRows": len(rows),
        "publishedRows": len(facts),
        "discardedRows": discarded_rows,
        "minimumPublishedYear": min_year,
        "warnings": len(warnings),
        "hadHeader": had_header,
        "totalAnswered": total,
        "totalsByYear": {str(year): totals_by_year[year] for year in years},
    }
    dimensions = {
        "years": years,
        "months": months,
        "forms": [
            {"id": form_id, "name": next(f["formName"] for f in facts if f["formId"] == form_id)}
            for form_id in sorted({int(f["formId"]) for f in facts})
        ],
        "councils": unique_sorted(facts, "council"),
        "units": unique_sorted(facts, "unitSummary"),
        "unitTypes": unique_sorted(facts, "unitType"),
        "responsibles": unique_sorted(facts, "responsibleName"),
    }
    quality = {
        "warnings": warnings,
        "warningCount": len(warnings),
        "missingLocationRows": sum(1 for f in facts if f["geoStatus"] == "missing-detail"),
        "unparsedLocationRows": sum(1 for f in facts if f["geoStatus"] == "unparsed-detail"),
        "inactiveUnitRows": sum(1 for f in facts if f["unitStatus"] == "Inativo"),
    }
    return (
        {"manifest.json": manifest, "facts.json": facts, "dimensions.json": dimensions, "quality.json": quality},
        ImportResult(len(rows), len(facts), discarded_rows, total, tuple(years), tuple(warnings), source_hash),
    )


def write_outputs_atomically(outputs: dict[str, object], output_dir: Path) -> None:
    output_dir.parent.mkdir(parents=True, exist_ok=True)
    temp_dir = Path(tempfile.mkdtemp(prefix=f".{output_dir.name}-", dir=output_dir.parent))
    backup_dir = output_dir.with_name(f".{output_dir.name}-backup")
    try:
        for name, payload in outputs.items():
            (temp_dir / name).write_text(
                json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
                encoding="utf-8",
            )
        if backup_dir.exists():
            shutil.rmtree(backup_dir)
        if output_dir.exists():
            output_dir.replace(backup_dir)
        temp_dir.replace(output_dir)
        if backup_dir.exists():
            shutil.rmtree(backup_dir)
    except Exception:
        if output_dir.exists() and backup_dir.exists():
            shutil.rmtree(output_dir)
        if backup_dir.exists():
            backup_dir.replace(output_dir)
        raise
    finally:
        if temp_dir.exists():
            shutil.rmtree(temp_dir)


def import_snapshot(input_path: Path, output_dir: Path, min_year: int | None = None) -> ImportResult:
    if not input_path.is_file():
        raise ImportValidationError(f"Arquivo não encontrado: {input_path}")
    outputs, result = build_outputs(input_path, min_year)
    write_outputs_atomically(outputs, output_dir)
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, type=Path, help="Caminho do CSV completo.")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("public/data/formularios-respondidos"),
        help="Diretório de saída pública.",
    )
    parser.add_argument("--min-year", type=int, help="Descarta agrupamentos anteriores ao ano informado.")
    args = parser.parse_args()
    try:
        result = import_snapshot(args.input.resolve(), args.output.resolve(), args.min_year)
    except ImportValidationError as exc:
        print(f"ERRO: {exc}", file=sys.stderr)
        return 2
    print(
        f"OK: {result.published_rows} agrupamentos, {result.total} respostas, "
        f"anos {', '.join(map(str, result.years))}, {result.discarded_rows} descartados, "
        f"{len(result.warnings)} alertas."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
