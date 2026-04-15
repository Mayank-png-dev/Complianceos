import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

const DataSourceBadge = ({ client }) => {
  const source = client?.dataSource;

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

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
};

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [filings, setFilings] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const [clientResponse, filingsResponse, deadlinesResponse] = await Promise.all([
          api.get(`/clients/${id}`),
          api.get(`/clients/${id}/filings`),
          api.get(`/clients/${id}/deadlines`),
        ]);

        setClient(clientResponse.data);
        setFilings(filingsResponse.data);
        setDeadlines(deadlinesResponse.data);
      } catch (requestError) {
        const status = requestError.response?.status;
        if (status === 401) {
          localStorage.removeItem("token");
          navigate("/", { replace: true });
          return;
        }

        setError(requestError.response?.data?.message || "Failed to load client details");
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [id, navigate]);

  if (loading) {
    return <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">Loading client details...</div>;
  }

  if (error) {
    return <div className="rounded-[2rem] border border-rose-200 bg-white p-8 text-sm text-rose-600 shadow-sm">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/dashboard" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
          Back to dashboard
        </Link>
      </div>

      <section className="grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Client detail</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold text-slate-900">{client?.businessName || "Client"}</h1>
            <DataSourceBadge client={client} />
          </div>
          <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">GSTIN</p>
              <p className="mt-2 font-medium text-slate-900">{client?.gstin || "-"}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">State</p>
              <p className="mt-2 font-medium text-slate-900">{client?.state || "-"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-slate-900 p-5 text-white">
          <p className="text-sm text-slate-300">Compliance score</p>
          <p className="mt-3 text-5xl font-semibold">{client?.complianceScore ?? 0}</p>
          <p className="mt-3 text-sm text-slate-300">Last synced {client?.lastSynced ? formatDate(client.lastSynced) : "not available"}</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-xl font-semibold text-slate-900">Filing Records</h2>
            <p className="text-sm text-slate-500">Most recent synced filing entries for this client.</p>
          </div>

          {filings.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                    <th className="px-6 py-4 font-medium">Return Type</th>
                    <th className="px-6 py-4 font-medium">Period</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Penalty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filings.map((filing) => (
                    <tr key={filing._id}>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{filing.returnType || "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{filing.period || "-"}</td>
                      <td className="px-6 py-4 text-sm capitalize text-slate-600">{filing.status || "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{filing.penalty ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-10 text-sm text-slate-500">No filing records found for this client.</div>
          )}
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-xl font-semibold text-slate-900">Upcoming Deadlines</h2>
            <p className="text-sm text-slate-500">Current alert windows generated by the backend engine.</p>
          </div>

          {deadlines.length ? (
            <div className="space-y-4 p-6">
              {deadlines.map((deadline, index) => (
                <div key={`${deadline.returnType}-${deadline.period}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{deadline.returnType || "Return"}</p>
                      <p className="mt-1 text-sm text-slate-500">Period {deadline.period || "-"}</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      {deadline.daysUntilDue} days
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-slate-600">Due on {formatDate(deadline.dueDate)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-10 text-sm text-slate-500">No deadlines available right now.</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ClientDetail;
