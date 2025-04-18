import { randomUUID } from "crypto";
import express from "express";
import multer from "multer";
import validateToken from "src/middleware/validateToken.ts";
import validateMatritcaExport from "src/parse-excel/validateMatritcaExport.ts";
import validateMeterReadings from "src/parse-excel/validateMeterReadings.ts";
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
  "/vip/",
  upload.fields([
    { name: "simsFile", maxCount: 1 },
    { name: "piramidaFile", maxCount: 1 },
  ]),
  async (req, res, next) => {
    const files = req.files as Record<string, Express.Multer.File[]>;
    const simsFilePath = `upload/${files?.simsFile?.[0].filename}`;
    const piramidaFilePath = `upload/${files?.piramidaFile?.[0].filename}`;

    if (Object.keys(files).length < 2) {
      deleteFiles(simsFilePath, piramidaFilePath);
      res.status(400).json("The form data is missing a xlsx files.");
      return;
    }

    const mimetype =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    if (
      !(
        files.matritcaOdpy[0].mimetype === mimetype &&
        files.piramidaOdpy[0].mimetype === mimetype
      )
    ) {
      deleteFiles(simsFilePath, piramidaFilePath);
      res
        .status(415)
        .json(
          "Only 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' content types supported.",
        );
      return;
    }

    if (!(await validateMatritcaExport(simsFilePath))) {
      deleteFiles(simsFilePath, piramidaFilePath);
      res.status(422).json({
        file: "simsFile",
        message:
          "The xlsx table headers do not match the default export headers from Sims.",
      });
      return;
    }

    if (!(await validateMeterReadings(piramidaFilePath))) {
      deleteFiles(simsFilePath, piramidaFilePath);
      res.status(422).json({
        file: "meterReadings",
        message: `The xlsx table headers do not match the default export headers
               from report New Readings in Piramida 2.`,
      });
      return;
    }

    next();
  },
  async (req, res) => {
    const files = req.files as Record<string, Express.Multer.File[]>;
    const simsFilePath = `upload/${files?.simsFile?.[0].filename}`;
    const piramidaFilePath = `upload/${files?.piramidaFile?.[0].filename}`;
  },
);

export { router as vipRoute };
