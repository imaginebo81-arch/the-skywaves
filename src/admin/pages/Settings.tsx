import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { adminApi } from "../../lib/api/admin";
import { PageHeader, Spinner, ErrorBanner, Button, Field, inputClass } from "../components/ui";

const SOCIAL_PLATFORMS = [
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "youtube", label: "YouTube" },
  { key: "twitter", label: "Twitter / X" },
  { key: "linkedin", label: "LinkedIn" },
];

const EMPTY_SOCIAL = { facebook: "", instagram: "", youtube: "", twitter: "", linkedin: "" };

export default function SettingsPage() {
  const [passPercentage, setPassPercentage] = useState("35");
  const [passingGrade, setPassingGrade] = useState("D");
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>(EMPTY_SOCIAL);
  const [loading, setLoading] = useState(true);
  const [savingPercent, setSavingPercent] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messagePercent, setMessagePercent] = useState<string | null>(null);
  const [messageSocial, setMessageSocial] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .listSettings()
      .then((res) => {
        const pass = res.settings.find((s) => s.key === "pass_percentage");
        if (pass) setPassPercentage(String(pass.value));
        const grade = res.settings.find((s) => s.key === "passing_grade");
        if (grade) setPassingGrade(String(grade.value).replace(/"/g, ""));
        const social = res.settings.find((s) => s.key === "social_links");
        if (social && typeof social.value === "object" && social.value !== null) {
          setSocialLinks({ ...EMPTY_SOCIAL, ...(social.value as Record<string, string>) });
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleSavePercent = async () => {
    setSavingPercent(true);
    setError(null);
    setMessagePercent(null);
    try {
      await adminApi.saveSetting("pass_percentage", Number(passPercentage));
      await adminApi.saveSetting("passing_grade", passingGrade.trim().toUpperCase() || "D");
      setMessagePercent("Saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSavingPercent(false);
    }
  };

  const handleSaveSocial = async () => {
    setSavingSocial(true);
    setError(null);
    setMessageSocial(null);
    try {
      await adminApi.saveSetting("social_links", socialLinks);
      setMessageSocial("Social links saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSavingSocial(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Settings" subtitle="Configure institution-wide preferences" />

      {error && <ErrorBanner message={error} />}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-lg flex flex-col gap-4">
        <h2 className="font-semibold text-gray-800 text-lg">Grading &amp; Pass Criteria</h2>
        <Field label="Overall Pass Percentage">
          <input
            type="number"
            min={0}
            max={100}
            className={inputClass}
            value={passPercentage}
            onChange={(e) => setPassPercentage(e.target.value)}
          />
        </Field>
        <p className="text-xs text-gray-500">
          A student passes only if every subject meets its minimum marks and the overall percentage meets this threshold.
        </p>
        <Field label="Passing Grade (for Grade Cards)">
          <input
            type="text"
            maxLength={3}
            className={inputClass}
            placeholder="e.g. D"
            value={passingGrade}
            onChange={(e) => setPassingGrade(e.target.value)}
          />
        </Field>
        <p className="text-xs text-gray-500">
          Students with this grade or above (A+, A, B+, B, C, D, F) on a grade card are considered passing.
        </p>
        {messagePercent && <p className="text-green-600 text-sm">{messagePercent}</p>}
        <div>
          <Button onClick={handleSavePercent} disabled={savingPercent}>
            {savingPercent ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {savingPercent ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-lg flex flex-col gap-4">
        <h2 className="font-semibold text-gray-800 text-lg">Social Media Links</h2>
        <p className="text-xs text-gray-500">Shown in the website footer. Leave blank to hide an icon.</p>
        {SOCIAL_PLATFORMS.map(({ key, label }) => (
          <Field key={key} label={label}>
            <input
              type="url"
              className={inputClass}
              placeholder={`https://...`}
              value={socialLinks[key] ?? ""}
              onChange={(e) => setSocialLinks((prev) => ({ ...prev, [key]: e.target.value }))}
            />
          </Field>
        ))}
        {messageSocial && <p className="text-green-600 text-sm">{messageSocial}</p>}
        <div>
          <Button onClick={handleSaveSocial} disabled={savingSocial}>
            {savingSocial ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {savingSocial ? "Saving..." : "Save Social Links"}
          </Button>
        </div>
      </div>
    </div>
  );
}
