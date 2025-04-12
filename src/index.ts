import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { folderExists } from "src/utils/fileSystemFunc.ts";
import { legalEntitiesRoute } from "./routes/legalEntities.ts";
import { loginRoute } from "./routes/login.ts";
import { logoutRoute } from "./routes/logout.ts";
import { matritcaRoute } from "./routes/matritca.ts";
import { odpyRoute } from "./routes/odpy.ts";
import { refreshRoute } from "./routes/refresh.ts";

await folderExists("upload");
await folderExists("parsed-excel");

const app = express();
const port = process.env.PORT ?? 3000;

const corsOptions = {
  origin: process.env.CLIENT_ORIGIN,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use("/api", loginRoute);
app.use("/api", refreshRoute);
app.use("/api", logoutRoute);

app.use("/api", matritcaRoute);
app.use("/api", odpyRoute);
app.use("/api", legalEntitiesRoute);

app.listen(port, () => {
  console.log(`Automate-reports-api app listening on port ${port}`);
});
