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

export default async function fillVipTemplates(
  simsFilePath: string,
  piramidaFilePath: string,
) {
  const excel = new exceljs.Workbook();

  const wbSimsFile = await excel.xlsx.readFile(simsFilePath);
  const wsSimsFile = wbSimsFile.worksheets[0];

  const wbPiramidaFile = await excel.xlsx.readFile(piramidaFilePath);
  const wsPiramidaFile = wbPiramidaFile.worksheets[0];

  const meters: Record<MeterSerialNumber, MetersData> = {};

  parseSimsFile(wsSimsFile, meters);
  parseReportNewReadings(wsPiramidaFile, meters);

  const saveVipDirPath = `parsed-excel/vip${randomUUID()}`;
  await mkdir(saveVipDirPath);

  await fillTemplates(meters, saveVipDirPath);

  return saveVipDirPath;
}

function parseSimsFile(
  ws: exceljs.Worksheet,
  meters: Record<MeterSerialNumber, MetersData>,
) {
  for (let i = 3; i < ws.actualRowCount; i++) {
    const contractNumber = ws.getCell("B" + i).text.trim();

    if (
      contractNumber &&
      !contractNumber.startsWith("230700") &&
      !contractNumber.startsWith("230710")
    ) {
      let serialNumber = ws.getCell("C" + i).text.trim();
      if (serialNumber.length === 7) serialNumber = "0" + serialNumber;

      const date = ws.getCell("D" + i).value as Date;
      const localDateFormat = new Date(date).toLocaleDateString("ru");

      meters[serialNumber] = {
        reading: Number(ws.getCell("H" + i).value),
        date: localDateFormat,
      };
    }
  }
}

async function fillTemplates(
  meters: Record<MeterSerialNumber, MetersData>,
  saveVipDirPath: string,
) {
  const templatesDirPath = "xlsx-templates/vip";

  const templateFilesPaths = (await readdir(templatesDirPath)).map(
    (fileName) => {
      return path.join(templatesDirPath, fileName);
    },
  );

  for (const path of templateFilesPaths)
    await fillTemplate(meters, path, saveVipDirPath);
}

async function fillTemplate(
  meters: Record<MeterSerialNumber, MetersData>,
  templateFilePath: string,
  saveVipDirPath: string,
) {
  const excel = new exceljs.Workbook();

  const wb = await excel.xlsx.readFile(templateFilePath);
  const ws = wb.worksheets[0];

  const askueDate = todayDate();

  for (let i = 3; i < ws.actualRowCount + 1; i++) {
    const serialNumber = ws.getCell("C" + i).text.trim();

    if (Object.hasOwn(meters, serialNumber)) {
      handleDate(ws, `D${i}`, meters[serialNumber].date);
      handleActivePower(ws, `H${i}`, meters[serialNumber].reading);
      handleDate(ws, `K${i}`, askueDate);
    }
  }

  const fileName = templateFilePath.slice(19);

  const saveFolderPath = `${saveVipDirPath}/${fileName}`;
  await wb.xlsx.writeFile(saveFolderPath);
}
