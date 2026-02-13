"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Plus, MapPin } from "lucide-react";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  type Address,
  type CreateAddressPayload,
} from "@/lib/api/addresses";
import AddressCard from "./AddressCard";
import AddressFormModal from "./AddressFormModal";

export default function AddressList() {
  const t = useTranslations("addresses");

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Address | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAddresses = useCallback(async () => {
    try {
      const data = await getAddresses();
      setAddresses(data.addresses);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleAdd = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setModalOpen(true);
  };

  const handleSubmit = async (data: CreateAddressPayload) => {
    if (editingAddress) {
      await updateAddress(editingAddress.id, data);
    } else {
      await createAddress(data);
    }
    await fetchAddresses();
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await deleteAddress(deleteConfirm.id);
      await fetchAddresses();
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setDeleting(false);
    }
  };

  const handleSetDefault = async (address: Address) => {
    try {
      await setDefaultAddress(address.id);
      await fetchAddresses();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark">{t("title")}</h1>
          <p className="mt-1 text-sm text-gray-text">{t("subtitle")}</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-lg bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-dark/90"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">{t("addAddress")}</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-discount">
          {error}
        </div>
      )}

      {/* Address list */}
      {addresses.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <MapPin size={28} className="text-gray-text" />
          </div>
          <p className="text-sm font-medium text-dark">{t("empty")}</p>
          <p className="text-xs text-gray-text">{t("emptyDesc")}</p>
          <button
            onClick={handleAdd}
            className="mt-2 rounded-lg bg-dark px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-dark/90"
          >
            {t("addFirst")}
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              onEdit={handleEdit}
              onDelete={setDeleteConfirm}
              onSetDefault={handleSetDefault}
            />
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      <AddressFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAddress(null);
        }}
        onSubmit={handleSubmit}
        address={editingAddress}
      />

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <h3 className="text-base font-bold text-dark">
              {t("deleteConfirmTitle")}
            </h3>
            <p className="mt-2 text-sm text-gray-text">
              {t("deleteConfirmDesc")}
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-lg border border-gray-border py-2.5 text-sm font-medium text-dark transition-colors hover:bg-gray-50"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-lg bg-discount py-2.5 text-sm font-semibold text-white transition-colors hover:bg-discount/90 disabled:opacity-50"
              >
                {deleting ? t("deleting") : t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
