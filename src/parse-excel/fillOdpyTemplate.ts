import exceljs from "exceljs";
import { todayDate } from "src/utils/dateFunc.ts";

type Meters = {
  [serialNumber: string]: {
    t1: number;
    t2: number;
    t: number;
    date: string;
  };
};

export default async function fillOdpyTemplate(
  matritcaPath: string,
  piramidaPath: string,
) {
  const excel = new exceljs.Workbook();

  const wbMatritca = await excel.xlsx.readFile(matritcaPath);
  const wsMatritca = wbMatritca.worksheets[0];

  const wbPiramida = await excel.xlsx.readFile(piramidaPath);
  const wsPiramida = wbPiramida.worksheets[0];

  const wbTemplate = await excel.xlsx.readFile(
    "xlsx-templates/odpy_reading_sheet.xlsx",
  );
  const wsTemplate = wbTemplate.worksheets[0];

  const meters: Meters = {};
  parsePiramidaOdpy(wsPiramida, meters);
  parseMatritcaOdpy(wsMatritca, meters);

  wsTemplate.removeConditionalFormatting("");
  fillTemplate(wsTemplate, meters);

  await wbTemplate.xlsx.writeFile(`parsed-excel/test.xlsx`);
}

function parsePiramidaOdpy(ws: exceljs.Worksheet, meters: Meters) {
  for (let i = 6; i < ws.actualRowCount + 1; i++) {
    if (ws.getCell("P" + i).value) {
      meters[String(ws.getCell("C" + i).value)] = {
        t1: Number(ws.getCell("Q" + i).value),
        t2: Number(ws.getCell("R" + i).value),
        t: Number(ws.getCell("P" + i).value),
        date: String(ws.getCell("P4").value),
      };
    } else if (ws.getCell("L" + i).value) {
      meters[String(ws.getCell("C" + i).value)] = {
        t1: Number(ws.getCell("M" + i).value),
        t2: Number(ws.getCell("N" + i).value),
        t: Number(ws.getCell("L" + i).value),
        date: String(ws.getCell("L4").value),
      };
    } else if (ws.getCell("H" + i).value) {
      meters[String(ws.getCell("C" + i).value)] = {
        t1: Number(ws.getCell("I" + i).value),
        t2: Number(ws.getCell("J" + i).value),
        t: Number(ws.getCell("H" + i).value),
        date: String(ws.getCell("H4").value),
      };
    } else if (ws.getCell("D" + i).value) {
      meters[String(ws.getCell("C" + i).value)] = {
        t1: Number(ws.getCell("E" + i).value),
        t2: Number(ws.getCell("F" + i).value),
        t: Number(ws.getCell("D" + i).value),
        date: String(ws.getCell("D4").value),
      };
    }
  }
}

function parseMatritcaOdpy(ws: exceljs.Worksheet, meters: Meters) {
  for (let i = 2; i < ws.actualRowCount + 1; i++) {
    const meteringPointName = String(ws.getCell("J" + i).value)
      .trim()
      .toUpperCase();

    if (meteringPointName === "ОДПУ") {
      let serialNumber = String(ws.getCell("C" + i).value).trim();
      if (serialNumber.length === 7) serialNumber = "0" + serialNumber;

      const date = ws.getCell("D" + i).value as Date;
      const localDateFormat = new Date(date).toLocaleDateString("ru");

      meters[serialNumber] = {
        t1: Number(ws.getCell("E" + i).value),
        t2: Number(ws.getCell("F" + i).value),
        t: Number(ws.getCell("H" + i).value),
        date: localDateFormat,
      };
    }
  }
}

function fillTemplate(ws: exceljs.Worksheet, meters: Meters) {
  const askueDate = todayDate();

  for (let i = 3; i < ws.actualRowCount + 1; i++) {
    const serialNumber = String(ws.getCell("C" + i).value).trim();

    if (Object.hasOwn(meters, serialNumber)) {
      ws.getCell("D" + i).value = meters[serialNumber].date;
      handleActivePower(ws, `E${i}`, meters[serialNumber].t1);
      handleActivePower(ws, `F${i}`, meters[serialNumber].t2);
      handleActivePower(ws, `H${i}`, meters[serialNumber].t);
      ws.getCell("K" + i).value = askueDate;
    }
  }
}

function handleActivePower(ws: exceljs.Worksheet, cell: string, value: number) {
  const currentCell = ws.getCell(cell);
  currentCell.numFmt = "@";
  currentCell.value = value.toFixed(2);
}
