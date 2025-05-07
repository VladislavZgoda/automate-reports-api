import exceljs from "exceljs";

export default async function validateOneZoneMeters(filePath: string) {
  const excel = new exceljs.Workbook();
  const wb = await excel.xlsx.readFile(filePath);
  const ws = wb.worksheets[0];

  // Файл с одним столбцом из s/n счетчиков.
  // Ячейки в формате Текстовый, могут начинаться c 0.

  const cellA1 = ws.getCell("A1").text.trim();

  if (cellA1.length !== 8) return false;
  if (isNaN(Number(cellA1))) return false;

  let columnCheck = true;

  ws.getColumn("A").eachCell((cell) => {
    const value = cell.text.trim();

    if (value) {
      if (value.length !== 8) columnCheck = false;
      if (isNaN(Number(value))) columnCheck = false;
    }
  });

  return columnCheck;
}
