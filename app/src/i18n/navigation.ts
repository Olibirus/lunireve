import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware navigation helpers.
 * Use these instead of next/link and next/navigation in client components
 * when you want automatic locale prefixing and pathname translation.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
