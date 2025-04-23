import exceljs from "exceljs";
import { todayDate } from "src/utils/dateFunc.ts";
import { handleActivePower, handleDate } from "src/utils/excelHelpFunc.ts";

interface MetersData {
  tI1: number;
  tI2: number;
  tI: number;
  tE1: number;
  tE2: number;
  tE: number;
  date: string;
}

export default async function fillMicrogeneration(
  wbTemplate: exceljs.Workbook,
  uploadedFilePath: string,
) {
  const wsTemplate = wbTemplate.worksheets[0];
  wsTemplate.removeConditionalFormatting("");

  const serialNumbersArr: number[] = [];
  const meters: Record<string, MetersData> = {};

  addSerialNumbers(wsTemplate, serialNumbersArr);
  await parseUploadedFile(uploadedFilePath, meters, serialNumbersArr);
  fillTemplate(wsTemplate, meters);
}

function addSerialNumbers(ws: exceljs.Worksheet, serialNumbersArr: number[]) {
  for (let i = 3; i <= ws.actualRowCount; i++) {
    const cellValue = ws.getCell("C" + i).text.trim();

    if (!cellValue) continue;

    const serialNumber = Number(cellValue);

    if (!isNaN(serialNumber)) serialNumbersArr.push(serialNumber);
  }
}

async function parseUploadedFile(
  filePath: string,
  meters: Record<string, MetersData>,
  serialNumbersArr: number[],
) {
  const excel = new exceljs.Workbook();

  const wb = await excel.xlsx.readFile(filePath);
  const ws = wb.worksheets[0];

  for (let i = 3; i < ws.actualRowCount; i++) {
    const serialNumber = ws.getCell("C" + i).text.trim();

    if (serialNumbersArr.includes(Number(serialNumber))) {
      let serial = serialNumber;
      if (serial.length === 7) serial = "0" + serial;

      const date = ws.getCell("D" + i).value as Date;
      const localDateFormat = new Date(date).toLocaleDateString("ru");

      meters[serial] = {
        tI1: Number(ws.getCell("E" + i).text.trim()),
        tI2: Number(ws.getCell("F" + i).text.trim()),
        tI: Number(ws.getCell("H" + i).text.trim()),
        tE1: Number(ws.getCell("I" + i).text.trim()),
        tE2: Number(ws.getCell("J" + i).text.trim()),
        tE: Number(ws.getCell("L" + i).text.trim()),
        date: localDateFormat,
      };
    }
  }
}

function fillTemplate(
  ws: exceljs.Worksheet,
  meters: Record<string, MetersData>,
) {
  const askueDate = todayDate();

  for (let i = 3; i < ws.actualRowCount + 1; i++) {
    const serialNumber = ws.getCell("C" + i).text.trim();

    if (Object.hasOwn(meters, serialNumber)) {
      handleDate(ws, `D${i}`, meters[serialNumber].date);
      handleActivePower(ws, `E${i}`, meters[serialNumber].tI1);
      handleActivePower(ws, `F${i}`, meters[serialNumber].tI2);
      handleActivePower(ws, `H${i}`, meters[serialNumber].tI);
      handleActivePower(ws, `I${i}`, meters[serialNumber].tE1);
      handleActivePower(ws, `J${i}`, meters[serialNumber].tE2);
      handleActivePower(ws, `L${i}`, meters[serialNumber].tI);
      handleDate(ws, `O${i}`, askueDate);
    }
  }
}
