import { useState } from "react";
import { useAuth } from "../context/AuthenticateContext.jsx";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const isLogin = mode === "login";

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const switchMode = () => {
    setMode(isLogin ? "register" : "login");
    setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      if (isLogin) {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }
    } catch (err) {
      setErrors(err.details?.length ? err.details : [err.message]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-semibold text-gray-900">
          {isLogin ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">Team Task Manager</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {!isLogin && (
            <input
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              className={inputClass}
              required
            />
          )}
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className={inputClass}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password (min 8 characters)"
            value={form.password}
            onChange={handleChange}
            className={inputClass}
            required
          />

          {errors.length > 0 && (
            <ul className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {errors.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? "Please wait..." : isLogin ? "Log in" : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          {isLogin ? "No account yet?" : "Already registered?"}{" "}
          <button onClick={switchMode} className="font-medium text-indigo-600 hover:underline">
            {isLogin ? "Register" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}