import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { adminApi } from "../../lib/api/admin";
import { PageHeader, Spinner, ErrorBanner, Button, Field, inputClass } from "../components/ui";

export default function SettingsPage() {
  const [passPercentage, setPassPercentage] = useState("35");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .listSettings()
      .then((res) => {
        const pass = res.settings.find((s) => s.key === "pass_percentage");
        if (pass) setPassPercentage(String(pass.value));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await adminApi.saveSetting("pass_percentage", Number(passPercentage));
      setMessage("Settings saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure institution-wide preferences" />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-lg flex flex-col gap-4">
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
        {error && <ErrorBanner message={error} />}
        {message && <p className="text-green-600 text-sm">{message}</p>}
        <div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
