export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>
      <p className="text-muted-foreground">
        Configure your preferences and account settings.
      </p>
      
      <div className="mt-8 space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Account Settings</h3>
          <div className="grid gap-4">
            <div className="p-4 rounded-lg border border-border bg-card">
              <h4 className="font-medium text-foreground">Profile</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Update your profile information and preferences.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <h4 className="font-medium text-foreground">Notifications</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your notification preferences.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <h4 className="font-medium text-foreground">Privacy</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Control your privacy settings and data sharing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}