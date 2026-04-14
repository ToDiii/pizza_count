"use client";

import { useState, useTransition, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  addPizzaEntry,
  getPizzaTypeSuggestions,
  getLocationSuggestions,
} from "@/lib/actions";
import { PizzaRain } from "./PizzaRain";
import { Toast, useToast } from "./Toast";

const AMOUNTS = [
  { label: "½", value: 0.5 },
  { label: "1", value: 1 },
  { label: "1½", value: 1.5 },
  { label: "2", value: 2 },
];

interface AddPizzaButtonProps {
  onSuccess?: (amount: number) => void;
}

export function AddPizzaButton({ onSuccess }: AddPizzaButtonProps) {
  const [showSheet, setShowSheet] = useState(false);
  const [amount, setAmount] = useState(1);
  const [rating, setRating] = useState(0);
  const [pizzaType, setPizzaType] = useState("");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const [pizzaTypeSuggestions, setPizzaTypeSuggestions] = useState<string[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showRain, setShowRain] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast, showToast, hideToast } = useToast();
  const sheetRef = useRef<HTMLDivElement>(null);

  function resetForm() {
    setAmount(1);
    setRating(0);
    setPizzaType("");
    setLocation("");
    setNote("");
  }

  async function openSheet() {
    setShowSheet(true);
    // Fetch suggestions in background
    const [types, locs] = await Promise.all([
      getPizzaTypeSuggestions(),
      getLocationSuggestions(),
    ]);
    setPizzaTypeSuggestions(types);
    setLocationSuggestions(locs);
  }

  function handleInputFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 350);
  }

  function handleConfirm() {
    startTransition(async () => {
      const result = await addPizzaEntry({
        amount,
        note,
        pizzaType,
        location,
        rating: rating > 0 ? rating : undefined,
      });
      if (result?.error) {
        showToast(result.error, "error");
        return;
      }
      setShowSheet(false);
      resetForm();
      setShowRain(true);
    });
  }

  function handleRainComplete() {
    setShowRain(false);
    showToast("Pizza wurde eingetragen! 🍕", "success");
    onSuccess?.(amount);
  }

  const filteredPizzaTypes = pizzaTypeSuggestions.filter(
    (s) => s.toLowerCase().includes(pizzaType.toLowerCase()) && s !== pizzaType
  );
  const filteredLocations = locationSuggestions.filter(
    (s) => s.toLowerCase().includes(location.toLowerCase()) && s !== location
  );

  return (
    <>
      <PizzaRain active={showRain} onComplete={handleRainComplete} />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      {/* Main pizza button */}
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

      {/* Bottom sheet */}
      <AnimatePresence>
        {showSheet && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowSheet(false); resetForm(); }}
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

                {/* 1. Amount selector */}
                <div className="mb-5">
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

                {/* 2. Star rating */}
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

                {/* 3. Pizza type */}
                <div className="mb-4 relative">
                  <input
                    value={pizzaType}
                    onChange={(e) => setPizzaType(e.target.value)}
                    onFocus={handleInputFocus}
                    placeholder="Pizza-Sorte (optional)"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F7B731] bg-white"
                    style={{ fontSize: "16px" }}
                    autoComplete="off"
                  />
                  {filteredPizzaTypes.length > 0 && pizzaType.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {filteredPizzaTypes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setPizzaType(s)}
                          className="text-sm bg-[#FFF8F0] border border-[#F7B731]/40 px-3 py-1 rounded-full text-gray-700 hover:bg-[#F7B731]/20 min-h-[36px]"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                  {pizzaTypeSuggestions.length > 0 && pizzaType.length === 0 && (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {pizzaTypeSuggestions.slice(0, 5).map((s) => (
                        <button
                          key={s}
                          onClick={() => setPizzaType(s)}
                          className="text-sm bg-[#FFF8F0] border border-[#F7B731]/40 px-3 py-1 rounded-full text-gray-700 hover:bg-[#F7B731]/20 min-h-[36px]"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Location */}
                <div className="mb-4 relative">
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onFocus={handleInputFocus}
                    placeholder="Ort / Restaurant (optional)"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F7B731] bg-white"
                    style={{ fontSize: "16px" }}
                    autoComplete="off"
                  />
                  {filteredLocations.length > 0 && location.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {filteredLocations.map((s) => (
                        <button
                          key={s}
                          onClick={() => setLocation(s)}
                          className="text-sm bg-[#FFF8F0] border border-[#F7B731]/40 px-3 py-1 rounded-full text-gray-700 hover:bg-[#F7B731]/20 min-h-[36px]"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                  {locationSuggestions.length > 0 && location.length === 0 && (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {locationSuggestions.slice(0, 5).map((s) => (
                        <button
                          key={s}
                          onClick={() => setLocation(s)}
                          className="text-sm bg-[#FFF8F0] border border-[#F7B731]/40 px-3 py-1 rounded-full text-gray-700 hover:bg-[#F7B731]/20 min-h-[36px]"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. Note */}
                <div className="mb-5">
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onFocus={handleInputFocus}
                    placeholder="Notiz (optional)"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F7B731] bg-white"
                    style={{ fontSize: "16px" }}
                    maxLength={200}
                  />
                </div>

                {/* 6. Confirm button */}
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
