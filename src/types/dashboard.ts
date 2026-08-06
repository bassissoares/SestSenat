export type Fact = {
  year: number;
  month: number;
  formId: number;
  formName: string;
  council: string;
  unitSummary: string;
  unitType: string;
  unitId: number | null;
  unitName: string | null;
  unitStatus: string | null;
  city: string | null;
  state: string | null;
  geoStatus: string;
  responsibleName: string;
  quantity: number;
};

export type Manifest = {
  schemaVersion: string;
  datasetVersion: string;
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
  publishedRows: number;
  warnings: number;
  totalAnswered: number;
  totalsByYear: Record<string, number>;
};

export type Dimensions = {
  years: number[];
  months: number[];
  forms: Array<{ id: number; name: string }>;
  councils: string[];
  units: string[];
  unitTypes: string[];
  responsibles: string[];
};

export type DashboardData = {
  facts: Fact[];
  manifest: Manifest;
  dimensions: Dimensions;
};

export type FilterKey = "year" | "month" | "formId" | "council" | "state" | "city" | "unitType" | "unitSummary" | "responsibleName";
export type FilterState = Partial<Record<FilterKey, string[]>>;
