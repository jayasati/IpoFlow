import { useEffect, useState, type FormEvent } from "react";
import { listIpos } from "../../api/ipos";
import { ApiError } from "../../api/client";
import { recordAdjustment, recordCommission, recordMoneyReturned, recordMoneySent } from "../../api/ledger";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { TextInput } from "../../components/ui/TextInput";
import type { Ipo } from "../../types/ipo";

type MovementType = "sent" | "returned" | "commission" | "adjustment";

const TITLES: Record<MovementType, string> = {
  sent: "Record Money Sent",
  returned: "Record Money Returned",
  commission: "Record Commission",
  adjustment: "Record Adjustment",
};

interface MoneyMovementModalProps {
  open: boolean;
  memberId: number;
  type: MovementType;
  onClose: () => void;
  onRecorded: () => void;
}

export function MoneyMovementModal({
  open,
  memberId,
  type,
  onClose,
  onRecorded,
}: MoneyMovementModalProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [direction, setDirection] = useState<"credit" | "debit">("debit");
  const [ipoId, setIpoId] = useState<number | "">("");
  const [ipos, setIpos] = useState<Ipo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount("");
      setDescription("");
      setDirection("debit");
      setIpoId("");
      setError(null);
      if (type === "adjustment") {
        listIpos({ pageSize: 100, sortBy: "createdAt", sortOrder: "desc" })
          .then((res) => setIpos(res.data))
          .catch(() => setIpos([]));
      }
    }
  }, [open, type]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const ipoIdValue = ipoId === "" ? undefined : ipoId;
      const input = {
        amount: Number(amount),
        description: description || undefined,
        ipoId: ipoIdValue,
      };
      if (type === "sent") {
        await recordMoneySent(memberId, input);
      } else if (type === "returned") {
        await recordMoneyReturned(memberId, input);
      } else if (type === "commission") {
        await recordCommission(memberId, input);
      } else {
        await recordAdjustment(memberId, { ...input, direction });
      }
      onRecorded();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to record entry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title={TITLES[type]} onClose={onClose}>
      <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-3">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {type === "adjustment" ? (
          <fieldset className="text-sm font-medium text-slate-700">
            Direction
            <div className="mt-1 flex gap-4 text-sm font-normal">
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name="direction"
                  checked={direction === "credit"}
                  onChange={() => setDirection("credit")}
                />
                Credit (adds to balance)
              </label>
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name="direction"
                  checked={direction === "debit"}
                  onChange={() => setDirection("debit")}
                />
                Debit (removes from balance)
              </label>
            </div>
          </fieldset>
        ) : null}

        <label className="text-sm font-medium text-slate-700">
          Amount
          <TextInput
            type="number"
            min={0.01}
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
            className="mt-1 w-full"
          />
        </label>

        {type === "adjustment" ? (
          <label className="text-sm font-medium text-slate-700">
            IPO (optional)
            <select
              value={ipoId}
              onChange={(event) =>
                setIpoId(event.target.value ? Number(event.target.value) : "")
              }
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            >
              <option value="">Not tied to a specific IPO</option>
              {ipos.map((ipo) => (
                <option key={ipo.id} value={ipo.id}>
                  {ipo.company}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="text-sm font-medium text-slate-700">
          Description (optional)
          <TextInput
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="mt-1 w-full"
          />
        </label>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Record"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
