"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addPizzaEntry } from "@/lib/actions";
import { PizzaRain } from "./PizzaRain";
import { Toast, useToast } from "./Toast";

interface AddPizzaButtonProps {
  onSuccess?: () => void;
}

export function AddPizzaButton({ onSuccess }: AddPizzaButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [note, setNote] = useState("");
  const [showRain, setShowRain] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast, showToast, hideToast } = useToast();

  function handleConfirm() {
    startTransition(async () => {
      const result = await addPizzaEntry(note);
      if (result?.error) {
        showToast(result.error, "error");
        setShowModal(false);
        setNote("");
        return;
      }
      setShowModal(false);
      setNote("");
      setShowRain(true);
    });
  }

  function handleRainComplete() {
    setShowRain(false);
    showToast("Pizza wurde eingetragen! 🍕", "success");
    onSuccess?.();
  }

  return (
    <>
      <PizzaRain active={showRain} onComplete={handleRainComplete} />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      {/* Main pizza button */}
      <motion.button
        onClick={() => setShowModal(true)}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.03 }}
        className="relative w-full max-w-xs mx-auto flex flex-col items-center justify-center gap-3 bg-[#D62828] hover:bg-[#b82020] text-white font-bold text-xl rounded-3xl shadow-xl transition-colors cursor-pointer"
        style={{ minHeight: "140px" }}
        aria-label="Pizza hinzufügen"
      >
        <span className="text-6xl">🍕</span>
        <span>+1 Pizza</span>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
            />
            <motion.div
              className="fixed inset-x-4 bottom-0 z-50 bg-white rounded-t-3xl p-6 pb-10 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:max-w-sm md:w-full md:pb-6"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
            >
              <div className="text-center mb-5">
                <div className="text-5xl mb-2">🍕</div>
                <h2 className="text-xl font-bold text-gray-800">
                  Welche Pizza war es?
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Notiz optional – einfach leer lassen
                </p>
              </div>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="z.B. Margherita beim Italiano um die Ecke..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F7B731] text-sm resize-none h-24"
                maxLength={200}
                autoFocus
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors min-h-[48px]"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isPending}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#D62828] text-white font-semibold text-sm hover:bg-[#b82020] transition-colors disabled:opacity-60 min-h-[48px]"
                >
                  {isPending ? "Speichern..." : "Eintragen! 🍕"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
