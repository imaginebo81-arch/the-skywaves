import { useEffect, useState } from "react";
import { RotateCcw, Save, Loader2 } from "lucide-react";
import { adminApi } from "../../lib/api/admin";
import { PageHeader, Spinner, ErrorBanner, Button, ConfirmDialog, StatusBadge } from "../components/ui";

interface KeyInfo {
  key: string;
  isDefault: boolean;
  updatedAt: string | null;
}

export default function WebsiteContent() {
  const [keys, setKeys] = useState<KeyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [editorValue, setEditorValue] = useState("");
  const [editorLoading, setEditorLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmRestore, setConfirmRestore] = useState(false);

  const loadKeys = () => {
    adminApi
      .listContentKeys()
      .then((res) => setKeys(res.keys))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load content"))
      .finally(() => setLoading(false));
  };

  useEffect(loadKeys, []);

  const openKey = async (key: string) => {
    setSelectedKey(key);
    setEditorError(null);
    setMessage(null);
    setEditorLoading(true);
    try {
      const res = await adminApi.getContent(key);
      setEditorValue(JSON.stringify(res.data, null, 2));
    } catch (e) {
      setEditorError(e instanceof Error ? e.message : "Failed to load content");
    } finally {
      setEditorLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedKey) return;
    setEditorError(null);
    setMessage(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(editorValue);
    } catch {
      setEditorError("Content must be valid JSON");
      return;
    }
    setSaving(true);
    try {
      await adminApi.saveContent(selectedKey, parsed);
      setMessage("Saved. Changes are live on the website.");
      loadKeys();
    } catch (e) {
      setEditorError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedKey) return;
    await adminApi.restoreContent(selectedKey);
    setConfirmRestore(false);
    setMessage("Restored to default content.");
    await openKey(selectedKey);
    loadKeys();
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div>
      <PageHeader title="Website Content" subtitle="Edit the content shown on the public website" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 h-max">
          {keys.map((k) => (
            <button
              key={k.key}
              onClick={() => openKey(k.key)}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                selectedKey === k.key ? "bg-orange-50 text-[#b9791a]" : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <span className="font-medium text-sm capitalize">{k.key.replace(/\./g, " / ")}</span>
              <StatusBadge status={k.isDefault ? "default" : "active"} />
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {!selectedKey ? (
            <p className="text-gray-400 text-center py-16">Select a content section to edit.</p>
          ) : editorLoading ? (
            <Spinner />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900 capitalize">{selectedKey.replace(/\./g, " / ")}</h2>
                <Button variant="secondary" onClick={() => setConfirmRestore(true)}><RotateCcw size={16} /> Restore Default</Button>
              </div>
              <textarea
                className="w-full rounded-lg border border-gray-300 p-3 font-mono text-xs outline-none focus:border-[#eaa320] h-[420px] resize-y"
                value={editorValue}
                onChange={(e) => setEditorValue(e.target.value)}
                spellCheck={false}
              />
              {editorError && <ErrorBanner message={editorError} />}
              {message && <p className="text-green-600 text-sm">{message}</p>}
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? "Saving..." : "Save Content"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmRestore}
        title="Restore Default Content"
        message="This removes your custom content for this section and reverts to the built-in default. This cannot be undone."
        confirmLabel="Restore Default"
        destructive
        onConfirm={handleRestore}
        onCancel={() => setConfirmRestore(false)}
      />
    </div>
  );
}
