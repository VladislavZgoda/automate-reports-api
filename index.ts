import express from "express";
import multer from "multer";
import cors from "cors";
import exceljs from "exceljs";
import { randomUUID } from "crypto";
import { deleteFile } from "utils/fileSystemFunc.js";
import parseMatritca from "parse-excel/parseMatritca.js";

const app = express();
const port = 3000;
app.use(cors());

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, "./upload/");
  },
  filename: function (_req, _file, cb) {
    cb(null, `matritca_export${randomUUID()}.xlsx`);
  },
});

const upload = multer({ storage: storage });

app.post("/api/matritca/", upload.single("upload"), async (req, res) => {
  const fileName = req.file?.filename;
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

app.listen(port, () => {
  console.log(`Automate-reports-api app listening on port ${port}`);
});
