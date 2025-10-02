export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to OneSpace
        </h1>
        <p className="text-muted-foreground">
          Your workspace management platform with a beautiful sidebar
          navigation.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold">Projects</h3>
          <p className="text-sm text-muted-foreground">
            Manage your projects and track progress.
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold">Team</h3>
          <p className="text-sm text-muted-foreground">
            Collaborate with your team members.
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold">Calendar</h3>
          <p className="text-sm text-muted-foreground">
            Schedule and manage your time effectively.
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-semibold">Getting Started</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Use the sidebar to navigate between different sections of your
          workspace.
        </p>
        <ul className="space-y-2 text-sm">
          <li>• Click on the sidebar items to navigate</li>
          <li>• Use the toggle button to collapse/expand the sidebar</li>
          <li>• The sidebar is fully responsive and works on mobile</li>
        </ul>
      </div>
    </div>
  );
}
