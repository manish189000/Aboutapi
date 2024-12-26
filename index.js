const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// MongoDB Connection
mongoose
  .connect("mongodb+srv://manish:manish@textimage.51yzs.mongodb.net/?retryWrites=true&w=majority")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Schema and Model
const ContentSchema = new mongoose.Schema({
  headerText: String,
  descriptionText: String,
  paragraphs: [String],
  imageUrl: String,
});
const Content = mongoose.model("Content", ContentSchema);

// Create uploads folder if not exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer setup for file uploads with dynamic folder creation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = path.join(uploadsDir, "images");
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// API Endpoints
app.get("/content", async (req, res) => {
  const content = await Content.findOne();
  res.json(content);
});

app.post("/content", async (req, res) => {
  const { headerText, descriptionText, paragraphs, imageUrl } = req.body;
  const content = await Content.findOne();
  if (content) {
    content.headerText = headerText;
    content.descriptionText = descriptionText;
    content.paragraphs = paragraphs;
    content.imageUrl = imageUrl;
    await content.save();
  } else {
    await Content.create({ headerText, descriptionText, paragraphs, imageUrl });
  }
  res.json({ success: true });
});

app.post("/upload", upload.single("image"), (req, res) => {
  res.json({ imageUrl: `/uploads/images/${req.file.filename}` });
});

app.listen(5000, () => console.log("Server running on port 5000"));
