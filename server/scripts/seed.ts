import bcrypt from "bcryptjs";
import { supabase } from "../supabase";
import { defaultSiteContent } from "../../src/data/siteContent";
import { coursesData } from "../../src/data/courses";

const DEFAULT_SUBJECTS = ["Theory", "Practical", "Project Work", "Viva"];

async function seedSettings() {
  const rows = [
    { key: "pass_percentage", value: 35 },
    {
      key: "org",
      value: {
        name: "Skywaves Educare",
        logoUrl: defaultSiteContent.meta.logoUrl,
        signatureRole: "Director",
        place: "New Delhi",
      },
    },
  ];
  const { error } = await supabase.from("settings").upsert(rows, { onConflict: "key" });
  if (error) throw error;
  console.log("seeded settings");
}

async function seedCoursesAndSubjects(): Promise<Map<string, string>> {
  const slugToCourseId = new Map<string, string>();

  const { count } = await supabase
    .from("courses")
    .select("*", { count: "exact", head: true });

  if (count && count > 0) {
    console.log("courses already exist, mapping by name");
    const { data } = await supabase.from("courses").select("id, course_name");
    const byName = new Map((data ?? []).map((c) => [c.course_name as string, c.id as string]));
    for (const c of coursesData) {
      const id = byName.get(c.title);
      if (id) slugToCourseId.set(c.id, id);
    }
    return slugToCourseId;
  }

  for (const c of coursesData) {
    const { data, error } = await supabase
      .from("courses")
      .insert({ course_name: c.title, duration: "6 Months", status: "active" })
      .select("id")
      .single();
    if (error) throw error;
    slugToCourseId.set(c.id, data.id as string);

    const subjectRows = DEFAULT_SUBJECTS.map((name, i) => ({
      course_id: data.id,
      subject_name: name,
      min_marks: 35,
      max_marks: 100,
      display_order: i,
    }));
    const { error: subErr } = await supabase.from("subjects").insert(subjectRows);
    if (subErr) throw subErr;
  }
  console.log(`seeded ${coursesData.length} courses with subjects`);
  return slugToCourseId;
}

async function seedContent(slugToCourseId: Map<string, string>) {
  const content = JSON.parse(JSON.stringify(defaultSiteContent)) as typeof defaultSiteContent;
  content.marketingCourses = content.marketingCourses.map((m) => ({
    ...m,
    academicCourseId: slugToCourseId.get(m.id) ?? null,
  }));

  const rows = Object.entries(content).map(([key, data]) => ({ key, data }));
  const { error } = await supabase.from("site_content").upsert(rows, { onConflict: "key" });
  if (error) throw error;
  console.log(`seeded ${rows.length} site_content keys`);
}

async function seedAdmin() {
  const username = process.env.SEED_ADMIN_USERNAME ?? "admin";
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password) {
    console.warn("SEED_ADMIN_PASSWORD not set, skipping admin seed");
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const { data: existing } = await supabase
    .from("admin_users")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("admin_users")
      .update({ password_hash: passwordHash, role: "superadmin", is_active: true, deleted_at: null })
      .eq("username", username);
    if (error) throw error;
    console.log(`admin '${username}' already existed, password reset`);
    return;
  }

  const { error } = await supabase.from("admin_users").insert({
    username,
    password_hash: passwordHash,
    display_name: "Administrator",
    role: "superadmin",
  });
  if (error) throw error;
  console.log(`seeded admin user '${username}'`);
}

async function main() {
  await seedSettings();
  const map = await seedCoursesAndSubjects();
  await seedContent(map);
  await seedAdmin();
  console.log("seed complete");
}

main().catch((err) => {
  console.error("seed failed:", err);
  process.exit(1);
});
