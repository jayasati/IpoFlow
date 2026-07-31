import { useEffect, useState, type FormEvent } from "react";
import { bulkCreateApplications } from "../../api/applications";
import { ApiError } from "../../api/client";
import { createIpo } from "../../api/ipos";
import { getDefaultGroup, listGroups } from "../../api/participantGroups";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { TextInput } from "../../components/ui/TextInput";
import type { ParticipantGroup } from "../../types/participantGroup";

interface IpoWizardModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

type Step = 1 | 2 | 3;

const STEP_LABELS: Record<Step, string> = {
  1: "IPO Details",
  2: "Select Members",
  3: "Review",
};

export function IpoWizardModal({ open, onClose, onCreated }: IpoWizardModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [company, setCompany] = useState("");
  const [issuePrice, setIssuePrice] = useState("");
  const [lotSize, setLotSize] = useState("");

  const [groups, setGroups] = useState<ParticipantGroup[]>([]);
  const [groupId, setGroupId] = useState<number | "">("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<number>>(new Set());
  const [lotsByMember, setLotsByMember] = useState<Record<number, number>>({});
  const [selfFundedMemberIds, setSelfFundedMemberIds] = useState<Set<number>>(new Set());

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const applyGroupSelection = (group: ParticipantGroup) => {
    setGroupId(group.id);
    setSelectedMemberIds(new Set(group.members.map((m) => m.memberId)));
    setLotsByMember(Object.fromEntries(group.members.map((m) => [m.memberId, 1])));
  };

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setCompany("");
    setIssuePrice("");
    setLotSize("");
    setGroupId("");
    setSelectedMemberIds(new Set());
    setLotsByMember({});
    setSelfFundedMemberIds(new Set());
    setError(null);

    Promise.all([listGroups(), getDefaultGroup()])
      .then(([groupsRes, defaultGroup]) => {
        setGroups(groupsRes.data);
        if (defaultGroup) {
          applyGroupSelection(defaultGroup);
        }
      })
      .catch(() => setGroups([]));
  }, [open]);

  const currentGroup = groups.find((g) => g.id === groupId) ?? null;

  const handleGroupChange = (id: number | "") => {
    if (id === "") {
      setGroupId("");
      setSelectedMemberIds(new Set());
      setLotsByMember({});
      return;
    }
    const group = groups.find((g) => g.id === id);
    if (group) applyGroupSelection(group);
  };

  const toggleMember = (memberId: number) => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  };

  const setLots = (memberId: number, lots: number) => {
    setLotsByMember((prev) => ({ ...prev, [memberId]: lots }));
  };

  const toggleSelfFunded = (memberId: number) => {
    setSelfFundedMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  };

  const goNext = () => setStep((s) => (s < 3 ? ((s + 1) as Step) : s));
  const goBack = () => setStep((s) => (s > 1 ? ((s - 1) as Step) : s));

  const handleStep1Submit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    goNext();
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const ipo = await createIpo({
        company,
        issuePrice: Number(issuePrice),
        lotSize: Number(lotSize),
      });

      const applications = Array.from(selectedMemberIds).map((memberId) => ({
        memberId,
        lots: lotsByMember[memberId] ?? 1,
        fundingSource: selfFundedMemberIds.has(memberId)
          ? ("SELF" as const)
          : ("OPERATOR" as const),
      }));

      if (applications.length > 0) {
        await bulkCreateApplications(ipo.id, applications);
      }

      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create IPO.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title="New IPO" onClose={onClose}>
      <div className="mb-4 flex items-center gap-2 text-xs font-medium text-slate-500">
        {([1, 2, 3] as const).map((stepNumber) => (
          <div key={stepNumber} className="flex items-center gap-2">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full ${
                step === stepNumber ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {stepNumber}
            </span>
            <span className={step === stepNumber ? "text-slate-900" : ""}>
              {STEP_LABELS[stepNumber]}
            </span>
            {stepNumber < 3 ? <span className="text-slate-300">→</span> : null}
          </div>
        ))}
      </div>

      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

      {step === 1 ? (
        <form onSubmit={handleStep1Submit} className="flex flex-col gap-3">
          <label className="text-sm font-medium text-slate-700">
            Company
            <TextInput
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              required
              className="mt-1 w-full"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Issue price (per share)
            <TextInput
              type="number"
              min={0}
              step="0.01"
              value={issuePrice}
              onChange={(event) => setIssuePrice(event.target.value)}
              required
              className="mt-1 w-full"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Lot size (shares per lot)
            <TextInput
              type="number"
              min={1}
              step="1"
              value={lotSize}
              onChange={(event) => setLotSize(event.target.value)}
              required
              className="mt-1 w-full"
            />
          </label>
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Next</Button>
          </div>
        </form>
      ) : null}

      {step === 2 ? (
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-slate-700">
            Participant group
            <select
              value={groupId}
              onChange={(event) =>
                handleGroupChange(event.target.value ? Number(event.target.value) : "")
              }
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            >
              <option value="">No group — select manually later</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                  {g.isDefault ? " (default)" : ""}
                </option>
              ))}
            </select>
          </label>

          {currentGroup ? (
            <div>
              <p className="mb-1 text-sm font-medium text-slate-700">
                Members ({selectedMemberIds.size} selected)
              </p>
              <div className="max-h-56 overflow-y-auto rounded-md border border-slate-200 p-2">
                {currentGroup.members.length === 0 ? (
                  <p className="text-sm text-slate-400">This group has no members.</p>
                ) : (
                  currentGroup.members.map((m) => (
                    <div
                      key={m.memberId}
                      className="flex flex-wrap items-center justify-between gap-2 py-1"
                    >
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={selectedMemberIds.has(m.memberId)}
                          onChange={() => toggleMember(m.memberId)}
                        />
                        {m.member.name}
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs text-slate-500">
                          <input
                            type="checkbox"
                            checked={selfFundedMemberIds.has(m.memberId)}
                            disabled={!selectedMemberIds.has(m.memberId)}
                            onChange={() => toggleSelfFunded(m.memberId)}
                          />
                          Self-funded
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={lotsByMember[m.memberId] ?? 1}
                          disabled={!selectedMemberIds.has(m.memberId)}
                          onChange={(event) => setLots(m.memberId, Number(event.target.value))}
                          className="w-20 rounded border border-slate-300 px-2 py-1 text-sm disabled:bg-slate-50"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              No group selected. You can still create the IPO and add applications later.
            </p>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={goBack}>
              Back
            </Button>
            <Button type="button" onClick={goNext}>
              Next
            </Button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="flex flex-col gap-3">
          <div className="rounded-md border border-slate-200 p-3 text-sm">
            <p>
              <span className="font-medium">{company}</span> — issue price {issuePrice}, lot size{" "}
              {lotSize}
            </p>
          </div>
          {selectedMemberIds.size > 0 && currentGroup ? (
            <div className="max-h-56 overflow-y-auto rounded-md border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Member</th>
                    <th className="px-3 py-2">Lots</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentGroup.members
                    .filter((m) => selectedMemberIds.has(m.memberId))
                    .map((m) => (
                      <tr key={m.memberId}>
                        <td className="px-3 py-1.5">{m.member.name}</td>
                        <td className="px-3 py-1.5">{lotsByMember[m.memberId] ?? 1}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No applications will be created yet.</p>
          )}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={goBack} disabled={submitting}>
              Back
            </Button>
            <Button type="button" onClick={() => void handleFinalSubmit()} disabled={submitting}>
              {submitting ? "Creating…" : "Create IPO"}
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
