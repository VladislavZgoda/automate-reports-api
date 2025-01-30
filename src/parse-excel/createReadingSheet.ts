import exceljs from "exceljs";
import type { Borders } from "exceljs";
import { randomUUID } from "crypto";
import type { Alignment } from "./types.ts";

export default async function createReadingSheet(
  filePath: string,
  controller: string,
) {
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

  processKLColumns(ws, border, alignmentCenter, controller);
  tableHeaders(ws, border, alignmentCenter);
  tableFooter(ws);
  adjustPageSetup(ws);

  const saveFilePath = `parsed-excel/АСКУЭ Быт${randomUUID()}.xlsx`;
  await wb.xlsx.writeFile(saveFilePath);

  return saveFilePath;
}

function processKLColumns(
  ws: exceljs.Worksheet,
  border: Partial<exceljs.Borders>,
  alignment: Alignment,
  controller: string,
) {
  for (let i = 3; i < ws.actualRowCount + 1; i++) {
    const cellK = ws.getCell("K" + i);
    const cellL = ws.getCell("L" + i);

    cellK.border = border;
    cellL.value = controller;
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

function tableFooter(ws: exceljs.Worksheet) {
  const alignmentLeft: Alignment = {
    vertical: "middle",
    horizontal: "left",
  };

  const firstRow = ws.actualRowCount + 2;
  ws.mergeCells(`A${firstRow}:C${firstRow}`);
  ws.mergeCells(`F${firstRow}:H${firstRow}`);
  const aCellFirstRow = ws.getCell(`A${firstRow}`);
  const fCellFirstRow = ws.getCell(`F${firstRow}`);
  aCellFirstRow.value = "начальник ОТЭЭ";
  aCellFirstRow.alignment = alignmentLeft;
  fCellFirstRow.value = "ФИО";
  fCellFirstRow.alignment = alignmentLeft;

  const secondRow = ws.actualRowCount + 2;
  ws.mergeCells(`A${secondRow}:D${secondRow}`);
  const aCellSecondRow = ws.getCell(`A${secondRow}`);
  aCellSecondRow.value = 'филиала АО "Электросети-Кубани';
  aCellSecondRow.alignment = alignmentLeft;

  const thirdRow = ws.actualRowCount + 2;
  ws.mergeCells(`A${thirdRow}:D${thirdRow}`);
  ws.mergeCells(`F${thirdRow}:H${thirdRow}`);
  const aCellThirdRow = ws.getCell(`A${thirdRow}`);
  const gCellThirdRow = ws.getCell(`G${thirdRow}`);
  aCellThirdRow.value = "Тимашевскэлектросеть";
  aCellThirdRow.alignment = alignmentLeft;
  gCellThirdRow.value = "сдал__________________";
  gCellThirdRow.alignment = alignmentLeft;

  const fourthRow = ws.actualRowCount + 2;
  ws.mergeCells(`F${fourthRow}:H${fourthRow}`);
  const gCellFourthRow = ws.getCell(`G${fourthRow}`);
  gCellFourthRow.value = "принял________________";
  gCellFourthRow.alignment = alignmentLeft;
}

function adjustPageSetup(ws: exceljs.Worksheet) {
  ws.pageSetup.printArea = `A1:L${ws.actualRowCount + 1}`;
  ws.pageSetup.printTitlesRow = undefined;
  ws.pageSetup.orientation = "landscape";
  if (ws.headerFooter) ws.headerFooter.oddFooter = undefined;
  ws.pageSetup.fitToPage = true;
  ws.pageSetup.fitToWidth = 1;
  ws.pageSetup.fitToHeight = 0;
}
