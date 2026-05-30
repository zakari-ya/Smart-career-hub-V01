import { requireSupabaseBrowserClient } from "@/lib/supabase/client";

const bucketName = "resumes";

export async function uploadResumeFile(filePath: string, file: File, contentType = file.type) {
  const client = requireSupabaseBrowserClient();

  const { data, error } = await client.storage.from(bucketName).upload(filePath, file, {
    upsert: false,
    contentType: contentType || "application/octet-stream"
  });

  return { data, error };
}

export async function createSignedResumeUrl(path: string) {
  const client = requireSupabaseBrowserClient();

  const { data, error } = await client.storage.from(bucketName).createSignedUrl(path, 60);

  return { data, error };
}
