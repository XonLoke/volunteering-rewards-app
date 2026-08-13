import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import meRoutes from "./routes/me.routes.js";
import organiserRoutes from "./routes/organiser.routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "VR backend is running" }));

app.use("/api/auth", authRoutes);
app.use("/api/organiser", organiserRoutes);
app.use("/api/me", meRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
