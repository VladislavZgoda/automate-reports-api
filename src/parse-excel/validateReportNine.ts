import exceljs from "exceljs";

export default async function validateReportNine(filePath: string) {
  const excel = new exceljs.Workbook();
  const wb = await excel.xlsx.readFile(filePath);
  const ws = wb.worksheets[0];

  if (!checkHeaders(ws)) return false;

  return true;
}

function checkHeaders(ws: exceljs.Worksheet) {
  const secondRowHeaders = [
    "№ п/п",
    "Л/С",
    "Номер_ПУ",
    "Дата",
    "Т1",
    "Т2",
    "Т3",
    "Т сумм",
    "Адрес",
    "ФИО абонента",
    "Дата_АСКУЭ",
    "Тип ПУ",
    "Способ снятия показаний",
    "ТП",
  ];

  let i = 0;
  let check = true;

  ws.getRow(2).eachCell((cell) => {
    if (cell.value !== secondRowHeaders[i]) check = false;
    i++;
  });

  return check;
}
