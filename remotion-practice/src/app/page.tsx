"use client";

import { Player } from "@remotion/player";
import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { VideoComposition } from "../remotion/VideoComposition";

const Home: NextPage = () => {
  const [video1, setVideo1] = useState<File | null>(null);
  const [video2, setVideo2] = useState<File | null>(null);
  const [processedVideo, setProcessedVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setVideo: React.Dispatch<React.SetStateAction<File | null>>) => {
    const file = e.target.files?.[0];
    if (file) setVideo(file);
  };

  const processVideos = async () => {
    if (!video1 || !video2) {
      alert("Please upload two videos.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("video1", video1);
    formData.append("video2", video2);

    try {
      const response = await fetch("http://localhost:3001/process-video", {
          method: "POST",
          body: formData,
      });

      if (!response.ok) throw new Error("Failed to process video");

      const { videoUrl } = await response.json();
      console.log("Processed video URL:", videoUrl);
      setProcessedVideo(`http://localhost:3001${videoUrl}`); // ✅ Ensure absolute URL
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to process video.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Split Screen Video Processor</h1>

      <div className="grid grid-cols-2 gap-4">
        <input type="file" accept="video/mp4" onChange={(e) => handleFileChange(e, setVideo1)} className="p-2 bg-gray-700 rounded" />
        <input type="file" accept="video/mp4" onChange={(e) => handleFileChange(e, setVideo2)} className="p-2 bg-gray-700 rounded" />
      </div>

      <button
        onClick={processVideos}
        className="mt-4 px-4 py-2 bg-blue-500 rounded"
        disabled={loading}
      >
        {loading ? "Processing..." : "Generate Split-Screen Video"}
      </button>

      {processedVideo && (
        <div className="mt-6">
          <Player
            component={VideoComposition}
            inputProps={{ videoSrc: processedVideo }}
            durationInFrames={300}
            fps={30}
            compositionWidth={1280}
            compositionHeight={720}
            controls
          />
        </div>
      )}
    </div>
  );
};

export default Home;
