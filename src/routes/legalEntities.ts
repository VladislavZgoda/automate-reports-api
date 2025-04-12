import { randomUUID } from "crypto";
import express from "express";
import multer from "multer";
import validateToken from "src/middleware/validateToken.ts";
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

    next();
  },
);

export { router as legalEntitiesRoute };
