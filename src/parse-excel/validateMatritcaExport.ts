import exceljs from "exceljs";

export default async function validateMatritcaExport(filePath: string) {
  const excel = new exceljs.Workbook();
  const wb = await excel.xlsx.readFile(filePath);
  const ws = wb.worksheets[0];

  if (!checkHeaders(ws)) return false;

  return true;
}

function checkHeaders(ws: exceljs.Worksheet) {
  if (ws.getCell("A1").value !== "Display Data") return false;

  const secondRowHeaders = [
    "#",
    "Код потребителя",
    "Серийный №",
    "Дата",
    "Активная энергия, импорт, тариф1",
    "Активная энергия, импорт, тариф2",
    "Активная энергия, импорт, тариф3",
    "Активная энергия, импорт",
    "Адрес",
    "Наименование точки учета",
    "Тип устройства",
  ];

  let i = 0;
  let check = true;

  ws.unMergeCells("K2:L2");

  ws.getRow(2).eachCell((cell) => {
    if (cell.value !== secondRowHeaders[i]) check = false;
    i++;
  });

  return check;
}
