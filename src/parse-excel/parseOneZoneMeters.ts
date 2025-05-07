import exceljs from "exceljs";

export default async function parseOneZoneMeters(
  filePath: string,
  oneZoneMeters: number[],
) {
  const excel = new exceljs.Workbook();
  const wb = await excel.xlsx.readFile(filePath);
  const ws = wb.worksheets[0];

  ws.getColumn("A").eachCell((cell) => {
    const value = cell.text.trim();

    if (value) {
      const serialNumber = Number(value);
      const insertIndex = findInsertIndex(oneZoneMeters, serialNumber);

      oneZoneMeters.splice(insertIndex, 0, serialNumber);
    }
  });
}

function findInsertIndex(arr: readonly number[], elem: number) {
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
