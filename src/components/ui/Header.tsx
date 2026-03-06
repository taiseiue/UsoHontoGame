/**
 * Header Component
 * Feature: 008-i18n-support / US1
 *
 * Application header with language switcher
 */

"use client";

import { useLanguage } from "@/hooks/useLanguage";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";

/**
 * Header Component
 *
 * Renders application header with language switcher
 */
export function Header() {
  const pathname = usePathname();
  const isGames = pathname === "/games";
  const isTop = pathname === "/";
  const { t } = useLanguage();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex">
          <div className="text-lg font-semibold text-gray-900 mx-2">
            {t("game.title")}
          </div>
          <div className="text-lg mx-2">
            {isGames ? (
              <span className="font-semibold text-gray-700 cursor-default">
                {t("game.gameManagement")}
              </span>
            ) : (
              <Link href="/games" className="text-gray-500 hover:text-gray-700">
                {t("game.gameManagement")}
              </Link>
            )}
          </div>
          <div className="text-lg mx-2">
            {isTop ? (
              <span className="font-semibold text-gray-700 cursor-default">
                {t("navigation.participantTop")}
              </span>
            ) : (
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                {t("navigation.participantTop")}
              </Link>
            )}
          </div>
        </div>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
