import exceljs from "exceljs";

export default async function validateMeterReadings(filePath: string) {
  const excel = new exceljs.Workbook();
  const wb = await excel.xlsx.readFile(filePath);
  const ws = wb.worksheets[0];

  if (!checkHeaders(ws)) return false;

  return true;
}

function checkHeaders(ws: exceljs.Worksheet) {
  const headersTableRow = ws.getRow(5);

  if (!(headersTableRow.actualCellCount === 13)) return false;

  const headers = [
    "№пп",
    "Точка учёта",
    "Абонент",
    "Тип",
    "Серийный номер",
    "Коэффициенты",
    "Тариф",
    "Измерение",
    "Тарифная зона",
    "Показания на начало периода",
    "Показания на конец периода",
    "Потребление за период",
  ];

  let check = true;

  headersTableRow.eachCell((cell) => {
    const cellValue = cell.text.trim();

    if (!headers.includes(cellValue)) check = false;
  });

  return check;
}
