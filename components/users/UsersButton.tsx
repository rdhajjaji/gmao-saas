"use client";

import { useState, type ComponentType } from "react";
import { Users } from "lucide-react";
import UsersPanel from "./UsersPanel";

const TypedUsersPanel = UsersPanel as ComponentType<{ onClose: () => void }>;

export default function UsersButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-zinc-300 hover:text-white"
      >
        <Users size={16} />
        Users
      </button>

      {open && <TypedUsersPanel onClose={() => setOpen(false)} />}
    </>
  );
}