import express from "express";
import multer from "multer";
import cors from 'cors';
import parseMatritca from "parse-excel/parseMatritca.js";

const app = express();
const port = 3000;
app.use(cors());

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, "./upload/");
  },
  filename: function (_req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/api/matritca/", upload.single("upload"), async (req, res) => {
  const fileName = req.file?.originalname;
  const balanceGroup = req.body.balanceGroup;
  const folder = import.meta.dirname + '/parsed-excel/';

  const downloadFileName = `Приложение №9 ${balanceGroup === "private" ? "Быт" : "Юр"}.xlsx`;

  await parseMatritca(fileName, balanceGroup);

  // res.setHeader("Content-Disposition", `attachment;`);
  // res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

  res.sendFile(folder + downloadFileName);
});

app.listen(port, () => {
  console.log(`Automate-reports-api app listening on port ${port}`);
});
