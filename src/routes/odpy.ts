import express from "express";
import multer from "multer";
import { randomUUID } from "crypto";
import { deleteFile, deleteFiles } from "src/utils/fileSystemFunc.ts";

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
  (req, res, next) => {
    const files = req.files as Files;
    const matritcaOdpyPath = `upload/${files?.matritcaOdpy?.[0].filename}`;
    const piramidaOdpyPath = `upload/${files?.piramidaOdpy?.[0].filename}`;

    if (Object.keys(files).length < 2) {
      deleteFiles(matritcaOdpyPath, piramidaOdpyPath);
      res.status(400).send("The form data is missing a xlsx files.");
      return;
    }

    res.status(200).send();
  },
);

export { router as odpyRoute };
