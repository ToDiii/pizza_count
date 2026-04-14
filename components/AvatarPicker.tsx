"use client";

import dynamic from "next/dynamic";
import { useState, useTransition } from "react";
import { updateAvatarAction } from "@/lib/actions";

// emoji-mart uses browser APIs – must be dynamically imported
const EmojiPicker = dynamic(() => import("@emoji-mart/react"), {
  ssr: false,
  loading: () => (
    <div className="p-8 text-center text-gray-400 text-sm">Lädt...</div>
  ),
});

interface AvatarPickerProps {
  currentAvatar: string;
}

export function AvatarPicker({ currentAvatar }: AvatarPickerProps) {
  const [avatar, setAvatar] = useState(currentAvatar);
  const [showPicker, setShowPicker] = useState(false);
  const [isPending, startTransition] = useTransition();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleEmojiSelect(emoji: any) {
    const native: string = emoji.native;
    startTransition(async () => {
      await updateAvatarAction(native);
      setAvatar(native);
      setShowPicker(false);
    });
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Large avatar display */}
      <div className="w-20 h-20 rounded-2xl bg-[#FFF8F0] border-2 border-[#F7B731]/40 flex items-center justify-center text-5xl select-none">
        {avatar}
      </div>

      <button
        onClick={() => setShowPicker(true)}
        disabled={isPending}
        className="px-4 py-2 bg-[#F7B731] text-white rounded-xl text-sm font-semibold hover:bg-[#e5a820] transition-colors disabled:opacity-60 min-h-[44px]"
      >
        {isPending ? "Speichern..." : "Ändern"}
      </button>

      {/* Picker modal */}
      {showPicker && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-50"
            onClick={() => setShowPicker(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 rounded-2xl overflow-hidden shadow-2xl">
            <EmojiPicker onEmojiSelect={handleEmojiSelect} />
          </div>
        </>
      )}
    </div>
  );
}
