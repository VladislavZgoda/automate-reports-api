import exceljs from "exceljs";

export default async function parseReportNine(
  filePath: string,
  uselessMeters: number[],
) {
  const excel = new exceljs.Workbook();

  const wb = await excel.xlsx.readFile(filePath);
  const ws = wb.worksheets[0];

  for (let i = 3; i < ws.actualRowCount + 1; i++) {
    // В конце файла могут быть объединённые ячейки и ws.actualRowCount будет учитывать их.
    // Из-за этого будет ошибка при попытке чтения содержимого ячейки L.
    if (ws.getCell("L" + i).isMerged) continue;

    const deviceTypeBool = ws
      .getCell("L" + i)
      .text.trim()
      .startsWith("NP");

    if (!deviceTypeBool) continue;

    const contractNumberBool = ws
      .getCell("B" + i)
      .text.trim()
      .startsWith("230700");

    if (!contractNumberBool) continue;

    const day = ws
      .getCell("D" + i)
      .text.trim()
      .slice(0, 2);

    if (Number(day) < 21) continue;

    const serialNumber = Number(ws.getCell("C" + i).text.trim());
    const insertIndex = findInsertIndex(uselessMeters, serialNumber);

    uselessMeters.splice(insertIndex, 0, serialNumber);
  }
}

function findInsertIndex(arr: number[], elem: number) {
  const length = arr.length;
  let start = 0;
  let end = length - 1;

  while (start <= end) {
    const mid = Number.parseInt(((start + end) / 2).toString());

    if (arr[mid] === elem) {
      return mid;
    } else if (arr[mid] < elem) {
      start = mid + 1;
    } else {
      end = mid - 1;
    }
  }

  return end + 1;
}
