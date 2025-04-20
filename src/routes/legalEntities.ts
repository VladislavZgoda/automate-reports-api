import AdmZip from "adm-zip";
import { randomUUID } from "crypto";
import express from "express";
import multer from "multer";
import validateToken from "src/middleware/validateToken.ts";
import fillLegalEntitiesTemplates from "src/parse-excel/fillLegalEntitiesTemplates.ts";
import validateCurrentMeterReadings from "src/parse-excel/validateCurrentMeterReadings.ts";
import validateMeterReadings from "src/parse-excel/validateMeterReadings.ts";
import { deleteDir, deleteFiles } from "src/utils/fileSystemFunc.ts";

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
  "/legal-entities/",
  upload.fields([
    { name: "meterReadings", maxCount: 1 },
    { name: "currentMeterReadings", maxCount: 1 },
  ]),
  async (req, res, next) => {
    const files = req.files as Record<string, Express.Multer.File[]>;
    const meterReadingsPath = `upload/${files?.meterReadings?.[0].filename}`;
    const currentMeterReadingsPath = `upload/${files?.currentMeterReadings?.[0].filename}`;

    if (Object.keys(files).length < 2) {
      deleteFiles(meterReadingsPath, currentMeterReadingsPath);
      res.status(400).json("The form data is missing a xlsx files.");
      return;
    }

    const mimetype =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    if (
      !(
        files.meterReadings[0].mimetype === mimetype &&
        files.currentMeterReadings[0].mimetype === mimetype
      )
    ) {
      deleteFiles(meterReadingsPath, currentMeterReadingsPath);
      res
        .status(415)
        .json(
          "Only 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' content types supported.",
        );
      return;
    }

    if (!(await validateMeterReadings(meterReadingsPath))) {
      deleteFiles(meterReadingsPath, currentMeterReadingsPath);
      res.status(422).json({
        file: "meterReadings",
        message: `The xlsx table headers do not match the default export headers
           from report New Readings in Piramida 2.`,
      });
      return;
    }

    if (!(await validateCurrentMeterReadings(currentMeterReadingsPath))) {
      deleteFiles(meterReadingsPath, currentMeterReadingsPath);
      res.status(422).json({
        file: "currentMeterReadings",
        message: `The xlsx table headers do not match the headers of the
           "A+ Current Timashevsk" balance group export from Pyramida 2.`,
      });
      return;
    }

    next();
  },
  async (req, res) => {
    const files = req.files as Record<string, Express.Multer.File[]>;
    const meterReadingsPath = `upload/${files?.meterReadings?.[0].filename}`;
    const currentMeterReadingsPath = `upload/${files?.currentMeterReadings?.[0].filename}`;

    const legalDirPath = await fillLegalEntitiesTemplates(
      meterReadingsPath,
      currentMeterReadingsPath,
    );

    const zip = new AdmZip();
    zip.addLocalFolder(legalDirPath);

    const data = zip.toBuffer();

    res.setHeader("Content-Type", "application/octet-stream");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${encodeURIComponent("Юр.zip")}`,
    );

    res.setHeader("Content-Length", `${data.length}`);
    res.status(200).send(data);

    deleteDir(legalDirPath);
    deleteFiles(meterReadingsPath, currentMeterReadingsPath);
  },
);

export { router as legalEntitiesRoute };
