import express from "express";
import multer from "multer";
import exceljs from "exceljs";
import AdmZip from "adm-zip";
import { randomUUID } from "crypto";
import { deleteFile } from "src/utils/fileSystemFunc.ts";
import parseMatritca from "src/parse-excel/parseMatritca.ts";
import createReadingSheet from "src/parse-excel/createReadingSheet.ts";
import validateMatritcaExport from "src/parse-excel/validateMatritcaExport.ts";
import { todayDate } from "src/utils/dateFunc.ts";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, "upload/");
  },
  filename: function (_req, _file, cb) {
    cb(null, `matritca_export${randomUUID()}.xlsx`);
  },
});

const upload = multer({ storage: storage });

router.post(
  "/matritca/",
  upload.single("upload"),
  async (req, res, next) => {
    if (!req.file) {
      res.status(400).send("The form data is missing a xlsx file.");
      return;
    }

    const filePath = `upload/${req.file.filename}`;

    if (
      req.file.mimetype !==
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      deleteFile(filePath);
      res
        .status(415)
        .send(
          "Only 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' content types supported.",
        );
      return;
    }

    if (!(await validateMatritcaExport(filePath))) {
      deleteFile(filePath);
      res
        .status(422)
        .send(
          "The xlsx table headers are not the same as the default export from Sims.",
        );
      return;
    }

    if (!["private", "legal"].includes(req.body.balanceGroup)) {
      deleteFile(filePath);
      res.status(400).send("The form data is missing a balance group.");
      return;
    }

    if (
      req.body.balanceGroup === "private" &&
      req.body.controller === undefined
    ) {
      deleteFile(filePath);
      res.status(400).send("The form data is missing a controller.");
      return;
    }

    next();
  },
  (req, _res, next) => {
    if (req.body.balanceGroup === "legal") {
      next();
    } else if (req.body.balanceGroup === "private") {
      next("route");
    }
  },
  async (req, res) => {
    const fileName = req.file?.filename as string;
    const uploadedFilePath = `upload/${fileName}`;
    const excel = new exceljs.Workbook();
    const wb = await excel.xlsx.readFile(uploadedFilePath);

    await parseMatritca(wb, "legal");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent("Приложение №9 Юр.xlsx")}"`,
    );

    wb.xlsx
      .write(res)
      .then(() => res.status(200).end())
      .finally(() => deleteFile(uploadedFilePath));
  },
);

router.post("/matritca/", async (req, res) => {
  const fileName = req.file?.filename as string;
  const controller = req.body.controller as string;
  const uploadedFilePath = `upload/${fileName}`;
  const excel = new exceljs.Workbook();
  const wb = await excel.xlsx.readFile(uploadedFilePath);

  await parseMatritca(wb, "private");
  const supplementNinePath = `parsed-excel/Приложение № 9 Быт${randomUUID()}.xlsx`;
  await wb.xlsx.writeFile(supplementNinePath);

  const readingSheetPath = await createReadingSheet(
    supplementNinePath,
    controller,
  );

  const zip = new AdmZip();

  zip.addLocalFile(
    supplementNinePath,
    undefined,
    `Приложение № 9 Быт ${todayDate()}.xlsx`,
  );

  zip.addLocalFile(
    readingSheetPath,
    undefined,
    `АСКУЭ Быт ${todayDate()}.xlsx`,
  );

  const data = zip.toBuffer();

  res.setHeader("Content-Type", "application/octet-stream");

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${encodeURIComponent("Быт.zip")}`,
  );

  res.setHeader("Content-Length", `${data.length}`);
  res.status(200).send(data);

  deleteFile(uploadedFilePath);
  deleteFile(supplementNinePath);
  deleteFile(readingSheetPath);
});

export { router as matritcaRoute };
