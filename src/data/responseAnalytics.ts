export type ResponsePeriodicity = 1 | 2 | 3 | 6 | 12;

export const responsePeriod = (row: number[]) =>
  `${row[0]}-${String(row[1]).padStart(2, "0")}`;

export function responseBlock(row: number[], size: ResponsePeriodicity) {
  const startMonth = Math.floor((row[1] - 1) / size) * size + 1;
  const endMonth = startMonth + size - 1;
  const start = `${row[0]}-${String(startMonth).padStart(2, "0")}`;
  const end = `${row[0]}-${String(endMonth).padStart(2, "0")}`;
  return { key: start, label: size === 1 ? start : `${start} a ${end}` };
}

export function sumRows(rows: number[][], quantityIndex: number) {
  return rows.reduce((sum, row) => sum + row[quantityIndex], 0);
}

export function percentage(value: number, base: number) {
  return base > 0 ? (value / base) * 100 : 0;
}

export function previousMean(values: number[]) {
  return values.length > 1
    ? values.slice(0, -1).reduce((sum, value) => sum + value, 0) /
        (values.length - 1)
    : null;
}

export function percentagePointChange(
  current: number,
  previous: number | null,
) {
  return previous === null ? null : current - previous;
}
