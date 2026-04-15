import { readFileSync } from "fs";
import { join } from "path";
import { APP_VERSION } from "@/lib/version";
import { AboutClient } from "./AboutClient";

interface ChangelogSection {
  category: string;
  items: string[];
}

interface ChangelogEntry {
  version: string;
  date: string;
  sections: ChangelogSection[];
}

function parseChangelog(content: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  const lines = content.split("\n");

  let currentEntry: ChangelogEntry | null = null;
  let currentSection: ChangelogSection | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Version header: ## [1.3.0] - 2026-04-14
    const versionMatch = trimmed.match(/^## \[(.+?)\] - (.+)$/);
    if (versionMatch) {
      if (currentSection && currentEntry) {
        currentEntry.sections.push(currentSection);
        currentSection = null;
      }
      if (currentEntry) entries.push(currentEntry);
      currentEntry = { version: versionMatch[1], date: versionMatch[2], sections: [] };
      continue;
    }

    // Section header: ### Added
    const sectionMatch = trimmed.match(/^### (.+)$/);
    if (sectionMatch && currentEntry) {
      if (currentSection) currentEntry.sections.push(currentSection);
      currentSection = { category: sectionMatch[1], items: [] };
      continue;
    }

    // List item: - item
    if (trimmed.startsWith("- ") && currentSection) {
      currentSection.items.push(trimmed.slice(2));
    }
  }

  // Flush last entry
  if (currentSection && currentEntry) currentEntry.sections.push(currentSection);
  if (currentEntry) entries.push(currentEntry);

  return entries;
}

export default function AboutPage() {
  let changelogEntries: ChangelogEntry[] = [];

  try {
    const content = readFileSync(join(process.cwd(), "CHANGELOG.md"), "utf-8");
    changelogEntries = parseChangelog(content);
  } catch {
    // CHANGELOG.md not found or unreadable – show empty state
  }

  return <AboutClient version={APP_VERSION} changelogEntries={changelogEntries} />;
}
