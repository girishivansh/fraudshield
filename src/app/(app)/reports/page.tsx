"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FileBarChart, Search, Download, Plus, Trash2, FileText, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { AuthGate } from "@/components/dashboard/auth-gate";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { apiReports, apiDeleteReport, reportDownloadUrl, ApiError, type ClientReport } from "@/lib/client-api";
import { riskLevel, riskMeta, cn } from "@/lib/utils";

export default function ReportsPage() {
  return (
    <AuthGate label="the reports center">
      <ReportsContent />
    </AuthGate>
  );
}

function ReportsContent() {
  const [reports, setReports] = useState<ClientReport[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    apiReports()
      .then((r) => alive && setReports(r.reports))
      .catch((e) => alive && setError(e instanceof ApiError ? e.message : "Failed to load reports."));
    return () => {
      alive = false;
    };
  }, []);

  const types = useMemo(() => {
    const set = new Set((reports ?? []).map((r) => r.type).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [reports]);

  const rows = useMemo(
    () =>
      (reports ?? []).filter(
        (r) =>
          (type === "all" || r.type === type) &&
          (r.title.toLowerCase().includes(q.toLowerCase()) || r.id.toLowerCase().includes(q.toLowerCase()))
      ),
    [reports, q, type]
  );

  const stats = useMemo(() => {
    const list = reports ?? [];
    const avg = list.length ? Math.round(list.reduce((s, r) => s + r.risk, 0) / list.length) : 0;
    return [
      { label: "Total reports", value: list.length, tone: "text-ink-50" },
      { label: "Finalized", value: list.filter((r) => r.status === "Finalized").length, tone: "text-success-400" },
      { label: "With PDF", value: list.filter((r) => r.hasPdf).length, tone: "text-accent-300" },
      { label: "Avg. risk", value: avg, tone: "text-danger-400" },
    ];
  }, [reports]);

  async function remove(id: string) {
    setDeleting(id);
    setError(null);
    try {
      await apiDeleteReport(id);
      setReports((prev) => (prev ?? []).filter((r) => r.id !== id));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to delete the report.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Intelligence archive"
        title="Reports Center"
        description="Audit-grade investigation reports compiled from your analyses — searchable and export-ready as PDF."
        actions={
          <Link href="/#workspace">
            <Button size="md">
              <Plus className="h-4 w-4" />
              New report
            </Button>
          </Link>
        }
      />

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-danger-400/25 bg-danger-500/[0.08] px-4 py-3 text-body-sm text-danger-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* stat tiles */}
      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <GlassCard key={s.label} className="p-4">
            <div className={cn("tabular text-h2 font-bold", s.tone)}>{reports ? s.value : "—"}</div>
            <div className="text-micro text-ink-500">{s.label}</div>
          </GlassCard>
        ))}
      </div>

      <GlassCard>
        {/* toolbar */}
        <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4 sm:flex-row sm:items-center">
          <Input
            placeholder="Search reports…"
            icon={<Search className="h-4 w-4" />}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            containerClassName="sm:max-w-xs"
          />
          <div className="flex items-center gap-2 sm:ml-auto">
            <Select
              value={type}
              onChange={(e) => setType(e.target.value)}
              options={types.map((t) => ({ label: t === "all" ? "All types" : t, value: t }))}
              containerClassName="w-44"
            />
          </div>
        </div>

        {/* table */}
        {!reports && !error ? (
          <div className="flex items-center justify-center gap-2 py-16 text-body-sm text-ink-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading reports…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-white/[0.06] text-micro uppercase tracking-wider text-ink-500">
                  <th className="px-5 py-3 font-medium">Report</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Risk</th>
                  <th className="px-4 py-3 font-medium">Author</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const meta = riskMeta[riskLevel(r.risk)];
                  return (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.04, 0.4) }}
                      className="group border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500/10 text-primary-300">
                            <FileText className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="text-body-sm font-medium text-ink-100">{r.title}</div>
                            <div className="font-mono text-micro text-ink-500">{r.size}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge tone="primary">{r.type}</Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge tone="success" dot>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/[0.06]">
                            <div className="h-full rounded-full" style={{ width: `${r.risk}%`, background: meta.color }} />
                          </div>
                          <span className="tabular text-label font-semibold" style={{ color: meta.color }}>
                            {r.risk}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-body-sm text-ink-300">{r.author}</td>
                      <td className="px-4 py-3.5 tabular text-body-sm text-ink-400">{r.date}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <a
                            href={reportDownloadUrl(r.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg p-1.5 text-ink-400 hover:bg-white/[0.06] hover:text-white"
                            aria-label="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => remove(r.id)}
                            disabled={deleting === r.id}
                            className="rounded-lg p-1.5 text-ink-400 hover:bg-danger-500/10 hover:text-danger-300 disabled:opacity-50"
                            aria-label="Delete report"
                          >
                            {deleting === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            {rows.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <FileBarChart className="h-8 w-8 text-ink-600" />
                <p className="text-body-sm text-ink-500">
                  {reports && reports.length === 0 ? "No reports yet — generate one from the workspace." : "No reports match your search."}
                </p>
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </>
  );
}
