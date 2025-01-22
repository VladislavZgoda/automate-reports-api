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
  tableHeaders(ws, border, alignmentCenter);

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

function tableHeaders(
  ws: exceljs.Worksheet,
  border: Partial<exceljs.Borders>,
  alignment: Alignment,
) {
  ws.mergeCells("A1:L1");

  const cellK = ws.getCell("K2");
  const cellL = ws.getCell("L2");

  const font = {
    name: "Times New Roman",
    size: 12,
    bold: true,
  };

  cellK.value = "Ведомость_КС";
  cellK.border = border;
  cellK.alignment = alignment;
  cellK.font = font;

  cellL.value = "Контролер";
  cellL.border = border;
  cellL.alignment = alignment;
  cellL.font = font;

  ws.getColumn("K").width = 18;
  ws.getColumn("L").width = 15;
}
