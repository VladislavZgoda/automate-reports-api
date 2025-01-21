import exceljs from "exceljs";
import type { Borders } from "exceljs";
import { randomUUID } from "crypto";
import type { Alignment } from "./types.ts";

export default async function createReadingSheet(filePath: string) {
  const excel = new exceljs.Workbook();
  const wb = await excel.xlsx.readFile(filePath);
  const ws = wb.worksheets[0];

  const border: Partial<Borders> = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  const alignmentCenter: Alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  ws.unMergeCells("A1:N1");
  ws.spliceColumns(11, 4);

  processKLColumns(ws, border, alignmentCenter);

  const saveFilePath = `parsed-excel/АСКУЭ Быт${randomUUID()}.xlsx`;
  await wb.xlsx.writeFile(saveFilePath);

  return saveFilePath;
}

function processKLColumns(
  ws: exceljs.Worksheet,
  border: Partial<exceljs.Borders>,
  alignment: Alignment,
) {
  for (let i = 3; i < ws.actualRowCount + 1; i++) {
    const cellK = ws.getCell("K" + i);
    const cellL = ws.getCell("L" + i);

    cellK.border = border;
    cellL.value = "Згода В.Г.";
    cellL.border = border;
    cellL.alignment = alignment;
    cellL.font = {
      name: "Times New Roman",
      size: 10,
    };
  }
}
