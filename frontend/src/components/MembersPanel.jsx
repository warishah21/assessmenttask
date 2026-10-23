import { useState } from "react";
import { inputClass } from "../constant.js";

export default function MembersPanel({ team, members, onAddMember, onDeleteTeam }) {
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      setNotice(await onAddMember(email));
      setEmail("");
    } catch (err) {
      setNotice(err.details?.[0] || err.message);
    }
  };

   if (!team) {
    return (
      <section className="rounded-xl bg-white p-4 shadow-sm text-gray-500 text-sm">
        Loading team data...
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">{team.name}</h2>
        <button onClick={onDeleteTeam} className="text-sm text-red-600 hover:underline">
          Delete team
        </button>
      </div>

      <ul className="mt-3 flex flex-wrap gap-2">
        {members.map((m) => (
           <li key={m?.id} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
            {m?.name || "Unknown Member"}
          </li>
        ))}
      </ul>

      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Add member by email"
          className={inputClass}
          required
        />
        <button className="rounded-lg bg-gray-900 px-3 text-sm text-white">Add</button>
      </form>
      {notice && <p className="mt-2 text-xs text-gray-600">{notice}</p>}
    </section>
  );
}