import express from "express";
import cors from "cors";
import { matritcaRoute } from "./routes/matritca.ts";

const app = express();
const port = 3000;

app.use(cors());
app.use("/api", matritcaRoute);

app.listen(port, () => {
  console.log(`Automate-reports-api app listening on port ${port}`);
});
