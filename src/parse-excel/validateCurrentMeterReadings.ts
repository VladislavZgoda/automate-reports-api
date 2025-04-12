import exceljs from "exceljs";

export default async function validateCurrentMeterReadings(filePath: string) {
  const excel = new exceljs.Workbook();
  const wb = await excel.xlsx.readFile(filePath);
  const ws = wb.worksheets[0];

  if (!checkHeaders(ws)) return false;

  return true;
}

function checkHeaders(ws: exceljs.Worksheet) {
  const headersTableRow = ws.getRow(1);

  if (!(headersTableRow.actualCellCount === 3)) return false;

  const headers = ["Прибор учета", "Параметр", "Значение"];

  let check = true;

  headersTableRow.eachCell((cell) => {
    const cellValue = cell.text.trim();

    if (!headers.includes(cellValue)) check = false;
  });

  return check;
}
