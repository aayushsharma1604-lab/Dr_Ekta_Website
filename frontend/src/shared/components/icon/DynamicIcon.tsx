"use client";

import React from "react";
import * as MdIcons from "react-icons/md";
import * as FaIcons from "react-icons/fa";
import * as Fa6Icons from "react-icons/fa6";
import * as GiIcons from "react-icons/gi";
import * as TbIcons from "react-icons/tb";
import * as BiIcons from "react-icons/bi";

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

function resolve(name: string) {
  if (!name) return null;
  const t = name.trim();
  if (legacyMap[t]) return allIcons[legacyMap[t]] ?? null;
  if (allIcons[t]) return allIcons[t];
  const pascal = t.split(/[-_ ]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
  const mdName = `Md${pascal}`;
  if (allIcons[mdName]) return allIcons[mdName];
  return null;
}

export function DynamicIcon({ name, size = 20, className }: { name: string; size?: number; className?: string }) {
  const Icon = resolve(name);
  if (Icon) {
    return React.createElement(Icon as React.ComponentType<{ size?: number; className?: string }>, {
      size,
      className,
    });
  }
  // fallback to material-icons font
  return <span className={`material-icons ${className || ""}`} style={{ fontSize: size }}>{name}</span>;
}
