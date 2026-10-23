import { useState } from "react";
import { inputClass } from "../constant.js";

export default function TeamSidebar({ teams, selectedId, onSelect, onCreate }) {
  const [name, setName] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try{
    await onCreate(name.trim());
    setName("");
    }
    catch(error){
      console.error("Failed to submit team:", error);
      alert(error.message);
    }
  };

  const itemClass = (active) =>
    `w-full rounded-lg px-3 py-2 text-left text-sm ${
      active ? "bg-indigo-50 font-medium text-indigo-700" : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <aside className="w-full shrink-0 border-b bg-white p-4 md:w-64 md:border-b-0 md:border-r">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Teams</h2>

      <div className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
        <button onClick={() => onSelect(null)} className={itemClass(selectedId === null)}>
          All teams
        </button>
        {teams.map((team) => (
          <button
            key={team.id}
            onClick={() => onSelect(team.id)}
            className={`${itemClass(selectedId === team.id)} whitespace-nowrap`}
          >
            {team.name}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-4 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New team"
          className={inputClass}
        />
        <button className="rounded-lg bg-indigo-600 px-3 text-sm text-white hover:bg-indigo-700">
          Add
        </button>
      </form>
    </aside>
  );
}