import { randomUUID } from "crypto";
import exceljs from "exceljs";
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
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

  const meters: Record<MeterSerialNumber, MetersData> = {};

  parseReportNewReadings(wsMeterReadings, meters);
  parseCurrentMeterReadings(wsCurrentMeterReadings, meters);

  const saveLegalDirPath = `parsed-excel/legal${randomUUID()}`;
  await mkdir(saveLegalDirPath);

  await fillTemplates(meters, saveLegalDirPath);

  return saveLegalDirPath;
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

async function fillTemplates(
  meters: Record<MeterSerialNumber, MetersData>,
  saveDirPath: string,
) {
  const templatesDirPath = "xlsx-templates/legal";

  const templateFilesPaths = (await readdir(templatesDirPath)).map(
    (fileName) => {
      return path.join(templatesDirPath, fileName);
    },
  );

  for (const path of templateFilesPaths)
    await fillTemplate(meters, path, saveDirPath);
}

async function fillTemplate(
  meters: Record<MeterSerialNumber, MetersData>,
  templateFilePath: string,
  saveDirPath: string,
) {
  const excel = new exceljs.Workbook();

  const wb = await excel.xlsx.readFile(templateFilePath);
  const ws = wb.worksheets[0];

  ws.removeConditionalFormatting("");

  const askueDate = todayDate();

  for (let i = 3; i < ws.actualRowCount + 1; i++) {
    const serialNumber = ws.getCell("C" + i).text.trim();

    if (Object.hasOwn(meters, serialNumber)) {
      handleDate(ws, `D${i}`, meters[serialNumber].date);
      handleActivePower(ws, `H${i}`, meters[serialNumber].reading);
      handleDate(ws, `K${i}`, askueDate);
    }
  }

  const fileName = templateFilePath.slice(21);

  const saveFilePath = `${saveDirPath}/${fileName}`;
  await wb.xlsx.writeFile(saveFilePath);
}
