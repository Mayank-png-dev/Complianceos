import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const DataSourceBadge = ({ client }) => {
  const source = client.dataSource;

  if (source === "mock") {
    return (
      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
        Demo data
      </span>
    );
  }

  if (source === "live_basic") {
    return (
      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
        Live GST data
      </span>
    );
  }

  return null;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.get("/clients");
        setClients(response.data);
      } catch (requestError) {
        const status = requestError.response?.status;
        if (status === 401) {
          localStorage.removeItem("token");
          navigate("/", { replace: true });
          return;
        }

        setError(requestError.response?.data?.message || "Failed to load clients");
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [navigate]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Dashboard</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Client compliance overview</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-500">
            Review GSTINs, track compliance scores, and open any client for detailed filings and deadlines.
          </p>
        </div>
        <div className="rounded-3xl bg-slate-900 p-5 text-white">
          <p className="text-sm text-slate-300">Tracked clients</p>
          <p className="mt-3 text-4xl font-semibold">{clients.length}</p>
          <p className="mt-3 text-sm text-slate-300">Keep this list current so alerts and deadlines stay useful.</p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Clients</h2>
            <p className="text-sm text-slate-500">Open a row to view filings and deadline details.</p>
          </div>
          <Link
            to="/clients/new"
            className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
          >
            New Client
          </Link>
        </div>

        {loading ? <div className="px-6 py-10 text-sm text-slate-500">Loading clients...</div> : null}
        {error ? <div className="px-6 py-10 text-sm text-rose-600">{error}</div> : null}

        {!loading && !error ? (
          clients.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                    <th className="px-6 py-4 font-medium">Business Name</th>
                    <th className="px-6 py-4 font-medium">GSTIN</th>
                    <th className="px-6 py-4 font-medium">Compliance Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clients.map((client) => (
                    <tr
                      key={client._id}
                      className="cursor-pointer transition hover:bg-emerald-50/70"
                      onClick={() => navigate(`/clients/${client._id}`)}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{client.businessName || "-"}</span>
                          <DataSourceBadge client={client} />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{client.gstin || "-"}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white">
                          {client.complianceScore ?? 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-10 text-sm text-slate-500">
              No clients added yet. Create your first client to start tracking filings.
            </div>
          )
        ) : null}
      </section>
    </div>
  );
};

export default Dashboard;
