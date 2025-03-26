const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

ffmpeg.setFfmpegPath("/opt/homebrew/bin/ffmpeg");

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Ensure "uploads" directory exists
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Save files in "uploads"
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Video processing route
app.post("/process-video", upload.fields([{ name: "video1" }, { name: "video2" }]), async (req, res) => {
    if (!req.files || !req.files.video1 || !req.files.video2) {
        return res.status(400).json({ error: "Please upload two videos." });
    }

    const video1Path = req.files.video1[0].path;
    const video2Path = req.files.video2[0].path;
    const outputPath = `outputs/split-screen-${Date.now()}.mp4`;

    if (!fs.existsSync("outputs")) fs.mkdirSync("outputs");

    ffmpeg()
        .input(video1Path)
        .input(video2Path)
        .complexFilter([
            "[0:v]scale=iw/2:ih[left];[1:v]scale=iw/2:ih[right];[left][right]hstack"
        ])
        .output(outputPath)
        .on("end", () => {
            console.log("Processing complete!");
            res.json({ videoUrl: `/outputs/${path.basename(outputPath)}` }); // ✅ Send JSON response
        })
        .on("error", (err) => {
            console.error("FFmpeg Error:", err);
            res.status(500).json({ error: "Video processing failed." });
        })
        .run();
});

// Serve processed videos
app.use("/outputs", express.static("outputs"));

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
