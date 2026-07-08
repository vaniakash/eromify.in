const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

// ── Credentials (new Cloudinary account: nxg2vmmu) ──
cloudinary.config({
  cloud_name: "nxg2vmmu",
  api_key: "258184816278679",
  api_secret: "rcA3VBGzAnL13ll7ft0dXkeoBL8",
});

const FOLDER = path.join(__dirname, "frontend/public/modie");
const CLOUDINARY_FOLDER = "modie"; // folder name in Cloudinary

async function uploadAll() {
  const files = fs.readdirSync(FOLDER).filter((f) =>
    /\.(png|jpg|jpeg|webp|gif)$/i.test(f)
  );

  console.log(`\n🚀 Uploading ${files.length} images to Cloudinary (nxg2vmmu)...\n`);

  const results = [];

  for (const file of files) {
    const filePath = path.join(FOLDER, file);
    const publicId = path.basename(file, path.extname(file)); // e.g. "alia"

    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: CLOUDINARY_FOLDER,
        public_id: publicId,
        overwrite: true,
        resource_type: "image",
      });

      console.log(`✅ ${file}`);
      console.log(`   URL: ${result.secure_url}`);
      console.log(`   Public ID: ${result.public_id}`);
      console.log(`   Size: ${(result.bytes / 1024).toFixed(1)} KB | ${result.width}x${result.height} | ${result.format}\n`);

      results.push({ file, url: result.secure_url, public_id: result.public_id });
    } catch (err) {
      console.error(`❌ Failed: ${file} — ${err.message}`);
    }
  }

  console.log("\n══════════════════════════════════════════");
  console.log(`🎉 Done! ${results.length}/${files.length} images uploaded to Cloudinary folder: "${CLOUDINARY_FOLDER}"`);
  console.log("══════════════════════════════════════════\n");
  console.log("📋 Summary of uploaded URLs:");
  results.forEach((r) => console.log(`  ${r.file} → ${r.url}`));
}

uploadAll();
