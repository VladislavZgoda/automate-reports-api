import exceljs from "exceljs";
import { folderExists } from "utils/fileSystemFunc.js";

export default async function parseMatritca(fileName: string) {
  await folderExists("parsed-excel");

  const excel = new exceljs.Workbook();
  const wb = await excel.xlsx.readFile(`upload/${fileName}`);
  const ws = wb.worksheets[0];

  unmerge(ws);
  deleteRows(ws);
  processDeviseType(ws);
  processSerialNumbers(ws);
  processConsumerCode(ws);

  excel.xlsx.writeFile("parsed-excel/test.xlsx");
}

function unmerge(ws: exceljs.Worksheet) {
  ws.getColumn("L").eachCell((cell, _rowNumber) => {
    cell.unmerge();
  });
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

  column.width = 15;

  column.eachCell((cell, _rowNumber) => {
    const cellValue = String(cell.value).trim();
    cell.numFmt = "@";

    if (cellValue.length === 7) {
      cell.value = "0" + cellValue;
    }

    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
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

  column.width = 15;

  column.eachCell((cell, _rowNumber) => {
    const cellValue = String(cell.value).trim();
    cell.numFmt = "@";
    cell.value = cellValue;
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });
}

function processDeviseType(ws: exceljs.Worksheet) {
  const column = ws.getColumn("K");

  column.alignment = {
    vertical: "middle",
    horizontal: "left",
  };

  column.font = {
    name: "Times New Roman",
    size: 10,
  };

  column.width = 25;

  column.eachCell((cell, _rowNumber) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });
}
