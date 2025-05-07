import exceljs from "exceljs";
import { findInsertIndex } from "src/utils/binarySearch.ts";

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
