import exceljs from "exceljs";
import { meterInArray } from "src/utils/binarySearch.ts";

export default function deleteRows(
  wb: exceljs.Workbook,
  uselessMeters: number[],
) {
  const ws = wb.worksheets[0];
  let i = 3;

  while (i <= ws.actualRowCount) {
    const contractNumber = ws.getCell("B" + i).text.trim();
    const meter = Number(ws.getCell("C" + i).text.trim());

    const deviceTypeBool = ws
      .getCell("L" + i)
      .text.trim()
      .startsWith("NP");

    const meteringPointName = ws
      .getCell("J" + i)
      .text.trim()
      .toUpperCase();

    if (!deviceTypeBool) {
      ws.spliceRows(i, 1);
    } else if (!contractNumber?.startsWith("230700")) {
      ws.spliceRows(i, 1);
    } else if (meteringPointName === "ОДПУ") {
      ws.spliceRows(i, 1);
    } else if (meterInArray(uselessMeters, meter)) {
      ws.spliceRows(i, 1);
    } else {
      i += 1;
    }
  }
}
