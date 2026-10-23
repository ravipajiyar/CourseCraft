const path = require("path");
const dotenv = require("dotenv");

// Local development keeps its values in server/config.env. In production
// (Render) the same values arrive as real environment variables and this
// file does not exist — a missing file is therefore not an error.
//
// This MUST run before ./app is required: the controllers read
// process.env while they are being loaded.
dotenv.config({ path: path.join(__dirname, "config.env") });

const app = require("./app");
const mongoose = require("mongoose");

const rawDatabase = process.env.DATABASE || process.env.MONGODB_URI || "";

// DATABASE may contain a <PASSWORD> placeholder (see config.env) that gets
// substituted with DATABASE_PASSWORD. Atlas passwords contain characters
// that are not URL safe, so encode them.
const DB = rawDatabase.includes("<PASSWORD>")
  ? rawDatabase.replace(
      "<PASSWORD>",
      encodeURIComponent(process.env.DATABASE_PASSWORD || "")
    )
  : rawDatabase;

if (!DB) {
  console.error(
    "FATAL: no database connection string. Set DATABASE (or MONGODB_URI) in the environment."
  );
  process.exit(1);
}

mongoose
  .connect(DB)
  .then(() => {
    console.log("Connected to database...");
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });

const port = process.env.PORT || 8000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Listening on port ${port}`);
});
