import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthenticateContext.jsx";
import { teamsApi, tasksApi } from "../api.js";
import TeamSidebar from "../components/TeamSidebar.jsx";
import Filters from "../components/Filters.jsx";
import TaskCard from "../components/TaskCard.jsx";
import TaskModal from "../components/TaskModal.jsx";
import MembersPanel from "../components/MembersPanel.jsx";

const EMPTY_FILTERS = { q: "", status: "", assigneeId: "" };

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null); 
  const [teamDetail, setTeamDetail] = useState(null); 
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [modal, setModal] = useState(null); 
  const [error, setError] = useState("");

  const loadTeams = useCallback(
    () => teamsApi.list().then((d) => setTeams(d.teams)).catch((e) => setError(e.message)),
    []
  );

  
  useEffect(() => { loadTeams(); }, [loadTeams]);

 
  useEffect(() => {
    setFilters((f) => ({ ...f, assigneeId: "" }));
    if (!selectedTeamId) return setTeamDetail(null);
    teamsApi.get(selectedTeamId).then(setTeamDetail).catch((e) => setError(e.message));
  }, [selectedTeamId]);

  const loadTasks = useCallback(
    () =>
      tasksApi
        .list({ teamId: selectedTeamId, ...filters })
        .then((d) => setTasks(d.tasks))
        .catch((e) => setError(e.message)),
    [selectedTeamId, filters]
  );

  useEffect(() => {
    const timer = setTimeout(loadTasks, 300);
    return () => clearTimeout(timer);
  }, [loadTasks]);

  const createTeam = async (name) => {
    const { team } = await teamsApi.create(name);
    await loadTeams();
    setSelectedTeamId(team.id);
  };

  const deleteTeam = async () => {
    if (!window.confirm(`Delete "${teamDetail?.team?.name || 'this team'}" and all its tasks?`)) return;
    try{
    await teamsApi.remove(selectedTeamId);
    setSelectedTeamId(null);
    loadTeams();
    }
    catch(err){
       console.error("Failed to delete the team:", error);
       alert("Could not delete the team. Please try again.");
    }
  };

  const addMember = async (email) => {
    const data = await teamsApi.addMember(selectedTeamId, email);
    setTeamDetail((d) => ({ ...d, members: data.members }));
    return data.message;
  };

  const deleteTask = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      await tasksApi.remove(task.id);
      loadTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const onSaved = () => {
    setModal(null);
    loadTasks();
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="flex items-center justify-between bg-white px-4 py-3 shadow-sm sm:px-6">
        <h1 className="font-semibold text-gray-900">Team Task Manager</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-gray-600 sm:inline">{user.name}</span>
          <button onClick={logout} className="rounded-lg border px-3 py-1 hover:bg-gray-100">
            Log out
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row">
        <TeamSidebar
          teams={teams}
          selectedId={selectedTeamId}
          onSelect={setSelectedTeamId}
          onCreate={createTeam}
        />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" onClick={() => setError("")}>
              {error}
            </p>
          )}

          {teamDetail && (
            <MembersPanel
              team={teamDetail.team}
              members={teamDetail.members}
              onAddMember={addMember}
              onDeleteTeam={deleteTeam}
            />
          )}

          {teams.length === 0 ? (
            <p className="text-gray-600">Create your first team in the sidebar to get started.</p>
          ) : (
            <>
              <Filters
                filters={filters}
                onChange={setFilters}
                members={teamDetail?.members ?? []}
                currentUser={user}
                onNewTask={() => setModal({})}
              />

              {tasks.length === 0 ? (
                <p className="py-8 text-center text-gray-500">No tasks match.</p>
              ) : (
                <ul className="grid gap-3 lg:grid-cols-2">
                  {tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={(t) => setModal({ task: t })}
                      onDelete={deleteTask}
                    />
                  ))}
                </ul>
              )}
            </>
          )}
        </main>
      </div>

      {modal && (
        <TaskModal
          task={modal.task}
          teams={teams}
          defaultTeamId={selectedTeamId}
          onClose={() => setModal(null)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}