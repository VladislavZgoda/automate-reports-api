import exceljs from "exceljs";

export function handleActivePower(
  ws: exceljs.Worksheet,
  cell: string,
  value: number,
) {
  const currentCell = ws.getCell(cell);
  currentCell.numFmt = "@";
  currentCell.value = value.toFixed(2);

  currentCell.alignment = {
    vertical: "middle",
    horizontal: "right",
  };
}

export function handleDate(ws: exceljs.Worksheet, cell: string, value: string) {
  const currentCell = ws.getCell(cell);
  currentCell.value = value;

  currentCell.alignment = {
    vertical: "middle",
    horizontal: "center",
  };
}
