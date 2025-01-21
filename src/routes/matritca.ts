import express from "express";
import multer from "multer";
import exceljs from "exceljs";
import AdmZip from "adm-zip";
import { randomUUID } from "crypto";
import { deleteFile } from "utils/fileSystemFunc.ts";
import parseMatritca from "parse-excel/parseMatritca.ts";
import { todayDate } from "utils/dateFunc.ts";

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
  (req, res, next) => {
    if (!req.file) {
      res.status(400).send("The form data is missing a xlsx file.");
      return;
    } else if (
      req.file.mimetype !==
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      deleteFile(`upload/${req.file.filename}`);
      res
        .status(415)
        .send(
          "Only 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' content types supported.",
        );
      return;
    } else if (!["private", "legal"].includes(req.body.balanceGroup)) {
      deleteFile(`upload/${req.file.filename}`);
      res.status(400).send("The form data is missing a balance group.");
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
  const uploadedFilePath = `upload/${fileName}`;
  const excel = new exceljs.Workbook();
  const wb = await excel.xlsx.readFile(uploadedFilePath);

  await parseMatritca(wb, "private");
  const supplementNinePath = `parsed-excel/Приложение № 9 Быт${randomUUID()}.xlsx`;
  await wb.xlsx.writeFile(supplementNinePath);

  const zip = new AdmZip();
  zip.addLocalFile(
    supplementNinePath,
    undefined,
    `Приложение № 9 Быт ${todayDate()}.xlsx`,
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
});

export { router as matritcaRoute };
