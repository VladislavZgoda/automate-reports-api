import exceljs from "exceljs";

export default async function validatePiramidaOdpy(filePath: string) {
  const excel = new exceljs.Workbook();
  const wb = await excel.xlsx.readFile(filePath);
  const ws = wb.worksheets[0];
  const headresTableRow = ws.getRow(5);

  if (!(headresTableRow.actualCellCount === 19)) return false;

  const headers = [
    "Точка учета",
    "Номер\nприбора учета",
    "Номер\n лицевого счета",
    "Зафиксированные Показания",
    "Тариф1",
    "Тариф 2",
    "Тариф3",
  ];

  let check = true;

  headresTableRow.eachCell((cell) => {
    const cellValue = cell.value?.toString().trim() as string;

    if (!headers.includes(cellValue)) check = false;
  });

  return check;
}
