"use client";

import { useMemo, useState } from "react";
import * as MdIcons from "react-icons/md";
import * as FaIcons from "react-icons/fa";
import * as Fa6Icons from "react-icons/fa6";
import * as GiIcons from "react-icons/gi";
import * as TbIcons from "react-icons/tb";
import * as BiIcons from "react-icons/bi";

// Map legacy material-icons names (frontend uses these) to react-icons equivalents
const legacyMap: Record<string, string> = {
  dentistry: "MdMedicalServices",
  healing: "MdHealing",
  auto_awesome: "MdAutoAwesome",
  sentiment_very_satisfied: "MdSentimentVerySatisfied",
  brightness_7: "MdBrightness7",
  verified: "MdVerified",
  science: "MdScience",
  sentiment_satisfied: "MdSentimentSatisfied",
  schedule: "MdSchedule",
  warning: "MdWarning",
  stars: "MdStars",
  group: "MdGroup",
  emoji_events: "MdEmojiEvents",
  local_hospital: "MdLocalHospital",
  school: "MdSchool",
  workspace_premium: "MdWorkspacePremium",
  groups: "MdGroups",
  person: "MdPerson",
  article: "MdArticle",
  image: "MdImage",
  star: "MdStar",
  favorite: "MdFavorite",
  chat_bubble: "MdChatBubble",
  location_on: "MdLocationOn",
  call: "MdCall",
  train: "MdTrain",
  map: "MdMap",
  contact_mail: "MdContactMail",
  check_circle: "MdCheckCircle",
  arrow_forward: "MdArrowForward",
  arrow_back: "MdArrowBack",
  open_in_new: "MdOpenInNew",
  photo_camera: "MdPhotoCamera",
  zoom_in: "MdZoomIn",
  calendar_today: "MdCalendarToday",
  play_arrow: "MdPlayArrow",
};

const allIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  ...(MdIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>),
  ...(FaIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>),
  ...(Fa6Icons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>),
  ...(GiIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>),
  ...(TbIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>),
  ...(BiIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>),
};

function resolveIcon(name: string) {
  if (!name) return null;
  const trimmed = name.trim();
  // legacy material name
  if (legacyMap[trimmed]) return allIcons[legacyMap[trimmed]] ?? null;
  // direct react-icons name like MdMedicalServices, FaTooth
  if (allIcons[trimmed]) return allIcons[trimmed];
  // try adding Md prefix for bare material names
  const pascal = trimmed.split(/[-_ ]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
  const mdName = `Md${pascal}`;
  if (allIcons[mdName]) return allIcons[mdName];
  return null;
}

export function IconPreview({ name, size = 20 }: { name: string; size?: number }) {
  const Icon = resolveIcon(name);
  if (!Icon) return <span className="text-xs text-zinc-400">?</span>;
  return <Icon size={size} className="text-blue-600" />;
}

// Suggestions for autocomplete — curated dental/medical + common
const suggestions = [
  "MdMedicalServices", "MdHealing", "MdLocalHospital", "MdHealthAndSafety", "MdScience",
  "FaTooth", "FaTeeth", "FaTeethOpen", "GiTooth", "TbDental",
  "MdFavorite", "MdStar", "MdVerified", "MdWorkspacePremium", "MdEmojiEvents",
  "MdGroups", "MdGroup", "MdPerson", "MdSchool", "MdAutoAwesome",
  "MdBrightness7", "MdSentimentVerySatisfied", "MdSentimentSatisfied", "MdMood",
  "MdCheckCircle", "MdWarning", "MdInfo", "MdHelp", "MdArticle",
  "MdCalendarToday", "MdSchedule", "MdAccessTime", "MdEvent",
  "MdPhone", "MdEmail", "MdLocationOn", "MdMap", "MdContactMail",
  "MdArrowForward", "MdArrowBack", "MdOpenInNew", "MdLink",
  "MdPhotoCamera", "MdImage", "MdZoomIn", "MdVisibility",
];

export function IconField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const filtered = useMemo(() => {
    if (!value) return suggestions.slice(0, 8);
    const q = value.toLowerCase();
    return suggestions.filter((s) => s.toLowerCase().includes(q)).slice(0, 8);
  }, [value]);

  const Icon = resolveIcon(value);

  return (
    <div className="relative">
      <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Icon</label>
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
          {Icon ? <Icon size={18} className="text-blue-600" /> : <span className="text-xs text-zinc-400">?</span>}
        </div>
        <input
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="e.g. MdMedicalServices, FaTooth, dentistry"
          className="flex-1 rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white"
        />
      </div>
      <p className="mt-1 text-[10px] text-zinc-400">Type a react-icons name (Md*, Fa*, Gi*, Tb*, Bi*) or legacy name like &ldquo;dentistry&rdquo;. Preview updates live.</p>
      {open && filtered.length > 0 && (
        <div className="absolute left-11 right-0 z-10 mt-1 max-h-48 overflow-auto rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          {filtered.map((name) => {
            const I = allIcons[name];
            return (
              <button
                key={name}
                onMouseDown={() => { onChange(name); setOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-blue-50 dark:hover:bg-zinc-700"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded bg-blue-50 text-blue-600 dark:bg-blue-900/30">
                  {I ? <I size={14} /> : null}
                </span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
