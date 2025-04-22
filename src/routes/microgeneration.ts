import { randomUUID } from "crypto";
import exceljs from "exceljs";
import express from "express";
import multer from "multer";
import validateToken from "src/middleware/validateToken.ts";
import fillMicrogeneration from "src/parse-excel/fillMicrogeneration.ts";
import validateMicrogeneration from "src/parse-excel/validateMicrogeneration.ts";
import { deleteFile } from "src/utils/fileSystemFunc.ts";
import { z } from "zod";

const balanceGroupSchema = z.object({
  balanceGroup: z.enum(["private", "legal"], {
    message: "The form data is missing a balance group.",
  }),
});

const router = express.Router();

router.use(validateToken);

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
  "/microgeneration/",
  upload.single("upload"),
  async (req, res, next) => {
    if (!req.file) {
      res.status(400).json("The form data is missing a xlsx file.");
      return;
    }

    const filePath = `upload/${req.file.filename}`;

    if (
      req.file.mimetype !==
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      deleteFile(filePath);
      res
        .status(415)
        .json(
          "Only 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' content types supported.",
        );
      return;
    }

    if (!(await validateMicrogeneration(filePath))) {
      deleteFile(filePath);
      res
        .status(422)
        .json(
          "The xlsx table headers are not the same as the default export from Sims.",
        );
      return;
    }

    const balanceGroup = balanceGroupSchema.safeParse(req.body);

    if (!balanceGroup.success) {
      deleteFile(filePath);
      res.status(400).json("The form data is missing a balance group.");
      return;
    }

    next();
  },
  async (req, res) => {
    const fileName = req.file?.filename;
    const uploadedFilePath = `upload/${fileName}`;
    const balanceGroup = balanceGroupSchema.parse(req.body).balanceGroup;

    const templatePath =
      balanceGroup === "private"
        ? `xlsx-templates/${process.env.MICROGENERATION_P}`
        : `xlsx-templates/${process.env.MICROGENERATION_L}`;

    const excel = new exceljs.Workbook();
    const wb = await excel.xlsx.readFile(templatePath);

    await fillMicrogeneration(wb, uploadedFilePath);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent("Микрогенерация.xlsx")}"`,
    );

    void wb.xlsx
      .write(res)
      .then(() => res.status(200).end())
      .finally(() => deleteFile(uploadedFilePath));
  },
);

export { router as microgenerationRoute };
