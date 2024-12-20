import exceljs from "exceljs";
import type { Borders } from "exceljs";
import { folderExists } from "utils/fileSystemFunc.js";

type Alignment = {
  vertical?:
    | "middle"
    | "top"
    | "bottom"
    | "distributed"
    | "justify"
    | undefined;
  horizontal?:
    | "distributed"
    | "justify"
    | "left"
    | "right"
    | "center"
    | "fill"
    | "centerContinuous"
    | undefined;
};

type Args = {
  ws: exceljs.Worksheet;
  alignment: Alignment;
  font: {
    name: string;
    size: number;
  };
  border: Partial<Borders>;
};

export default async function parseMatritca(fileName: string) {
  await folderExists("parsed-excel");

  const excel = new exceljs.Workbook();
  const wb = await excel.xlsx.readFile(`upload/${fileName}`);
  const ws = wb.worksheets[0];

  // ExcelJS при изменении выравнивания в одном столбце, изменяет и другие.
  // Единственный вариант это делать выравнивание везде.
  const alignment: Alignment = {
    vertical: "middle",
    horizontal: "left",
  };

  const font = {
    name: "Times New Roman",
    size: 10,
  };

  const border: Partial<Borders> = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  unmerge(ws);
  deleteRows(ws);
  processConsumerCode({ ws, alignment, font, border });
  processSerialNumbers({ ws, alignment, font, border });
  processDate({ ws, alignment, font, border });
  processActivePower({ ws, alignment, font, border });
  processAddress({ ws, alignment, font, border });
  processConsumer({ ws, alignment, font, border });
  processDeviseType({ ws, alignment, font, border });

  excel.xlsx.writeFile("parsed-excel/test.xlsx");
}

function unmerge(ws: exceljs.Worksheet) {
  ws.getColumn("L").eachCell((cell) => {
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
  const consumerCode = ws.getCell("B" + rowNumber).value?.toString();

  if (consumerCode === undefined || !consumerCode.trim().startsWith("230700")) {
    return true;
  }

  const consumer = ws.getCell("J" + rowNumber).value?.toString();

  if (consumer?.trim().toLowerCase() === "одпу") {
    return true;
  }

  return false;
}

function processConsumerCode({ ws, alignment, font, border }: Args) {
  const column = ws.getColumn("B");

  column.alignment = alignment;
  column.font = font;
  column.width = 15;

  column.eachCell((cell) => {
    const cellValue = String(cell.value).trim();
    cell.numFmt = "@";
    cell.value = cellValue;
    cell.border = border;
  });
}

function processSerialNumbers({ ws, alignment, font, border }: Args) {
  const column = ws.getColumn("C");

  column.alignment = alignment;
  column.font = font;
  column.width = 15;

  column.eachCell((cell) => {
    const cellValue = String(cell.value).trim();
    cell.numFmt = "@";

    if (cellValue.length === 7) {
      cell.value = "0" + cellValue;
    }

    cell.border = border;
  });
}

function processAddress({ ws, alignment, font, border }: Args) {
  const column = ws.getColumn("I");

  column.alignment = alignment;
  column.font = font;
  column.width = 45;

  column.eachCell((cell) => {
    cell.border = border;
  });
}

function processDeviseType({ ws, alignment, font, border }: Args) {
  const column = ws.getColumn("K");

  column.alignment = alignment;
  column.font = font;
  column.width = 22;

  column.eachCell((cell) => {
    cell.border = border;
  });
}

function processConsumer({ ws, alignment, font, border }: Args) {
  const column = ws.getColumn("J");

  column.alignment = alignment;
  column.font = font;
  column.width = 30;

  column.eachCell((cell) => {
    cell.border = border;
  });
}

function processDate({ ws, alignment, font, border }: Args) {
  const column = ws.getColumn("D");

  column.alignment = alignment;
  column.font = font;
  column.width = 12;

  column.eachCell((cell) => {
    cell.border = border;
  });
}

function processActivePower({ ws, alignment, font, border }: Args) {
  const t1 = ws.getColumn("E");
  const t2 = ws.getColumn("F");
  const t3 = ws.getColumn("G");
  const t = ws.getColumn("H");

  const width = 12;

  t1.alignment = alignment;
  t1.font = font;
  t1.width = width;

  t1.eachCell((cell) => {
    const value = Number(cell.value);

    if (value) {
      cell.numFmt = "@";
      cell.value = value.toFixed(2);
    }

    cell.border = border;
  });

  t2.alignment = alignment;
  t2.font = font;
  t2.width = width;

  t2.eachCell((cell) => {
    const value = Number(cell.value);

    if (value) {
      cell.numFmt = "@";
      cell.value = value.toFixed(2);
    }

    cell.border = border;
  });

  t3.alignment = alignment;
  t3.font = font;
  t3.width = width;

  t3.eachCell((cell) => {
    const value = Number(cell.value);

    if (value) {
      cell.numFmt = "@";
      cell.value = value.toFixed(2);
    }

    cell.border = border;
  });

  t.alignment = alignment;
  t.font = font;
  t.width = width;

  t.eachCell((cell) => {
    const value = Number(cell.value);

    if (value) {
      cell.numFmt = "@";
      cell.value = value.toFixed(2);
    }

    cell.border = border;
  });
}
