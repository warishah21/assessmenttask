import { useEffect, useState } from "react";
import { teamsApi, tasksApi } from "../api.js";
import { STATUS, inputClass } from "../constant.js";

export default function TaskModal({ task, teams, defaultTeamId, onClose, onSaved }) {
  const isEdit = Boolean(task);
  const [form, setForm] = useState({
    teamId: task?.teamId ?? defaultTeamId ?? teams[0]?.id ?? "",
    title: task?.title ?? "",
    description: task?.description ?? "",
    status: task?.status ?? "todo",
    dueDate: task?.dueDate ?? "",
    assigneeId: task?.assigneeId ?? "",
  });
  const [members, setMembers] = useState([]);
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  // Load the selected team's members for the assignee dropdown
  useEffect(() => {
    if (!form.teamId) return;
    teamsApi
      .get(form.teamId)
      .then((data) => setMembers(data.members))
      .catch(() => setMembers([]));
  }, [form.teamId]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const changeTeam = (e) =>
    setForm((f) => ({ ...f, teamId: Number(e.target.value), assigneeId: "" }));

  const submit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSaving(true);
    const payload = {
      title: form.title,
      description: form.description,
      status: form.status,
      dueDate: form.dueDate || null,
      assigneeId: form.assigneeId ? Number(form.assigneeId) : null,
    };
    try {
      if (isEdit) await tasksApi.update(task.id, payload);
      else await tasksApi.create({ ...payload, teamId: Number(form.teamId) });
      onSaved();
    } catch (err) {
      setErrors(err.details?.length ? err.details : [err.message]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-10 grid place-items-center bg-black/40 p-4">
      <form
        onSubmit={submit}
        className="max-h-full w-full max-w-lg space-y-3 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold">{isEdit ? "Edit task" : "New task"}</h2>

        <select
          value={form.teamId}
          onChange={changeTeam}
          disabled={isEdit}
          className={inputClass}
          required
        >
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <input
          value={form.title}
          onChange={set("title")}
          placeholder="Title"
          className={inputClass}
          required
        />
        <textarea
          value={form.description}
          onChange={set("description")}
          placeholder="Description"
          rows={3}
          className={inputClass}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <select value={form.status} onChange={set("status")} className={inputClass}>
            {Object.entries(STATUS).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <input type="date" value={form.dueDate} onChange={set("dueDate")} className={inputClass} />
          <select value={form.assigneeId} onChange={set("assigneeId")} className={inputClass}>
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {errors.length > 0 && (
          <ul className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {errors.map((msg) => <li key={msg}>{msg}</li>)}
          </ul>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}