import { randomUUID } from "crypto";
import exceljs from "exceljs";
import express from "express";
import multer from "multer";
import validateToken from "src/middleware/validateToken.ts";
import deleteRows from "src/parse-excel/deleteRows.ts";
import parseReportNine from "src/parse-excel/parseReportNine.ts";
import validateMatritcaExport from "src/parse-excel/validateMatritcaExport.ts";
import validateReportNine from "src/parse-excel/validateReportNine.ts";
import { deleteFiles } from "src/utils/fileSystemFunc.ts";

const router = express.Router();

router.use(validateToken);

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, "upload/");
  },
  filename: function (_req, file, cb) {
    cb(null, `${file.fieldname}${randomUUID()}.xlsx`);
  },
});

const upload = multer({ storage: storage });

router.post(
  "/private-not-transferred/",
  upload.fields([
    { name: "simsFile", maxCount: 1 },
    { name: "reportNineFile", maxCount: 1 },
  ]),
  async (req, res) => {
    const files = req.files as Record<string, Express.Multer.File[]>;
    const simsFilePath = `upload/${files?.simsFile?.[0].filename}`;
    const reportNineFilePath = `upload/${files?.reportNineFile?.[0].filename}`;

    if (Object.keys(files).length < 2) {
      deleteFiles(simsFilePath, reportNineFilePath);
      res.status(400).json("The form data is missing a xlsx files.");
      return;
    }

    const mimetype =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    if (
      !(
        files.simsFile[0].mimetype === mimetype &&
        files.reportNineFile[0].mimetype === mimetype
      )
    ) {
      deleteFiles(simsFilePath, reportNineFilePath);
      res
        .status(415)
        .json(
          "Only 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' content types supported.",
        );
      return;
    }

    if (!(await validateMatritcaExport(simsFilePath))) {
      deleteFiles(simsFilePath, reportNineFilePath);
      res.status(422).json({
        file: "simsFile",
        message:
          "The xlsx table headers do not match the default export headers from Sims.",
      });
      return;
    }

    if (!(await validateReportNine(reportNineFilePath))) {
      deleteFiles(simsFilePath, reportNineFilePath);
      res.status(422).json({
        file: "reportNineFile",
        message:
          "The xlsx table headers do not match the headers from report №9.",
      });
      return;
    }

    const uselessMeters: number[] = [];

    await parseReportNine(reportNineFilePath, uselessMeters);

    const excel = new exceljs.Workbook();
    const wb = await excel.xlsx.readFile(simsFilePath);

    deleteRows(wb, uselessMeters);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent("Не загруженные.xlsx")}"`,
    );

    wb.xlsx
      .write(res)
      .then(() => res.status(200).end())
      .catch((error) => console.log(error))
      .finally(() => deleteFiles(simsFilePath, reportNineFilePath));
  },
);

export { router as privateNotTransferredRoute };
