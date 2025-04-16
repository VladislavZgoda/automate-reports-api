import { randomUUID } from "crypto";
import exceljs from "exceljs";
import { todayDate } from "src/utils/dateFunc.ts";
import { handleActivePower, handleDate } from "src/utils/excelHelpFunc.ts";

type MeterSerialNumber = string;

interface MetersData {
  reading: number;
  date: string;
}

export default async function fillLegalEntitiesTemplates(
  meterReadingsPath: string,
  currentMeterReadingsPath: string,
) {
  const excel = new exceljs.Workbook();

  const wbMeterReadings = await excel.xlsx.readFile(meterReadingsPath);
  const wsMeterReadings = wbMeterReadings.worksheets[0];

  const wbCurrentMeterReadings = await excel.xlsx.readFile(
    currentMeterReadingsPath,
  );
  const wsCurrentMeterReadings = wbCurrentMeterReadings.worksheets[0];

  const wbTemplate = await excel.xlsx.readFile(
    `xlsx-templates/${process.env.LEGAL_ENTITIES_TEMPLATE}`,
  );

  const wsTemplate = wbTemplate.worksheets[0];
  const meters: Record<MeterSerialNumber, MetersData> = {};

  parseMeterReadings(wsMeterReadings, meters);
  parseCurrentMeterReadings(wsCurrentMeterReadings, meters);

  wsTemplate.removeConditionalFormatting("");
  fillTemplate(wsTemplate, meters);

  const saveFilePath = `parsed-excel/supplement_nine${randomUUID()}.xlsx`;
  await wbTemplate.xlsx.writeFile(saveFilePath);

  return saveFilePath;
}

function parseMeterReadings(
  ws: exceljs.Worksheet,
  meters: Record<MeterSerialNumber, MetersData>,
) {
  const date = ws.getCell("K6").text;

  // Без +2 не будет двух последних линий
  for (let i = 7; i < ws.actualRowCount + 2; i++) {
    if (ws.getCell("K" + i).text) {
      meters[ws.getCell("E" + i).text] = {
        reading: Number(ws.getCell("K" + i).text),
        date,
      };
    }
  }
}

function parseCurrentMeterReadings(
  ws: exceljs.Worksheet,
  meters: Record<MeterSerialNumber, MetersData>,
) {
  const date = todayDate();

  for (let i = 3; i < ws.actualRowCount + 1; i++) {
    const regex = /\d{8}/g;
    const serialNumberCellValue = ws.getCell("A" + i).text;
    const serialNumber = serialNumberCellValue.match(regex);

    if (!serialNumber?.length) continue;

    const meterReading = Number(ws.getCell("C" + i).text);

    if (!meterReading) continue;

    meters[serialNumber[0]] = {
      reading: meterReading,
      date,
    };
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
      handleActivePower(ws, `H${i}`, meters[serialNumber].reading);
      handleDate(ws, `K${i}`, askueDate);
    }
  }
}
