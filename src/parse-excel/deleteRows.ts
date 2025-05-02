import exceljs from "exceljs";

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
      console.log("device");
      ws.spliceRows(i, 1);
    } else if (!contractNumber?.startsWith("230700")) {
      console.log("contarct");
      ws.spliceRows(i, 1);
    } else if (meteringPointName === "ОДПУ") {
      console.log("name");
      ws.spliceRows(i, 1);
    } else if (meterInArray(uselessMeters, meter)) {
      console.log("arr");
      ws.spliceRows(i, 1);
    } else {
      i += 1;
    }
  }
}

function meterInArray(arr: number[], meter: number) {
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
