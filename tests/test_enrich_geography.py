import unittest

from scripts.enrich_geography import geometry_center, normalized_name


class EnrichGeographyTests(unittest.TestCase):
    def test_normalizes_accents_for_ibge_matching(self):
        self.assertEqual(normalized_name("São José d’Oeste"), "SAO JOSE D'OESTE")

    def test_calculates_center_from_nested_polygon(self):
        latitude, longitude = geometry_center(
            {"type": "Polygon", "coordinates": [[[-50, -10], [-40, -10], [-40, -20], [-50, -20]]]}
        )
        self.assertEqual(latitude, -15)
        self.assertEqual(longitude, -45)


if __name__ == "__main__":
    unittest.main()
