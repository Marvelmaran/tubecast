import express from "express";
import router from "./api/youtubeRoute.js";
import cors from "cors";
const app = express();
const PORT = 3001;

app.use(cors({ origin: "*" }));

app.use("/tube", router);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
