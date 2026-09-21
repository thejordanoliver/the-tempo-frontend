export const chunkIntoGridRows = <T,>(items: T[], columns = 2) => {
  const rows: (T | null)[][] = [];

  for (let index = 0; index < items.length; index += columns) {
    const row: (T | null)[] = items.slice(index, index + columns);

    while (row.length < columns) {
      row.push(null);
    }

    rows.push(row);
  }

  return rows;
};
