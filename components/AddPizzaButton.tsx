"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addPizzaEntry, getPizzaTypeOptions, getLocationOptions, addPizzaTypeOption, addLocationOption } from "@/lib/actions";
import { SmartCombobox } from "./SmartCombobox";
import { PizzaRain } from "./PizzaRain";
import { Toast, useToast } from "./Toast";

const AMOUNTS = [
  { label: "½", value: 0.5 },
  { label: "1", value: 1 },
  { label: "1½", value: 1.5 },
  { label: "2", value: 2 },
];

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function minDateISO(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatGermanDate(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface AddPizzaButtonProps {
  users?: User[];
  currentUserId?: string;
  onSuccess?: (amount: number) => void;
  /** Controlled mode: parent controls sheet visibility */
  open?: boolean;
  /** Controlled mode: called when the sheet requests to close */
  onOpenChange?: (open: boolean) => void;
}

export function AddPizzaButton({
  users = [],
  currentUserId,
  onSuccess,
  open: controlledOpen,
  onOpenChange,
}: AddPizzaButtonProps) {
  const isControlled = controlledOpen !== undefined;

  const [internalOpen, setInternalOpen] = useState(false);
  const sheetVisible = isControlled ? (controlledOpen ?? false) : internalOpen;

  const [amount, setAmount] = useState(1);
  const [rating, setRating] = useState(0);
  const [pizzaType, setPizzaType] = useState("");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const [pizzaTypeOptions, setPizzaTypeOptions] = useState<string[]>([]);
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(
    currentUserId ? [currentUserId] : []
  );
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [showDateInput, setShowDateInput] = useState(false);
  const [showRain, setShowRain] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast, showToast, hideToast } = useToast();
  const sheetRef = useRef<HTMLDivElement>(null);

  // In controlled mode, fetch options whenever the sheet opens
  useEffect(() => {
    if (isControlled && controlledOpen) {
      Promise.all([getPizzaTypeOptions(), getLocationOptions()]).then(
        ([types, locs]) => {
          setPizzaTypeOptions(types);
          setLocationOptions(locs);
        }
      );
      // Reset selected users to current user when opening
      setSelectedUserIds(currentUserId ? [currentUserId] : []);
    }
  }, [isControlled, controlledOpen, currentUserId]);

  function resetForm() {
    setAmount(1);
    setRating(0);
    setPizzaType("");
    setLocation("");
    setNote("");
    setSelectedUserIds(currentUserId ? [currentUserId] : []);
    setSelectedDate(todayISO());
    setShowDateInput(false);
  }

  function closeSheet() {
    resetForm();
    if (isControlled) {
      onOpenChange?.(false);
    } else {
      setInternalOpen(false);
    }
  }

  async function openSheet() {
    if (!isControlled) setInternalOpen(true);
    const [types, locs] = await Promise.all([
      getPizzaTypeOptions(),
      getLocationOptions(),
    ]);
    setPizzaTypeOptions(types);
    setLocationOptions(locs);
  }

  function toggleUser(userId: string) {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  }

  function handleConfirm() {
    const ids =
      selectedUserIds.length > 0
        ? selectedUserIds
        : currentUserId
        ? [currentUserId]
        : undefined;
    startTransition(async () => {
      const result = await addPizzaEntry({
        amount,
        note,
        pizzaType,
        location,
        rating: rating > 0 ? rating : undefined,
        selectedUserIds: ids,
        date: selectedDate !== todayISO() ? selectedDate : undefined,
      });
      if (result?.error) {
        showToast(result.error, "error");
        return;
      }
      closeSheet();
      setShowRain(true);
    });
  }

  function handleRainComplete() {
    setShowRain(false);
    showToast("Pizza wurde eingetragen! 🍕", "success");
    onSuccess?.(amount);
  }

  const isToday = selectedDate === todayISO();

  return (
    <>
      <PizzaRain active={showRain} onComplete={handleRainComplete} />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      {/* Trigger button – only rendered in uncontrolled mode */}
      {!isControlled && (
        <motion.button
          onClick={openSheet}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          className="relative w-full max-w-xs mx-auto flex flex-col items-center justify-center gap-3 bg-[#D62828] hover:bg-[#b82020] text-white font-bold text-xl rounded-3xl shadow-xl transition-colors cursor-pointer"
          style={{ minHeight: "140px" }}
          aria-label="Pizza hinzufügen"
        >
          <span className="text-6xl">🍕</span>
          <span>+1 Pizza</span>
        </motion.button>
      )}

      {/* Bottom sheet */}
      <AnimatePresence>
        {sheetVisible && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSheet}
            />

            {/* Sheet */}
            <motion.div
              ref={sheetRef}
              className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl overflow-y-auto md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:max-w-sm md:w-full md:max-h-[90vh]"
              style={{
                maxHeight: "90dvh",
                paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)",
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 md:hidden">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>

              <div className="px-5 py-4">
                {/* Header */}
                <div className="text-center mb-5">
                  <div className="text-5xl mb-2">🍕</div>
                  <h2 className="text-xl font-bold text-gray-800">Pizza eintragen</h2>
                </div>

                {/* 1. Amount */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Menge
                  </p>
                  <div className="flex gap-2">
                    {AMOUNTS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setAmount(opt.value)}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors min-h-[48px] ${
                          amount === opt.value
                            ? "bg-[#D62828] text-white shadow-sm"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Date */}
                <div className="mb-5">
                  <div className="flex items-center gap-3">
                    <span className="text-base">📅</span>
                    <span className="text-sm text-gray-700 flex-1">
                      {isToday ? "Heute" : formatGermanDate(selectedDate)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowDateInput((v) => !v)}
                      className="text-xs text-[#D62828] font-semibold px-2 py-1 rounded-lg hover:bg-red-50 min-h-[36px]"
                    >
                      Ändern
                    </button>
                  </div>
                  {showDateInput && (
                    <input
                      type="date"
                      value={selectedDate}
                      min={minDateISO()}
                      max={todayISO()}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setShowDateInput(false);
                      }}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F7B731] bg-white"
                      style={{ fontSize: "16px" }}
                    />
                  )}
                </div>

                {/* 3. Star rating */}
                <div className="mb-5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Bewertung
                  </p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(rating === star ? 0 : star)}
                        className="text-3xl leading-none transition-transform active:scale-90 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label={`${star} Stern`}
                      >
                        {star <= rating ? "⭐" : "☆"}
                      </button>
                    ))}
                  </div>
                  {rating === 0 && (
                    <p className="text-xs text-gray-400 mt-1">Bewertung überspringen</p>
                  )}
                </div>

                {/* 4. Who shared? */}
                {users.length > 1 && (
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Wer hat mitgegessen?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {users.map((u) => {
                        const selected = selectedUserIds.includes(u.id);
                        return (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => toggleUser(u.id)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors min-h-[40px] border ${
                              selected
                                ? "bg-[#D62828] text-white border-[#D62828]"
                                : "bg-white text-gray-700 border-gray-200 hover:border-[#D62828]/50"
                            }`}
                          >
                            <span>{u.avatar}</span>
                            <span>{u.name}</span>
                          </button>
                        );
                      })}
                    </div>
                    {selectedUserIds.length > 1 && (
                      <p className="text-xs text-gray-400 mt-1.5">
                        Jeder bekommt ×{(amount / selectedUserIds.length) % 1 === 0.5 ? "½" : amount / selectedUserIds.length} Pizza angerechnet
                      </p>
                    )}
                  </div>
                )}

                {/* 5. Pizza type */}
                <div className="mb-4">
                  <SmartCombobox
                    label="Pizza-Sorte"
                    options={pizzaTypeOptions}
                    value={pizzaType}
                    onChange={setPizzaType}
                    onAddNew={addPizzaTypeOption}
                    placeholder="Pizza-Sorte (optional)"
                  />
                </div>

                {/* 6. Location */}
                <div className="mb-4">
                  <SmartCombobox
                    label="Ort"
                    options={locationOptions}
                    value={location}
                    onChange={setLocation}
                    onAddNew={addLocationOption}
                    placeholder="Ort / Restaurant (optional)"
                  />
                </div>

                {/* 7. Note */}
                <div className="mb-5">
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Notiz (optional)"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F7B731] bg-white"
                    style={{ fontSize: "16px" }}
                    maxLength={200}
                  />
                </div>

                {/* 8. Confirm */}
                <button
                  onClick={handleConfirm}
                  disabled={isPending}
                  className="w-full py-4 bg-[#D62828] text-white font-bold text-base rounded-2xl hover:bg-[#b82020] transition-colors disabled:opacity-60 min-h-[56px]"
                >
                  {isPending ? "Wird eingetragen..." : "🍕 Pizza eintragen!"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
