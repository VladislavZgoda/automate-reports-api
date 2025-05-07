import { randomUUID } from "crypto";
import exceljs from "exceljs";
import express from "express";
import multer from "multer";
import validateToken from "src/middleware/validateToken.ts";
import changeOneZoneMeters from "src/parse-excel/changeOneZoneMeters.ts";
import parseOneZoneMeters from "src/parse-excel/parseOneZoneMeters.ts";
import validateMatritcaExport from "src/parse-excel/validateMatritcaExport.ts";
import validateOneZoneMeters from "src/parse-excel/validateOneZoneMeters.ts";
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
  "/one-zone-meters",
  upload.fields([
    { name: "simsFile", maxCount: 1 },
    { name: "oneZoneMetersFile", maxCount: 1 },
  ]),
  async (req, res) => {
    const files = req.files as Record<string, Express.Multer.File[]>;
    const simsFilePath = `upload/${files?.simsFile?.[0].filename}`;
    const oneZoneMetersFilePath = `upload/${files?.oneZoneMetersFile?.[0].filename}`;

    if (Object.keys(files).length < 2) {
      deleteFiles(simsFilePath, oneZoneMetersFilePath);
      res.status(400).json("The form data is missing a xlsx files.");
      return;
    }

    const mimetype =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    if (
      !(
        files.simsFile[0].mimetype === mimetype &&
        files.oneZoneMetersFile[0].mimetype === mimetype
      )
    ) {
      deleteFiles(simsFilePath, oneZoneMetersFilePath);
      res
        .status(415)
        .json(
          "Only 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' content types supported.",
        );
      return;
    }

    if (!(await validateMatritcaExport(simsFilePath))) {
      deleteFiles(simsFilePath, oneZoneMetersFilePath);
      res.status(422).json({
        file: "simsFile",
        message:
          "The xlsx table headers do not match the default export headers from Sims.",
      });
      return;
    }

    if (!(await validateOneZoneMeters(oneZoneMetersFilePath))) {
      deleteFiles(simsFilePath, oneZoneMetersFilePath);
      res.status(422).json({
        file: "oneZoneMetersFile",
        message:
          "The xlsx table must have column A with the serial numbers of the meters.",
      });
      return;
    }

    const oneZoneMeters: number[] = [];

    await parseOneZoneMeters(oneZoneMetersFilePath, oneZoneMeters);

    const excel = new exceljs.Workbook();
    const wb = await excel.xlsx.readFile(simsFilePath);

    changeOneZoneMeters(wb, oneZoneMeters);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent("Измененные однозонные счетчики.xlsx")}"`,
    );

    wb.xlsx
      .write(res)
      .then(() => res.status(200).end())
      .catch((error) => console.log(error))
      .finally(() => deleteFiles(simsFilePath, oneZoneMetersFilePath));
  },
);

export { router as oneZoneMeters };
