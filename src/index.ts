import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { matritcaRoute } from "./routes/matritca.ts";
import { odpyRoute } from "./routes/odpy.ts";
import { loginRoute } from "./routes/login.ts";
import { logoutRoute } from "./routes/logout.ts";
import { refreshRoute } from "./routes/refresh.ts";
import { folderExists } from "src/utils/fileSystemFunc.ts";

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

app.listen(port, () => {
  console.log(`Automate-reports-api app listening on port ${port}`);
});
