import exceljs from "exceljs";

export default async function fillOdpyTemplate(
  matritcaPath: string,
  piramidaPath: string,
) {
  const excel = new exceljs.Workbook();

  const wbMatritca = await excel.xlsx.readFile(matritcaPath);
  const wsMatritca = wbMatritca.worksheets[0];

  const wbPiramida = await excel.xlsx.readFile(piramidaPath);
  const wsPiramida = wbPiramida.worksheets[0];

  const wbTemplate = await excel.xlsx.readFile(
    "xlsx-templates/odpy_reading_sheet.xlsx",
  );
  const wsTemplate = wbTemplate.worksheets[0];
}
