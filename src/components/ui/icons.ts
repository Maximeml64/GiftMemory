// src/components/ui/icons.ts
//
// Centralised re-exports of the Lucide icons we use. lucide-react-native
// ships with web-leaning types that don't satisfy RN strict mode out of
// the box, so we cast each one to a minimal RN-compatible signature here.
// Consumers import the *Icon variants and get a typed component for free.

import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  Cake,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Gift,
  Home,
  Lock,
  Mail,
  MapPin,
  Pencil,
  Plus,
  Search,
  Settings,
  Sparkles,
  Trash2,
  Users,
  X,
} from 'lucide-react-native';

export type LucideIcon = React.ComponentType<{ color?: string; size?: number }>;

export const ArrowDownLeftIcon = ArrowDownLeft as unknown as LucideIcon;
export const ArrowUpRightIcon = ArrowUpRight as unknown as LucideIcon;
export const BellIcon = Bell as unknown as LucideIcon;
export const CakeIcon = Cake as unknown as LucideIcon;
export const CalendarIcon = Calendar as unknown as LucideIcon;
export const CheckIcon = Check as unknown as LucideIcon;
export const ChevronLeftIcon = ChevronLeft as unknown as LucideIcon;
export const ChevronRightIcon = ChevronRight as unknown as LucideIcon;
export const DownloadIcon = Download as unknown as LucideIcon;
export const ExternalLinkIcon = ExternalLink as unknown as LucideIcon;
export const FileTextIcon = FileText as unknown as LucideIcon;
export const GiftIcon = Gift as unknown as LucideIcon;
export const HomeIcon = Home as unknown as LucideIcon;
export const LockIcon = Lock as unknown as LucideIcon;
export const MailIcon = Mail as unknown as LucideIcon;
export const MapPinIcon = MapPin as unknown as LucideIcon;
export const PencilIcon = Pencil as unknown as LucideIcon;
export const PlusIcon = Plus as unknown as LucideIcon;
export const SearchIcon = Search as unknown as LucideIcon;
export const SettingsIcon = Settings as unknown as LucideIcon;
export const SparklesIcon = Sparkles as unknown as LucideIcon;
export const TrashIcon = Trash2 as unknown as LucideIcon;
export const UsersIcon = Users as unknown as LucideIcon;
export const XIcon = X as unknown as LucideIcon;
