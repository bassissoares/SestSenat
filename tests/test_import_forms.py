import csv
import json
import tempfile
import unittest
from pathlib import Path

from scripts.import_forms import HEADERS, ImportValidationError, import_snapshot


VALID_ROWS = [
    [
        "2025",
        "1",
        "9",
        "Prevenção de Acidentes [9]",
        "CRCO",
        "B 63 [CRCO-TO]",
        "[IdUnidade=46], [Unidade=B 63 - PALMAS/TO], [Situação=Ativo], [Conselho=CRCO], [UF=TO]",
        "3047",
        "RESPONSÁVEL TESTE",
        "329",
    ],
    [
        "2026",
        "2",
        "10",
        "Formulário Teste [10]",
        "CRMG",
        "B 31 [CRMG-MG]",
        "[IdUnidade=32], [Unidade=B 31 - DIVINÓPOLIS/MG], [Situação=Inativo], [Conselho=CRMG], [UF=MG]",
        "1803",
        "OUTRO RESPONSÁVEL",
        "16",
    ],
]


class ImportFormsTests(unittest.TestCase):
    def write_csv(self, directory: Path, rows: list[list[str]], header: bool = False) -> Path:
        path = directory / "snapshot.csv"
        with path.open("w", encoding="utf-8-sig", newline="") as target:
            writer = csv.writer(target)
            if header:
                writer.writerow(HEADERS)
            writer.writerows(rows)
        return path

    def test_imports_headerless_snapshot_and_reconciles_totals(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            result = import_snapshot(self.write_csv(root, VALID_ROWS), root / "public")
            self.assertEqual(result.total, 345)
            self.assertEqual(result.years, (2025, 2026))
            facts = json.loads((root / "public/facts.json").read_text(encoding="utf-8"))
            self.assertNotIn("responsibleId", facts[0])
            self.assertEqual(facts[0]["city"], "PALMAS")

    def test_accepts_canonical_header(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            result = import_snapshot(self.write_csv(root, VALID_ROWS, header=True), root / "public")
            manifest = json.loads((root / "public/manifest.json").read_text(encoding="utf-8"))
            self.assertTrue(manifest["hadHeader"])
            self.assertEqual(result.published_rows, 2)

    def test_rejects_invalid_month_without_replacing_previous_output(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            output = root / "public"
            output.mkdir()
            previous = output / "manifest.json"
            previous.write_text('{"datasetVersion":"previous"}', encoding="utf-8")
            invalid = [row.copy() for row in VALID_ROWS]
            invalid[0][1] = "13"
            with self.assertRaises(ImportValidationError):
                import_snapshot(self.write_csv(root, invalid), output)
            self.assertEqual(previous.read_text(encoding="utf-8"), '{"datasetVersion":"previous"}')

    def test_rejects_duplicate_group(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            with self.assertRaises(ImportValidationError):
                import_snapshot(self.write_csv(root, [VALID_ROWS[0], VALID_ROWS[0]]), root / "public")


if __name__ == "__main__":
    unittest.main()

