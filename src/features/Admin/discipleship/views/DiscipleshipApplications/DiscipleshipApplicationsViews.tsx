import { DISCIPLESHIP_APPLICATIONS_UI } from "../../models/constants/groupsScheduleViews.constants";

export function DiscipleshipApplicationsViews() {
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl text-midnight-teal">
        {DISCIPLESHIP_APPLICATIONS_UI.title}
      </h1>
      <p className="text-sm text-midnight-teal/70">
        {DISCIPLESHIP_APPLICATIONS_UI.description}
      </p>
    </div>
  );
}

export default DiscipleshipApplicationsViews;
