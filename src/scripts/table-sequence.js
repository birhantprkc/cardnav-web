/** Assign a display position while rendering a row; never mutate its business sort keys. */
export function setTableRowSequence(row, position) {
  const cell = row.querySelector(':scope > [data-table-sequence-cell], :scope > .data-table-sequence-cell');
  if (!cell) return;
  const text = position === null ? '' : String(position);
  if (cell.textContent !== text) cell.textContent = text;
}
