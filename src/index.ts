import express from "express";
import cors from "cors";
import { matritcaRoute } from "./routes/matritca.ts";
import { odpyRoute } from "./routes/odpy.ts";
import { loginRoute } from "./routes/login.ts";
import { folderExists } from "src/utils/fileSystemFunc.ts";

await folderExists("upload");
await folderExists("parsed-excel");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use("/api", loginRoute);
app.use("/api", matritcaRoute);
app.use("/api", odpyRoute);

app.listen(port, () => {
  console.log(`Automate-reports-api app listening on port ${port}`);
});
