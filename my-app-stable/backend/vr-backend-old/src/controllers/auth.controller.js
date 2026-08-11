import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/db.js";

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    console.log("Login body:", req.body);

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const rows = await query(
      `SELECT id, name, email, role, status, password_hash
       FROM users
       WHERE email = $1`,
      [email],
    );

    const user = rows[0];

    console.log("Login user:", user);

    if (!user || !user.password_hash) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log("Entered password:", password);
    console.log("Stored hash:", user.password_hash);

    const newHash = await bcrypt.hash(password, 10);
    console.log("New hash:", newHash);

    const validPassword = await bcrypt.compare(password, user.password_hash);
    console.log("Password valid:", validPassword);

    console.log("Password valid:", validPassword);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "Account is not active" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "vr-secret-key",
      { expiresIn: "7d" },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
}
