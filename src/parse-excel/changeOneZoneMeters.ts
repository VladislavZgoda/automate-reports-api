import exceljs from "exceljs";
import { meterInArray } from "src/utils/binarySearch.ts";

export default function changeOneZoneMeters(
  wb: exceljs.Workbook,
  oneZoneMeters: readonly number[],
) {
  const ws = wb.worksheets[0];

  for (let i = 3; i < ws.actualRowCount; i++) {
    const meter = Number(ws.getCell("C" + i).text.trim());

    if (!isNaN(meter) && meterInArray(oneZoneMeters, meter)) {
      if (checkDifference(ws, i)) changeReadings(ws, i);
    }
  }
}

function checkDifference(ws: exceljs.Worksheet, rowNumber: number) {
  const activeEnergySum = Number(ws.getCell("H" + rowNumber).text.trim());
  const activeEnergyT1 = Number(ws.getCell("E" + rowNumber).text.trim());
  const activeEnergyT2 = Number(ws.getCell("F" + rowNumber).text.trim());

  const difference = activeEnergySum - (activeEnergyT1 + activeEnergyT2);

  if (Math.abs(difference) > 1) return true;

  return false;
}

function changeReadings(ws: exceljs.Worksheet, rowNumber: number) {
  const activeEnergySum = ws.getCell("H" + rowNumber).value;

  ws.getCell("E" + rowNumber).value = activeEnergySum; // Active Energy T1
  ws.getCell("F" + rowNumber).value = 0; // Active Energy T2
}
