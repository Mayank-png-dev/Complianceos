import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const AddClient = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    gstin: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/clients", {
        gstin: formData.gstin.toUpperCase(),
      });
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to add client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link to="/dashboard" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
          Back to dashboard
        </Link>
      </div>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">New client</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Add a GST client</h1>
        <p className="mt-3 text-sm text-slate-500">Store the client and trigger the filing sync flow from your backend.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">GSTIN</span>
            <input
              type="text"
              name="gstin"
              value={formData.gstin}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 uppercase outline-none transition focus:border-emerald-500 focus:bg-white"
              placeholder="27AAPFR1234A1Z5"
            />
          </label>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Business name and registration details will be fetched from the GST source automatically.
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving client..." : "Create Client"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default AddClient;
