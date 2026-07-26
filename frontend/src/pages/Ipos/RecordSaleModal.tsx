import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "../../api/client";
import { createSale } from "../../api/sales";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { TextInput } from "../../components/ui/TextInput";

interface RecordSaleModalProps {
  open: boolean;
  applicationId: number;
  onClose: () => void;
  onRecorded: () => void;
}

export function RecordSaleModal({
  open,
  applicationId,
  onClose,
  onRecorded,
}: RecordSaleModalProps) {
  const [shares, setShares] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setShares("");
      setSellPrice("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createSale(applicationId, { shares: Number(shares), sellPrice: Number(sellPrice) });
      onRecorded();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to record sale.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title="Record Sale" onClose={onClose}>
      <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-3">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <label className="text-sm font-medium text-slate-700">
          Shares sold
          <TextInput
            type="number"
            min={1}
            step="1"
            value={shares}
            onChange={(event) => setShares(event.target.value)}
            required
            className="mt-1 w-full"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Sell price (per share)
          <TextInput
            type="number"
            min={0.01}
            step="0.01"
            value={sellPrice}
            onChange={(event) => setSellPrice(event.target.value)}
            required
            className="mt-1 w-full"
          />
        </label>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Record Sale"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
