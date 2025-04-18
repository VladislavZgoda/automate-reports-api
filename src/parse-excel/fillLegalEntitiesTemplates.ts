import { randomUUID } from "crypto";
import exceljs from "exceljs";
import { todayDate } from "src/utils/dateFunc.ts";

import {
  handleActivePower,
  handleDate,
  parseReportNewReadings,
} from "src/utils/excelHelpFunc.ts";

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

  const wbLegalEntitesTemplate = await excel.xlsx.readFile(
    `xlsx-templates/${process.env.LEGAL_ENTITIES_TEMPLATE}`,
  );

  const wsLegalEntitesTemplate = wbLegalEntitesTemplate.worksheets[0];

  // Без второго экземпляра writeFile записывает файлы как последний
  // прочитанный. Из-за этого получается одно и тоже под разными именами.
  const excel2 = new exceljs.Workbook();

  const wb230710001128 = await excel2.xlsx.readFile(
    `xlsx-templates/${process.env.TEMPLATE_230710001128}`,
  );

  const ws230710001128 = wb230710001128.worksheets[0];

  const meters: Record<MeterSerialNumber, MetersData> = {};

  parseReportNewReadings(wsMeterReadings, meters);
  parseCurrentMeterReadings(wsCurrentMeterReadings, meters);

  wsLegalEntitesTemplate.removeConditionalFormatting("");
  fillTemplate(wsLegalEntitesTemplate, meters);

  ws230710001128.removeConditionalFormatting("");
  fillTemplate(ws230710001128, meters);

  const saveLegalEntitesPath = `parsed-excel/supplement_nine${randomUUID()}.xlsx`;
  await wbLegalEntitesTemplate.xlsx.writeFile(saveLegalEntitesPath);

  const save230710001128Path = `parsed-excel/230710001128${randomUUID()}.xlsx`;
  await wb230710001128.xlsx.writeFile(save230710001128Path);

  return {
    legalEntities: saveLegalEntitesPath,
    "230710001128": save230710001128Path,
  };
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
