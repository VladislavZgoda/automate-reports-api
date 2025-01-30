import express from "express";
import multer from "multer";
import { randomUUID } from "crypto";
import AdmZip from "adm-zip";
import { deleteFiles } from "src/utils/fileSystemFunc.ts";
import { todayDate } from "src/utils/dateFunc.ts";
import validateMatritcaExport from "src/parse-excel/validateMatritcaExport.ts";
import validatePiramidaOdpy from "src/parse-excel/validatePiramidaOdpy.ts";
import fillOdpyTemplate from "src/parse-excel/fillOdpyTemplate.ts";
import createReadingSheet from "src/parse-excel/createReadingSheet.ts";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, "upload/");
  },
  filename: function (_req, file, cb) {
    cb(null, `${file.fieldname}${randomUUID()}.xlsx`);
  },
});

const upload = multer({ storage: storage });

type Files = { [fieldname: string]: Express.Multer.File[] };

router.post(
  "/odpy/",
  upload.fields([
    { name: "matritcaOdpy", maxCount: 1 },
    { name: "piramidaOdpy", maxCount: 1 },
  ]),
  async (req, res, next) => {
    const files = req.files as Files;
    const matritcaOdpyPath = `upload/${files?.matritcaOdpy?.[0].filename}`;
    const piramidaOdpyPath = `upload/${files?.piramidaOdpy?.[0].filename}`;

    if (Object.keys(files).length < 2) {
      deleteFiles(matritcaOdpyPath, piramidaOdpyPath);
      res.status(400).send("The form data is missing a xlsx files.");
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
      deleteFiles(matritcaOdpyPath, piramidaOdpyPath);
      res
        .status(415)
        .send(
          "Only 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' content types supported.",
        );
      return;
    }

    if (!(await validateMatritcaExport(matritcaOdpyPath))) {
      deleteFiles(matritcaOdpyPath, piramidaOdpyPath);
      res
        .status(422)
        .send(
          "The xlsx table headers are not the same as the default export from Sims.",
        );
      return;
    }

    if (!(await validatePiramidaOdpy(piramidaOdpyPath))) {
      deleteFiles(matritcaOdpyPath, piramidaOdpyPath);
      res
        .status(422)
        .send(
          "The xlsx table headers are not the same as the default export from Piramida.",
        );
      return;
    }

    if (req.body.controller === undefined) {
      deleteFiles(matritcaOdpyPath, piramidaOdpyPath);
      res.status(400).send("The form data is missing a controller.");
      return;
    }

    next();
  },
  async (req, res) => {
    const files = req.files as Files;
    const matritcaOdpyPath = `upload/${files?.matritcaOdpy?.[0].filename}`;
    const piramidaOdpyPath = `upload/${files?.piramidaOdpy?.[0].filename}`;
    const controller = req.body.controller as string;

    const supplementNinePath = await fillOdpyTemplate(
      matritcaOdpyPath,
      piramidaOdpyPath,
    );

    const readingSheetPath = await createReadingSheet(
      supplementNinePath,
      controller,
    );

    const zip = new AdmZip();

    zip.addLocalFile(supplementNinePath, undefined, `Приложение № 9 ОДПУ.xlsx`);

    zip.addLocalFile(
      readingSheetPath,
      undefined,
      `АСКУЭ ОДПУ ${todayDate()}.xlsx`,
    );

    const data = zip.toBuffer();

    res.setHeader("Content-Type", "application/octet-stream");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${encodeURIComponent("ОДПУ.zip")}`,
    );

    res.setHeader("Content-Length", `${data.length}`);
    res.status(200).send(data);

    deleteFiles(
      matritcaOdpyPath,
      piramidaOdpyPath,
      supplementNinePath,
      readingSheetPath,
    );
  },
);

export { router as odpyRoute };
