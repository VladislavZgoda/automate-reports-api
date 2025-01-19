import express from "express";
import multer from "multer";
import exceljs from "exceljs";
import { randomUUID } from "crypto";
import { deleteFile } from "utils/fileSystemFunc.js";
import parseMatritca from "parse-excel/parseMatritca.js";

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

router.post("/matritca/", upload.single("upload"), async (req, res) => {
  if (!req.file) {
    res.status(400).send("The form data is missing a xlsx file.");
    return;
  } else if (
    req.file.mimetype !==
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    deleteFile(req.file.filename);
    res
      .status(415)
      .send(
        "Only 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' content types supported.",
      );
    return;
  } else if (!["private", "legal"].includes(req.body.balanceGroup)) {
    deleteFile(req.file.filename);
    res.status(400).send("The form data is missing a balance group.");
    return;
  }

  const fileName = req.file?.filename as string;
  const balanceGroup = req.body.balanceGroup;
  const downloadFileName = `Приложение №9 ${balanceGroup === "private" ? "Быт" : "Юр"}.xlsx`;

  const excel = new exceljs.Workbook();
  const wb = await excel.xlsx.readFile(`upload/${fileName}`);

  await parseMatritca(wb, balanceGroup);

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${encodeURIComponent(downloadFileName)}"`,
  );

  wb.xlsx
    .write(res)
    .then(() => res.status(200).end())
    .finally(() => deleteFile(fileName));
});

export { router as matritcaRoute };
