import exceljs from "exceljs";

type Meters = {
  [serialNumber: string]: {
    t1: string;
    t2: string;
    t: string;
    date: string;
  };
};

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

  const meters: Meters = {};
  parsePiramidaOdpy(wsPiramida, meters);
  parseMatritcaOdpy(wsMatritca, meters); 
}

function parsePiramidaOdpy(ws: exceljs.Worksheet, meters: Meters) {
  for (let i = 6; i < ws.actualRowCount + 1; i++) {
    if (ws.getCell("P" + i).value) {
      meters[String(ws.getCell("C" + i).value)] = {
        t1: String(ws.getCell("Q" + i).value),
        t2: String(ws.getCell("R" + i).value),
        t: String(ws.getCell("P" + i).value),
        date: String(ws.getCell("P4").value),
      };
    } else if (ws.getCell("L" + i).value) {
      meters[String(ws.getCell("C" + i).value)] = {
        t1: String(ws.getCell("M" + i).value),
        t2: String(ws.getCell("N" + i).value),
        t: String(ws.getCell("L" + i).value),
        date: String(ws.getCell("L4").value),
      };
    } else if (ws.getCell("H" + i).value) {
      meters[String(ws.getCell("C" + i).value)] = {
        t1: String(ws.getCell("I" + i).value),
        t2: String(ws.getCell("J" + i).value),
        t: String(ws.getCell("H" + i).value),
        date: String(ws.getCell("H4").value),
      };
    } else if (ws.getCell("D" + i).value) {
      meters[String(ws.getCell("C" + i).value)] = {
        t1: String(ws.getCell("E" + i).value),
        t2: String(ws.getCell("F" + i).value),
        t: String(ws.getCell("D" + i).value),
        date: String(ws.getCell("D4").value),
      };
    }
  }
}

function parseMatritcaOdpy(ws: exceljs.Worksheet, meters: Meters) {
  for (let i = 2; i < ws.actualRowCount + 1; i++) {
    const meteringPointName = String(ws.getCell("J" + i).value)
      .trim()
      .toUpperCase();

    if (meteringPointName === "ОДПУ") {
      let serialNumber = String(ws.getCell("C" + i).value).trim();
      if (serialNumber.length === 7) serialNumber = "0" + serialNumber;

      meters[serialNumber] = {
        t1: String(ws.getCell("E" + i).value),
        t2: String(ws.getCell("F" + i).value),
        t: String(ws.getCell("H" + i).value),
        date: String(ws.getCell("D" + i).value),
      };
    }
  }
}
