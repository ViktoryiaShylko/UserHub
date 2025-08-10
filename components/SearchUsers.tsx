"use client";

import { Input } from "@/components/ui/input";

export function SearchUsers({ onSearch }: { onSearch: (term: string) => void }) {
  return (
    <div className="w-full max-w-md mb-8">
      <Input
        type="text"
        placeholder="Search by name..."
        onChange={(e) => onSearch(e.target.value)}
        className="w-full"
      />
    </div>
  );
}