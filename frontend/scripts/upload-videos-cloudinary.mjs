import { v2 as cloudinary } from "cloudinary";
import { readFileSync, existsSync } from "fs";
import { resolve, basename } from "path";

// Manually load .env.local
const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
  }
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const videosToUpload = [
  "./public/seefour.mp4",
  "./public/seedancesix.mp4",
  "./public/seedance.mp4",
  "./public/sedanc.mp4",
  "./public/seedancesss.mp4",
  "./public/videos/Video-218.mp4",
  "./public/videos/Video-420.mp4",
  "./public/videos/Video-480.mp4",
  "./public/videos/Video-525.mp4",
];

async function uploadVideo(filePath) {
  const name = basename(filePath, ".mp4");
  console.log(`⬆️  Uploading ${filePath}...`);
  
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        resource_type: "video",
        folder: "eromify/homepage",
        public_id: name,
        overwrite: true,
        transformation: [
          { quality: "auto", fetch_format: "auto" }
        ],
      },
      (error, result) => {
        if (error) {
          console.error(`❌ Failed ${filePath}:`, error.message);
          reject(error);
        } else {
          console.log(`✅ Done: ${result.secure_url}`);
          resolve({ name, url: result.secure_url, publicId: result.public_id });
        }
      }
    );
  });
}

async function main() {
  console.log("🚀 Starting video upload to Cloudinary...\n");
  const results = [];

  for (const videoPath of videosToUpload) {
    const fullPath = resolve(process.cwd(), videoPath);
    if (!existsSync(fullPath)) {
      console.warn(`⚠️  Skipping (not found): ${videoPath}`);
      continue;
    }
    try {
      const result = await uploadVideo(fullPath);
      results.push(result);
    } catch (e) {
      console.error(`Failed: ${videoPath}`);
    }
  }

  console.log("\n\n📋 Copy these URLs into your page.tsx:\n");
  console.log("const CLOUDINARY_VIDEOS = {");
  for (const r of results) {
    // Generate optimized URL with auto quality & format
    const optimizedUrl = r.url
      .replace("/upload/", "/upload/q_auto,f_auto/");
    console.log(`  "${r.name}": "${optimizedUrl}",`);
  }
  console.log("};");
}

main();
