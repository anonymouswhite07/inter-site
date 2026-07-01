"use client";

import { useState, useEffect } from "react";
import { Settings, Shield, User, Bell, Loader2, Save, Globe, AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getSettingsAction, saveSettingsAction } from "@/lib/actions/portal";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings State variables
  const [appName, setAppName] = useState("Simply Updify");
  const [allowedDomains, setAllowedDomains] = useState("*");
  const [senderEmail, setSenderEmail] = useState("onboarding@resend.dev");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    getSettingsAction()
      .then((res) => {
        if (res.success && res.settings) {
          setAppName(res.settings.appName || "Simply Updify");
          setAllowedDomains(res.settings.allowedDomains || "*");
          setSenderEmail(res.settings.senderEmail || "onboarding@resend.dev");
          setMaintenanceMode(res.settings.maintenanceMode || false);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await saveSettingsAction({
        appName,
        allowedDomains,
        senderEmail,
        maintenanceMode,
      });

      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Failed to connect to the configuration registry.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent" />
        <p>Loading portal configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-[800px] mx-auto select-none">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Portal Configuration Settings</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Configure global workspace parameters, notification configurations, and security variables.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        
        {/* General Workspace Settings */}
        <div className="fluent-card p-5 space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <Globe className="h-4.5 w-4.5 text-[hsl(var(--primary))]" />
            <h3 className="text-xs font-semibold">General Workspace Properties</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="appName" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Platform / Portal Name
              </Label>
              <Input
                id="appName"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="e.g. Simply Updify Portal"
                className="fluent-input h-8 text-xs mt-1"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="allowedDomains" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Allowed Joining Domains
              </Label>
              <Input
                id="allowedDomains"
                value={allowedDomains}
                onChange={(e) => setAllowedDomains(e.target.value)}
                placeholder="e.g. * or @simplyupdify.app"
                className="fluent-input h-8 text-xs mt-1"
                required
              />
            </div>
          </div>
        </div>

        {/* Email notifications Integration */}
        <div className="fluent-card p-5 space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <Bell className="h-4.5 w-4.5 text-[hsl(var(--primary))]" />
            <h3 className="text-xs font-semibold">Resend Email Integration Settings</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1 max-w-[360px]">
              <Label htmlFor="senderEmail" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Default Onboarding Sender address
              </Label>
              <Input
                id="senderEmail"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="e.g. onboarding@resend.dev"
                className="fluent-input h-8 text-xs mt-1"
                required
              />
              <p className="text-[9px] text-[hsl(var(--muted-foreground))] mt-1 leading-normal">
                Must match a domain verified in your Resend Dashboard account settings.
              </p>
            </div>
          </div>
        </div>

        {/* Security and Lockdowns */}
        <div className="fluent-card p-5 space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <Shield className="h-4.5 w-4.5 text-[hsl(var(--primary))]" />
            <h3 className="text-xs font-semibold">Security Controls</h3>
          </div>

          <div className="flex items-start justify-between p-3.5 rounded border border-red-200 dark:border-red-950 bg-red-500/5 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <AlertOctagon className="h-3.5 w-3.5" /> Maintenance Mode Lockdown
              </span>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))] max-w-[460px]">
                Immediately locks all non-administrator users out of the workspace. Toggle only during server migration operations.
              </p>
            </div>

            <Button
              type="button"
              variant={maintenanceMode ? "destructive" : "outline"}
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className="h-8 text-[10px] rounded px-3.5 font-bold uppercase transition-all duration-150"
            >
              {maintenanceMode ? "Lockdown Enabled 🛑" : "Disabled 🟢"}
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="submit"
            disabled={saving}
            className="h-8 rounded bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary-hover))] text-xs font-semibold px-5 flex items-center gap-1.5"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save Portal Settings
          </Button>
        </div>

      </form>
    </div>
  );
}
