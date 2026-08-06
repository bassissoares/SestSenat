export type CityPoint = {
  municipalityId: string;
  city: string;
  normalizedCity: string;
  state: string;
  latitude: number;
  longitude: number;
  positionType: string;
};

export type StateFeatureProperties = { codarea: string; state?: string; name?: string };
export type StateFeatureCollection = GeoJSON.FeatureCollection<GeoJSON.Geometry, StateFeatureProperties>;
export type GeographyData = { cities: CityPoint[]; states: StateFeatureCollection };
