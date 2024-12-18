import exceljs from "exceljs";

export default async function parseMatritca(fileName: string) {
  const excel = new exceljs.Workbook();
  const wb = await excel.xlsx.readFile(`upload/${fileName}`);
  const ws = wb.worksheets[0];

  deleteRows(ws);
  processSerialNumbers(ws);
  processConsumerCode(ws);

  excel.xlsx.writeFile("parsed-excel/test.xlsx");
}

function deleteRows(ws: exceljs.Worksheet) {
  let i = 3;

  while (i < ws.actualRowCount + 1) {
    if (checkValueForDelete(ws, i)) {
      ws.spliceRows(i, 1);
    } else {
      i += 1;
    }
  }
}

function checkValueForDelete(ws: exceljs.Worksheet, rowNumber: number) {
  const cellValue = ws.getCell("B" + rowNumber).value?.toString();

  if (cellValue === undefined || !cellValue.trim().startsWith("230700")) {
    return true;
  }

  return false;
}

function processSerialNumbers(ws: exceljs.Worksheet) {
  const column = ws.getColumn("C");

  column.alignment = {
    vertical: "middle",
    horizontal: "right",
  };

  column.font = {
    name: "Times New Roman",
    size: 10,
  };

  column.eachCell((cell, _rowNumber) => {
    const cellValue = String(cell.value).trim();

    cell.numFmt = "@";

    if (cellValue.length === 7) {
      cell.value = "0" + cellValue;
    }
  });
}

function processConsumerCode(ws: exceljs.Worksheet) {
  const column = ws.getColumn("B");

  column.alignment = {
    vertical: "middle",
    horizontal: "right",
  };

  column.font = {
    name: "Times New Roman",
    size: 10,
  };

  column.eachCell((cell, _rowNumber) => {
    const cellValue = String(cell.value).trim();
    cell.numFmt = "@";
    cell.value = cellValue;
  });
}
