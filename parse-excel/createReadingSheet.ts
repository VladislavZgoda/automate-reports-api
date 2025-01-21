import exceljs from "exceljs";
import { randomUUID } from "crypto";

export default async function createReadingSheet(filePath: string) {
  const excel = new exceljs.Workbook();
  const wb = await excel.xlsx.readFile(filePath);
  const ws = wb.worksheets[0];

  ws.unMergeCells("A1:N1");
  ws.spliceColumns(11, 4);

  const saveFilePath = `parsed-excel/АСКУЭ Быт${randomUUID()}.xlsx`;
  await wb.xlsx.writeFile(saveFilePath);

  return saveFilePath;
}
