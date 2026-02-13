"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { CalendarDays } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getProfile, updateProfile } from "@/lib/api/users";
import type { User } from "@/lib/api/auth";

export default function ProfileForm() {
  const t = useTranslations("profile");
  const { user, login, token } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "">("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Populate form from fresh profile data
  const populateForm = useCallback((u: User) => {
    setFirstName(u.firstName || "");
    setLastName(u.lastName || "");
    setPhoneNumber(u.phoneNumber || "");
    setEmail(u.email || "");
    setGender((u.gender as "MALE" | "FEMALE") || "");
    setBirthDate(u.birthDate ? u.birthDate.split("T")[0] : "");
  }, []);

  // Fetch profile on mount
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const profile = await getProfile();
        populateForm(profile);
      } catch {
        // Fall back to context user
        if (user) populateForm(user);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, user, populateForm]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const updated = await updateProfile({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        email: email.trim() || undefined,
        gender: gender || undefined,
        birthDate: birthDate || undefined,
      });
      // Sync auth context
      if (token) login(token, updated);
      setMessage({ type: "success", text: t("saved") });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : t("error"),
      });
    } finally {
      setSaving(false);
    }
  };

  // Format phone for display (strip +966, show as local)
  const displayPhone = phoneNumber.replace(/^\+966/, "");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <h1 className="text-xl font-bold text-dark">{t("title")}</h1>
      <p className="mt-1 text-sm text-gray-text">{t("subtitle")}</p>

      {/* Form */}
      <div className="mt-6 space-y-4">
        {/* First Name & Last Name */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={`${t("firstName")}*`}
              className="w-full rounded-lg border border-gray-border px-4 py-3 text-sm outline-none transition-colors placeholder:text-gray-text focus:border-dark"
            />
          </div>
          <div>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={`${t("lastName")}*`}
              className="w-full rounded-lg border border-gray-border px-4 py-3 text-sm outline-none transition-colors placeholder:text-gray-text focus:border-dark"
            />
          </div>
        </div>

        {/* Phone Number (disabled) */}
        <div className="flex items-center rounded-lg border border-gray-border bg-gray-50 px-4 py-3">
          <div className="flex items-center gap-2 shrink-0 border-e border-gray-border pe-3 me-3">
            {/* Saudi flag emoji + code */}
            <span className="text-sm">🇸🇦</span>
            <span className="text-sm text-gray-text">+966</span>
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-gray-text">{t("phoneNumber")}*</p>
            <input
              type="text"
              value={displayPhone}
              disabled
              className="w-full bg-transparent text-sm text-dark outline-none"
              placeholder={t("phonePlaceholder")}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("email")}
            className="w-full rounded-lg border border-gray-border px-4 py-3 text-sm outline-none transition-colors placeholder:text-gray-text focus:border-dark"
          />
        </div>

        {/* Gender */}
        <div>
          <p className="mb-2 text-sm text-dark">{t("gender")}</p>
          <div className="flex items-center gap-6">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="gender"
                checked={gender === "MALE"}
                onChange={() => setGender("MALE")}
                className="h-4 w-4 accent-dark"
              />
              <span className="text-sm text-dark">{t("male")}</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="gender"
                checked={gender === "FEMALE"}
                onChange={() => setGender("FEMALE")}
                className="h-4 w-4 accent-dark"
              />
              <span className="text-sm text-dark">{t("female")}</span>
            </label>
          </div>
        </div>

        {/* Birth Date */}
        <div className="relative">
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            placeholder={t("birthDate")}
            className="w-full rounded-lg border border-gray-border px-4 py-3 text-sm text-dark outline-none transition-colors [color-scheme:light] placeholder:text-gray-text focus:border-dark"
          />
          <CalendarDays
            size={18}
            className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-gray-text"
          />
        </div>
      </div>

      {/* Message */}
      {message && (
        <p
          className={`mt-4 text-center text-xs ${
            message.type === "success" ? "text-green" : "text-discount"
          }`}
        >
          {message.text}
        </p>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 w-full rounded-lg bg-dark py-3 text-sm font-semibold text-white transition-colors hover:bg-dark/90 disabled:opacity-50 sm:w-auto sm:px-12"
      >
        {saving ? t("saving") : t("save")}
      </button>

      {/* Delete account */}
      <div className="mt-8 text-center">
        <button className="text-sm font-medium text-discount underline transition-colors hover:text-discount/80">
          {t("deleteAccount")}
        </button>
      </div>
    </div>
  );
}
