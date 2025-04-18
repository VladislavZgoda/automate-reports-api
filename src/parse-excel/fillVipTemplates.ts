import { randomUUID } from "crypto";
import exceljs from "exceljs";
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { todayDate } from "src/utils/dateFunc.ts";
import { handleActivePower, handleDate } from "src/utils/excelHelpFunc.ts";

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
  parsePiramidaFile(wsPiramidaFile, meters);

  const saveVipFolderPath = `parsed-excel/vip${randomUUID()}`;
  await mkdir(saveVipFolderPath);

  await fillTemplates(meters, saveVipFolderPath);

  return saveVipFolderPath;
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

function parsePiramidaFile(
  ws: exceljs.Worksheet,
  meters: Record<MeterSerialNumber, MetersData>,
) {
  const date = ws.getCell("K6").text;

  // Без +2 не будет двух последних линий
  for (let i = 7; i < ws.actualRowCount + 2; i++) {
    const reading = Number(ws.getCell("K" + i).text);

    if (!isNaN(reading)) {
      meters[ws.getCell("E" + i).text] = {
        reading,
        date,
      };
    }
  }
}

async function fillTemplates(
  meters: Record<MeterSerialNumber, MetersData>,
  saveVipFolderPath: string,
) {
  const templatesFolderPath = "xlsx-templates/vip";

  const templateFilesPaths = (await readdir(templatesFolderPath)).map(
    (fileName) => {
      return path.join(templatesFolderPath, fileName);
    },
  );

  for (const path of templateFilesPaths)
    await fillTemplate(meters, path, saveVipFolderPath);
}

async function fillTemplate(
  meters: Record<MeterSerialNumber, MetersData>,
  templateFilePath: string,
  saveVipFolderPath: string,
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

  const saveFolderPath = `${saveVipFolderPath}/${fileName}`;
  await wb.xlsx.writeFile(saveFolderPath);
}
