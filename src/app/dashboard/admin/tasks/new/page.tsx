import { NewTaskForm } from "./NewTaskForm";

export const metadata = {
  title: "Create Task — Simply Updify",
};

export default function NewTaskPage() {
  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Create Sprint Task</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Define task requirements, due dates, and XP values for interns.
        </p>
      </div>

      <NewTaskForm />
    </div>
  );
}
