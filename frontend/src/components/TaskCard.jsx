import { STATUS } from "../constant.js";

export default function TaskCard({ task, onEdit, onDelete }) {
  const overdue = task.dueDate && <span>Due {task.dueDate}</span>

  return (
    <li className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-medium text-gray-900">{task.title}</h3>
          {task.description && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-600">{task.description}</p>
          )}
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${STATUS[task.status].badge}`}>
          {STATUS[task.status].label}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
        <span>{task.teamName}</span>
        <span>{task.assigneeName ? `Assigned to ${task.assigneeName}` : "Unassigned"}</span>
        {task.dueDate && (
          <span className={overdue ? "font-medium text-red-600" : ""}>Due {task.dueDate}</span>
        )}
        <span className="ml-auto flex gap-3">
          <button onClick={() => onEdit(task)} className="text-indigo-600 hover:underline">
            Edit
          </button>
          <button onClick={() => onDelete(task)} className="text-red-600 hover:underline">
            Delete
          </button>
        </span>
      </div>
    </li>
  );
}