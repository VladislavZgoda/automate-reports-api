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

interface MetersData {
  reading: number;
  date: string;
}

export function parseReportNewReadings(
  ws: exceljs.Worksheet,
  meters: Record<string, MetersData>,
) {
  const date = ws.getCell("K6").text;

  // Без +2 не будет двух последних линий
  for (let i = 7; i < ws.actualRowCount + 2; i++) {
    const reading = Number(ws.getCell("K" + i).text);

    if (!isNaN(reading)) {
      meters[ws.getCell("E" + i).text] = {
        reading,
        date,
      };
    }
  }
}
