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

type BalanceGroup = "private" | "legal";

export default async function parseMatritca(
  fileName: string,
  balanceGroup: BalanceGroup,
) {
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

  const alignmentCenter: Alignment = {
    vertical: "middle",
    horizontal: "center",
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

  // Столбец K и L обеденны (зачем не понятно) при экспорте из Sims Client.
  unmerge(ws);

  // Вставить столбец после J для внесения даты АСКУЭ.
  ws.spliceColumns(11, 0, []);

  deleteRows(ws, balanceGroup);
  addLineNumbers({ ws, alignment, font, border });
  processConsumerCode({ ws, alignment, font, border });
  processSerialNumbers({ ws, alignment, font, border });
  processDate({ ws, alignment, font, border });
  processActivePower({ ws, alignment, font, border });
  processAddress({ ws, alignment, font, border });
  processConsumer({ ws, alignment, font, border });
  addAskueDate({ ws, alignment, font, border });
  processDeviseType({ ws, alignment, font, border });
  readingsMethod({ ws, alignment, font, border });
  addTP({ ws, alignment, font, border });
  tableHeaders(ws, alignmentCenter, border);
  mainHeader(ws, alignmentCenter);

  excel.xlsx.writeFile("parsed-excel/test.xlsx");
}

function unmerge(ws: exceljs.Worksheet) {
  ws.getColumn("L").eachCell((cell) => {
    cell.unmerge();
  });
}

function deleteRows(ws: exceljs.Worksheet, balanceGroup: BalanceGroup) {
  if (balanceGroup === "private") {
    deletePrivate(ws);
  } else if (balanceGroup === "legal") {
    deleteLegal(ws);
  }
}

function checkValueForDeletePrivate(ws: exceljs.Worksheet, rowNumber: number) {
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

function deletePrivate(ws: exceljs.Worksheet) {
  let i = 3;

  while (i < ws.actualRowCount + 1) {
    if (checkValueForDeletePrivate(ws, i)) {
      ws.spliceRows(i, 1);
    } else {
      i += 1;
    }
  }
}

function deleteLegal(ws: exceljs.Worksheet) {
  let i = 3;

  while (i < ws.actualRowCount + 1) {
    if (checkValueForDeleteLegal(ws, i)) {
      ws.spliceRows(i, 1);
    } else {
      i += 1;
    }
  }
}

function checkValueForDeleteLegal(ws: exceljs.Worksheet, rowNumber: number) {
  const consumerCode = ws.getCell("B" + rowNumber).value?.toString();

  if (consumerCode === undefined || !consumerCode.trim().startsWith("230710")) {
    return true;
  }
}

function processConsumerCode({ ws, alignment, font, border }: Args) {
  const column = ws.getColumn("B");

  column.alignment = alignment;
  column.font = font;
  column.width = 15;

  column.eachCell((cell) => {
    const cellValue = String(cell.value).replaceAll(/[.,\s]/g, '');
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
  const column = ws.getColumn("L");

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
  column.width = 10;

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

function addLineNumbers({ ws, alignment, font, border }: Args) {
  for (let i = 3, j = 1; i < ws.actualRowCount + 1; i++, j++) {
    const cell = ws.getCell("A" + i);
    cell.value = j;
    cell.border = border;
  }

  const column = ws.getColumn("A");

  column.alignment = alignment;
  column.font = font;
  column.width = 8;
}

function addAskueDate({ ws, alignment, font, border }: Args) {
  const column = ws.getColumn("K");
  const currentDate = new Date().toLocaleDateString("ru");

  column.alignment = alignment;
  column.font = font;
  column.width = 16;

  column.eachCell((cell) => {
    cell.border = border;
    cell.value = currentDate;
  });
}

function readingsMethod({ ws, alignment, font, border }: Args) {
  const column = ws.getColumn("M");

  column.alignment = alignment;
  column.font = font;
  column.width = 18;

  column.eachCell((cell) => {
    cell.border = border;
    cell.value = "УСПД";
  });
}

function addTP({ ws, alignment, font, border }: Args) {
  const re = /^ТП-\d{1,3}П?/i;

  for (let i = 3; i < ws.actualRowCount + 1; i++) {
    const tp = ws
      .getCell("I" + i)
      .value?.toString()
      .match(re);

    const cell = ws.getCell("N" + i);
    cell.value = tp?.[0];
    cell.alignment = alignment;
    cell.font = font;
    cell.border = border;
  }
}

function tableHeaders(
  ws: exceljs.Worksheet,
  alignment: Alignment,
  border: Partial<Borders>,
) {
  const row = ws.getRow(2);
  row.getCell("A").value = "№ п/п";
  row.getCell("B").value = "Л/С";
  row.getCell("C").value = "Номер_ПУ";
  row.getCell("D").value = "Дата";
  row.getCell("E").value = "Т1";
  row.getCell("F").value = "Т2";
  row.getCell("G").value = "Т3";
  row.getCell("H").value = "Т сумм";
  row.getCell("I").value = "Адрес";
  row.getCell("J").value = "ФИО абонента";
  row.getCell("K").value = "Дата_АСКУЭ";
  row.getCell("L").value = "Тип ПУ";
  row.getCell("M").value = "Способ снятия показаний";
  row.getCell("N").value = "ТП";

  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "ffffff" },
  };

  row.height = 40;

  row.eachCell((cell) => {
    cell.alignment = {
      ...alignment,
      wrapText: true,
    };
    cell.border = border;
    cell.font = {
      name: "Times New Roman",
      size: 12,
      bold: true,
    };
  });
}

function mainHeader(ws: exceljs.Worksheet, alignment: Alignment) {
  ws.unMergeCells("A1:K1");
  ws.mergeCells("A1:N1");

  const cell = ws.getCell("A1");
  cell.value =
    "Ведомость дистанционного снятия показаний посредствам АСКУЭ и ридера";

  cell.font = {
    name: "Times New Roman",
    size: 14,
    bold: true,
  };

  cell.alignment = alignment;
}
