"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/**
 * LOGIN
 */
export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/login?error=" + encodeURIComponent(error.message));
  }

  // Ensure user exists in Prisma database
  if (data.user) {
    await prisma.user.upsert({
      where: { id: data.user.id },
      update: {
        email: data.user.email!,
      },
      create: {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name || data.user.email!.split('@')[0],
      },
    });
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/**
 * SIGNUP
 */
export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  // 1. Create user in Supabase Auth
  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    redirect("/signup?error=" + encodeURIComponent(error.message));
  }

  // 2. Sync user with Prisma (SAFE + IDEMPOTENT)
  if (authData.user) {
    await prisma.user.upsert({
      where: { email },
      update: {
        id: authData.user.id, // re-link if recreated
        name,
      },
      create: {
        id: authData.user.id,
        email,
        name,
      },
    });
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
 