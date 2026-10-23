import { STATUS, inputClass } from "../constant.js";

export default function Filters({ filters, onChange, members, currentUser, onNewTask }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  // With a team selected, offer its members; otherwise just "me".
  const assignees = members.length ? members : [currentUser];

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <input
        value={filters.q}
        onChange={set("q")}
        placeholder="Search tasks..."
        className={inputClass}
      />
      <select value={filters.status} onChange={set("status")} className={`${inputClass} sm:w-40`}>
        <option value="">Any status</option>
        {Object.entries(STATUS).map(([value, { label }]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      <select
        value={filters.assigneeId}
        onChange={set("assigneeId")}
        className={`${inputClass} sm:w-44`}
      >
        <option value="">Any assignee</option>
        {assignees.map((m) => (
          <option key={m.id} value={m.id}>
            {m.id === currentUser.id ? "Me" : m.name}
          </option>
        ))}
      </select>
      <button
        onClick={onNewTask}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        + New task
      </button>
    </div>
  );
}