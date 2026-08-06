#!/usr/bin/env python3
"""Impõe limites simples ao artefato estático antes da publicação."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
LIMITS = {".js": 1_000_000, ".css": 150_000, ".json": 6_000_000, ".geojson": 6_000_000}

def main() -> int:
    if not (DIST / "index.html").is_file():
        raise SystemExit("Build ausente: dist/index.html não encontrado.")
    violations = []
    for path in DIST.rglob("*"):
        if path.is_file() and path.suffix in LIMITS and path.stat().st_size > LIMITS[path.suffix]:
            violations.append(f"{path.relative_to(DIST)}: {path.stat().st_size} bytes")
    if violations:
        raise SystemExit("Arquivos acima do limite:\n" + "\n".join(violations))
    print("Limites do artefato: OK")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
