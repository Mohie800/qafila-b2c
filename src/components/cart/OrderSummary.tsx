"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ShieldCheck } from "lucide-react";
import SarIcon from "@/components/shared/SarIcon";
import type { CartSummary } from "@/types/cart";

interface OrderSummaryProps {
  summary: CartSummary;
  showCheckoutButton?: boolean;
}

export default function OrderSummary({
  summary,
  showCheckoutButton = true,
}: OrderSummaryProps) {
  const t = useTranslations();

  return (
    <div className="sticky top-40 rounded-xl border border-gray-border dark:border-gray-700 bg-white dark:bg-dark p-6">
      <h2 className="mb-4 text-lg font-bold text-dark dark:text-gray-100">
        {t("cart.orderSummary")}
      </h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-text">{t("cart.subtotal")}</span>
          <span className="font-medium" dir="ltr">
            <SarIcon /> {summary.totalBeforeTax.toFixed(2)}
          </span>
        </div>

        {summary.discount > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-text">{t("cart.discount")}</span>
            <span className="font-medium text-discount" dir="ltr">
              -<SarIcon /> {summary.discount.toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-gray-text">{t("cart.vat")}</span>
          <span className="font-medium" dir="ltr">
            <SarIcon /> {summary.taxAmount.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-text">{t("cart.shipping")}</span>
          <span className="font-medium text-green">{t("cart.free")}</span>
        </div>

        <div className="border-t border-gray-border dark:border-gray-700 pt-3">
          <div className="flex justify-between">
            <span className="text-base font-bold text-dark dark:text-gray-100">
              {t("cart.total")}
            </span>
            <div className="text-end">
              <span className="text-base font-bold text-dark dark:text-gray-100" dir="ltr">
                <SarIcon /> {summary.total.toFixed(2)}
              </span>
              <div className="text-xs text-gray-text">{t("cart.inclVat")}</div>
            </div>
          </div>
        </div>
      </div>

      {showCheckoutButton && (
        <Link
          href="/checkout"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          <ShieldCheck size={18} />
          {t("cart.proceedToCheckout")}
        </Link>
      )}

      <p className="mt-3 text-center text-xs text-gray-text">
        {t.rich("cart.freeShipping", { sar: () => <SarIcon key="sar" /> })}
      </p>
    </div>
  );
}
