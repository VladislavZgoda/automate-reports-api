import { randomUUID } from "crypto";
import exceljs from "exceljs";
import { todayDate } from "src/utils/dateFunc.ts";
import { handleActivePower, handleDate } from "src/utils/excelHelpFunc.ts";

type MeterSerialNumber = string;

interface MetersData {
  t1: number;
  t2: number;
  t: number;
  date: string;
}

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
    `xlsx-templates/${process.env.ODPY_TEMPLATE}`,
  );

  const wsTemplate = wbTemplate.worksheets[0];
  const meters: Record<MeterSerialNumber, MetersData> = {};

  parsePiramidaOdpy(wsPiramida, meters);
  parseMatritcaOdpy(wsMatritca, meters);

  wsTemplate.removeConditionalFormatting("");
  fillTemplate(wsTemplate, meters);

  const saveFilePath = `parsed-excel/supplement_nine${randomUUID()}.xlsx`;
  await wbTemplate.xlsx.writeFile(saveFilePath);

  return saveFilePath;
}

function parsePiramidaOdpy(
  ws: exceljs.Worksheet,
  meters: Record<MeterSerialNumber, MetersData>,
) {
  for (let i = 6; i < ws.actualRowCount + 1; i++) {
    if (ws.getCell("P" + i).value) {
      meters[ws.getCell("C" + i).text] = {
        t1: Number(ws.getCell("Q" + i).value),
        t2: Number(ws.getCell("R" + i).value),
        t: Number(ws.getCell("P" + i).value),
        date: ws.getCell("P4").text,
      };
    } else if (ws.getCell("L" + i).value) {
      meters[ws.getCell("C" + i).text] = {
        t1: Number(ws.getCell("M" + i).value),
        t2: Number(ws.getCell("N" + i).value),
        t: Number(ws.getCell("L" + i).value),
        date: ws.getCell("L4").text,
      };
    } else if (ws.getCell("H" + i).value) {
      meters[ws.getCell("C" + i).text] = {
        t1: Number(ws.getCell("I" + i).value),
        t2: Number(ws.getCell("J" + i).value),
        t: Number(ws.getCell("H" + i).value),
        date: ws.getCell("H4").text,
      };
    } else if (ws.getCell("D" + i).value) {
      meters[ws.getCell("C" + i).text] = {
        t1: Number(ws.getCell("E" + i).value),
        t2: Number(ws.getCell("F" + i).value),
        t: Number(ws.getCell("D" + i).value),
        date: ws.getCell("D4").text,
      };
    }
  }
}

function parseMatritcaOdpy(
  ws: exceljs.Worksheet,
  meters: Record<MeterSerialNumber, MetersData>,
) {
  for (let i = 2; i < ws.actualRowCount; i++) {
    const meteringPointName = ws
      .getCell("J" + i)
      .text.trim()
      .toUpperCase();

    console.log(meteringPointName);

    if (meteringPointName === "ОДПУ") {
      let serialNumber = ws.getCell("C" + i).text.trim();
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

function fillTemplate(
  ws: exceljs.Worksheet,
  meters: Record<MeterSerialNumber, MetersData>,
) {
  const askueDate = todayDate();

  for (let i = 3; i < ws.actualRowCount + 1; i++) {
    const serialNumber = ws.getCell("C" + i).text.trim();

    if (Object.hasOwn(meters, serialNumber)) {
      handleDate(ws, `D${i}`, meters[serialNumber].date);
      handleActivePower(ws, `E${i}`, meters[serialNumber].t1);
      handleActivePower(ws, `F${i}`, meters[serialNumber].t2);
      handleActivePower(ws, `H${i}`, meters[serialNumber].t);
      handleDate(ws, `K${i}`, askueDate);
    }
  }
}
