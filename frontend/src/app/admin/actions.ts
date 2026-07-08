"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function loginAdmin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (email === "akashrana49927@gmail.com" && password === "MASTER") {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    redirect("/admin");
  }
  return;
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin/login");
}

export async function toggleProStatus(userId: string, currentStatus: boolean) {
  await connectDB();
  await User.findByIdAndUpdate(userId, { isPro: !currentStatus });
  revalidatePath("/admin/users");
}

export async function giveCredits(formData: FormData) {
  const identifier = (formData.get("identifier") as string)?.trim();
  const amount = parseInt(formData.get("amount") as string, 10);

  if (!identifier || isNaN(amount) || amount <= 0) return;

  await connectDB();

  // Support both email and userId
  const isEmail = identifier.includes("@");
  const filter = isEmail
    ? { email: identifier.toLowerCase() }
    : { _id: identifier };

  await User.updateOne(filter, { $inc: { credits: amount } });
  revalidatePath("/admin/users");
}

export async function giveCreditsToUser(userId: string, amount: number) {
  if (!userId || isNaN(amount) || amount <= 0) return;
  await connectDB();
  await User.findByIdAndUpdate(userId, { $inc: { credits: amount } });
  revalidatePath("/admin/users");
}

export async function reduceCredits(formData: FormData) {
  const identifier = (formData.get("identifier") as string)?.trim();
  const amount = parseInt(formData.get("amount") as string, 10);

  if (!identifier || isNaN(amount) || amount <= 0) return;

  await connectDB();

  const isEmail = identifier.includes("@");
  const filter = isEmail
    ? { email: identifier.toLowerCase() }
    : { _id: identifier };

  // Fetch current credits, compute new value in JS (floor at 0), then plain $set
  const user = await User.findOne(filter).select("credits").lean();
  const current = (user as { credits?: number } | null)?.credits ?? 0;
  const newCredits = Math.max(current - amount, 0);
  await User.updateOne(filter, { $set: { credits: newCredits } });
  revalidatePath("/admin/users");
}

export async function reduceCreditsFromUser(userId: string, amount: number) {
  if (!userId || isNaN(amount) || amount <= 0) return;
  await connectDB();
  // Fetch current credits, compute new value in JS (floor at 0), then plain $set
  const user = await User.findById(userId).select("credits").lean();
  const current = (user as { credits?: number } | null)?.credits ?? 0;
  const newCredits = Math.max(current - amount, 0);
  await User.findByIdAndUpdate(userId, { $set: { credits: newCredits } });
  revalidatePath("/admin/users");
}
