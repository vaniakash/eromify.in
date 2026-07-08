# Eromify

Eromify is an all-in-one AI media platform and creator toolkit designed for building AI-generated virtual influencers, generating high-fidelity cinematic videos, and managing high-security, OTP-protected file transfers.

## Key Modules and Features

### 1. AI Influencer Studio & Creator Toolkit
* **AI Influencer Creator:** Build and customize digital personas with high detail, consistent styling, and face-preserving features.
* **AI Image Generator & Editor:** Text-to-image generator powered by models like FLUX.2 Klein 4B, FLUX.1 Kontext, and GPT Image 2, featuring outfit, lighting, and style transfer.
* **AI Video Generator:** Text-to-video and image-to-video capabilities supporting models such as Seedance 2.0, Wan 2.6, and Google Veo 3.1.
* **Instagram AutoDM Manager:** Automation workflows and dashboards for social engagement with virtual influencers.
* **Personal Media Gallery:** Integrated media library connected to Cloudinary CDN for instant media hosting.

### 2. SendLock (Secure File Transfer)
* **One-Time Passcode Protection:** Access to files is strictly protected using generated 6-digit OTP codes.
* **Automatic Deletion:** Files are instantly purged from the servers upon successful download or after a 10-minute expiry window.
* **No Account Required:** Free and private peer-to-peer file sharing supporting uploads up to 50MB.

### 3. Interactive Utility Suite
* **Resume Builder:** Dynamic editor with drag-and-drop formatting, style customization, and print/PDF export.
* **PDF Tools:** Multi-file PDF merger and document-to-PDF converters running securely in-browser.
* **Image Compressors:** Client-side sizing, compression, and WebP format converters.
* **QR Code Generator:** Custom-designed, dynamic, and standard QR codes.

---

## Technical Architecture

* **Framework:** Next.js 16 (App Router)
* **Language:** TypeScript
* **Database:** MongoDB with Mongoose ODM
* **Authentication:** NextAuth (v5 beta) supporting Google OAuth and secure email/password credentials
* **Payments:** Razorpay API integration for premium upgrades
* **Media Optimization:** Cloudinary CDN and sharp image processing
* **State Management:** Zustand for global client-side state
* **Styles:** Tailwind CSS v4, Radix UI primitives, Lucide React icons

---

## Project Structure

```
├── public/                 # Static assets, logos, and sitemaps
├── src/
│   ├── app/                # App Router routes and pages
│   │   ├── admin/          # Admin reporting and configuration
│   │   ├── api/            # API endpoints (Auth, Payments, Uploads, Stats)
│   │   ├── auth/           # OAuth and Credentials-based authentication pages
│   │   ├── explore/        # Gallery search and discovery
│   │   ├── pricing/        # Pricing plan configurations
│   │   ├── tools/          # Core creator toolkit and file utility routes
│   │   ├── globals.css     # Tailwind styling rules and custom variables
│   │   └── layout.tsx      # Core application wrapper with SEO schemas
│   ├── components/         # Reusable react components and UI structures
│   ├── lib/                # Database clients, Cloudinary configuration, image libraries
│   ├── models/             # Mongoose schemas (User, InstagramLog, Payment, GalleryImage)
│   ├── auth.ts             # NextAuth authentication config and providers
│   └── middleware.ts       # Route protection and redirection middleware
├── package.json            # Workspace dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

---

## Environment Setup

Create a `.env.local` file in the root directory and configure the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://...

# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudinary Integration
CLOUDINARY_URL=cloudinary://...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Razorpay Integration
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# OpenAI API Key (Image Generation)
OPENAI_API_KEY=your-openai-key
```

---

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application in the browser.

3. **Production Build:**
   ```bash
   npm run build
   npm run start
   ```

