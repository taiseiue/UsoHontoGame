/**
 * Header Component
 * Feature: 008-i18n-support / US1
 *
 * Application header with language switcher
 */

"use client";

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

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex">
          <div className="text-lg font-semibold text-gray-900 mx-2">
            ウソホントゲーム
          </div>
          <div className="text-lg mx-2">
            {isGames ? (
              <span className="font-semibold text-gray-700 cursor-default">
                ゲーム管理
              </span>
            ) : (
              <Link href="/games" className="text-gray-500 hover:text-gray-700">
                ゲーム管理
              </Link>
            )}
          </div>
          <div className="text-lg mx-2">
            {isTop ? (
              <span className="font-semibold text-gray-700 cursor-default">
                参加者TOP
              </span>
            ) : (
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                参加者TOP
              </Link>
            )}
          </div>
        </div>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
