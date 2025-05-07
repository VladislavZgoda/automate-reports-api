import exceljs from "exceljs";

export default function changeOneZoneMeters(
  wb: exceljs.Workbook,
  oneZoneMeters: readonly number[],
) {
  const ws = wb.worksheets[0];

  ws.getColumn("C").eachCell((cell, rowNumber) => {
    const meter = Number(cell.text.trim());

    if (!isNaN(meter) && meterInArray(oneZoneMeters, meter)) {
      if (checkDifference(ws, rowNumber)) changeReadings(ws, rowNumber);
    }
  });
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

function meterInArray(arr: readonly number[], meter: number) {
  const length = arr.length;
  let start = 0;
  let end = length - 1;

  while (start <= end) {
    const mid = Number.parseInt(((start + end) / 2).toString());
    const meterAtMid = arr[mid];

    if (meter === meterAtMid) {
      return true;
    } else if (meter < meterAtMid) {
      end = mid - 1;
    } else if (meter > meterAtMid) {
      start = mid + 1;
    }
  }

  return false;
}
