import { Settings, Shield, User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Portal Settings — Simply Updify",
};

export default function AdminSettingsPage() {
  return (
    <div className="space-y-5 max-w-[1000px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Portal Settings</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Configure global parameters, security guidelines, and integration webhooks.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="fluent-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-[hsl(var(--primary))]" />
            <h3 className="text-xs font-semibold">Account Profile</h3>
          </div>
          <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Configure your administrator profile, avatars, and signatures.</p>
          <Button variant="outline" size="sm" className="h-7 rounded text-[10px]">Manage</Button>
        </div>
        <div className="fluent-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[hsl(var(--primary))]" />
            <h3 className="text-xs font-semibold">Security Policies</h3>
          </div>
          <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Manage access tokens, session expirations, and MFA parameters.</p>
          <Button variant="outline" size="sm" className="h-7 rounded text-[10px]">Configure</Button>
        </div>
        <div className="fluent-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-[hsl(var(--primary))]" />
            <h3 className="text-xs font-semibold">Notifications</h3>
          </div>
          <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Setup Resend email templates and Slack webhook alerts.</p>
          <Button variant="outline" size="sm" className="h-7 rounded text-[10px]">Configure</Button>
        </div>
      </div>
    </div>
  );
}
