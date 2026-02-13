"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Send, Pencil, Trash2, CornerDownRight, Loader2 } from "lucide-react";
import {
  getReviewComments,
  createReviewComment,
  updateReviewComment,
  deleteReviewComment,
  type ReviewComment,
} from "@/lib/api/reviews";
import { useAuth } from "@/lib/auth-context";

interface ReviewCommentsProps {
  reviewId: string;
  onRequireLogin: () => void;
}

export default function ReviewComments({
  reviewId,
  onRequireLogin,
}: ReviewCommentsProps) {
  const t = useTranslations("productDetail");
  const { user, isLoggedIn } = useAuth();

  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  // Reply state
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyPosting, setReplyPosting] = useState(false);

  // Edit state
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Expanded replies
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set(),
  );

  const fetchComments = useCallback(async () => {
    try {
      const res = await getReviewComments(reviewId, { limit: 50 });
      setComments(res.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [reviewId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handlePostComment = async () => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    if (!newComment.trim() || posting) return;
    setPosting(true);
    try {
      await createReviewComment(reviewId, { content: newComment.trim() });
      setNewComment("");
      await fetchComments();
    } catch {
      // silently fail
    } finally {
      setPosting(false);
    }
  };

  const handlePostReply = async (parentId: string) => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    if (!replyText.trim() || replyPosting) return;
    setReplyPosting(true);
    try {
      await createReviewComment(reviewId, {
        content: replyText.trim(),
        parentId,
      });
      setReplyingTo(null);
      setReplyText("");
      // Auto-expand replies for this comment
      setExpandedReplies((prev) => new Set(prev).add(parentId));
      await fetchComments();
    } catch {
      // silently fail
    } finally {
      setReplyPosting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim() || editSaving) return;
    setEditSaving(true);
    try {
      await updateReviewComment(commentId, { content: editText.trim() });
      setEditingCommentId(null);
      setEditText("");
      await fetchComments();
    } catch {
      // silently fail
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm(t("deleteCommentConfirm"))) return;
    try {
      await deleteReviewComment(commentId);
      await fetchComments();
    } catch {
      // silently fail
    }
  };

  const startEdit = (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditText(content);
    setReplyingTo(null);
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 size={16} className="animate-spin text-gray-text" />
      </div>
    );
  }

  const isOwner = (userId: string) => user?.id === userId;

  return (
    <div className="mt-3 space-y-3">
      {/* Add comment input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onFocus={() => {
            if (!isLoggedIn) {
              onRequireLogin();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handlePostComment();
          }}
          placeholder={t("addComment")}
          maxLength={2000}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none transition-colors placeholder:text-gray-300 focus:border-primary"
        />
        <button
          onClick={handlePostComment}
          disabled={posting || !newComment.trim()}
          className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {posting ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Send size={12} />
          )}
          {t("postComment")}
        </button>
      </div>

      {/* Comments list */}
      {comments.length === 0 ? (
        <p className="py-2 text-center text-xs text-gray-text">
          {t("noComments")}
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id}>
              {/* Top-level comment */}
              <CommentItem
                comment={comment}
                isOwner={isOwner(comment.user.id)}
                isEditing={editingCommentId === comment.id}
                editText={editText}
                editSaving={editSaving}
                onEditTextChange={setEditText}
                onStartEdit={() => startEdit(comment.id, comment.content)}
                onSaveEdit={() => handleEditComment(comment.id)}
                onCancelEdit={() => setEditingCommentId(null)}
                onDelete={() => handleDeleteComment(comment.id)}
                onReply={() => {
                  if (!isLoggedIn) {
                    onRequireLogin();
                    return;
                  }
                  setReplyingTo(
                    replyingTo === comment.id ? null : comment.id,
                  );
                  setReplyText("");
                }}
                t={t}
              />

              {/* Replies toggle */}
              {comment.replies.length > 0 && (
                <div className="ms-8 mt-1">
                  <button
                    onClick={() => toggleReplies(comment.id)}
                    className="text-[11px] font-medium text-primary transition-colors hover:text-primary-hover"
                  >
                    {expandedReplies.has(comment.id)
                      ? t("hideReplies")
                      : t("viewReplies", { count: comment.replies.length })}
                  </button>

                  {/* Expanded replies */}
                  {expandedReplies.has(comment.id) && (
                    <div className="mt-2 space-y-2 border-s-2 border-gray-100 ps-3">
                      {comment.replies.map((reply) => (
                        <ReplyItem
                          key={reply.id}
                          reply={reply}
                          isOwner={isOwner(reply.user.id)}
                          isEditing={editingCommentId === reply.id}
                          editText={editText}
                          editSaving={editSaving}
                          onEditTextChange={setEditText}
                          onStartEdit={() =>
                            startEdit(reply.id, reply.content)
                          }
                          onSaveEdit={() => handleEditComment(reply.id)}
                          onCancelEdit={() => setEditingCommentId(null)}
                          onDelete={() => handleDeleteComment(reply.id)}
                          t={t}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Reply input */}
              {replyingTo === comment.id && (
                <div className="ms-8 mt-2 flex gap-2">
                  <CornerDownRight
                    size={14}
                    className="mt-2 flex-shrink-0 text-gray-300"
                  />
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handlePostReply(comment.id);
                    }}
                    placeholder={t("replyPlaceholder")}
                    maxLength={2000}
                    autoFocus
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none transition-colors placeholder:text-gray-300 focus:border-primary"
                  />
                  <button
                    onClick={() => handlePostReply(comment.id)}
                    disabled={replyPosting || !replyText.trim()}
                    className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
                  >
                    {replyPosting ? (
                      <Loader2 size={10} className="animate-spin" />
                    ) : (
                      <Send size={10} />
                    )}
                    {t("reply")}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──

interface CommentItemProps {
  comment: ReviewComment;
  isOwner: boolean;
  isEditing: boolean;
  editText: string;
  editSaving: boolean;
  onEditTextChange: (text: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onReply: () => void;
  t: (key: string) => string;
}

function CommentItem({
  comment,
  isOwner,
  isEditing,
  editText,
  editSaving,
  onEditTextChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onReply,
  t,
}: CommentItemProps) {
  const name = `${comment.user.firstName} ${comment.user.lastName}`.trim();
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const date = new Date(comment.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex gap-2">
      {/* Avatar */}
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
        <span className="text-[10px] font-bold text-gray-text">{initials}</span>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-dark">{name}</span>
          <span className="text-[10px] text-gray-text">{date}</span>
        </div>

        {isEditing ? (
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              value={editText}
              onChange={(e) => onEditTextChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSaveEdit();
                if (e.key === "Escape") onCancelEdit();
              }}
              maxLength={2000}
              autoFocus
              className="flex-1 rounded border border-gray-200 px-2 py-1 text-xs outline-none focus:border-primary"
            />
            <button
              onClick={onSaveEdit}
              disabled={editSaving || !editText.trim()}
              className="rounded bg-primary px-2 py-1 text-[11px] font-medium text-white disabled:opacity-50"
            >
              {editSaving ? t("saving") : t("save")}
            </button>
            <button
              onClick={onCancelEdit}
              className="rounded border border-gray-200 px-2 py-1 text-[11px] text-gray-text"
            >
              {t("cancel")}
            </button>
          </div>
        ) : (
          <p className="mt-0.5 text-xs leading-relaxed text-gray-text">
            {comment.content}
          </p>
        )}

        {/* Actions */}
        {!isEditing && (
          <div className="mt-1 flex items-center gap-3">
            <button
              onClick={onReply}
              className="text-[11px] font-medium text-gray-text transition-colors hover:text-dark"
            >
              {t("replyTo")}
            </button>
            {isOwner && (
              <>
                <button
                  onClick={onStartEdit}
                  className="flex items-center gap-0.5 text-[11px] text-gray-text transition-colors hover:text-dark"
                >
                  <Pencil size={10} />
                  {t("editComment")}
                </button>
                <button
                  onClick={onDelete}
                  className="flex items-center gap-0.5 text-[11px] text-gray-text transition-colors hover:text-discount"
                >
                  <Trash2 size={10} />
                  {t("deleteComment")}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface ReplyItemProps {
  reply: ReviewComment["replies"][number];
  isOwner: boolean;
  isEditing: boolean;
  editText: string;
  editSaving: boolean;
  onEditTextChange: (text: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  t: (key: string) => string;
}

function ReplyItem({
  reply,
  isOwner,
  isEditing,
  editText,
  editSaving,
  onEditTextChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  t,
}: ReplyItemProps) {
  const name = `${reply.user.firstName} ${reply.user.lastName}`.trim();
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const date = new Date(reply.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex gap-2">
      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
        <span className="text-[9px] font-bold text-gray-text">{initials}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-dark">{name}</span>
          <span className="text-[10px] text-gray-text">{date}</span>
        </div>

        {isEditing ? (
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              value={editText}
              onChange={(e) => onEditTextChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSaveEdit();
                if (e.key === "Escape") onCancelEdit();
              }}
              maxLength={2000}
              autoFocus
              className="flex-1 rounded border border-gray-200 px-2 py-1 text-[11px] outline-none focus:border-primary"
            />
            <button
              onClick={onSaveEdit}
              disabled={editSaving || !editText.trim()}
              className="rounded bg-primary px-2 py-1 text-[10px] font-medium text-white disabled:opacity-50"
            >
              {editSaving ? t("saving") : t("save")}
            </button>
            <button
              onClick={onCancelEdit}
              className="rounded border border-gray-200 px-2 py-1 text-[10px] text-gray-text"
            >
              {t("cancel")}
            </button>
          </div>
        ) : (
          <p className="mt-0.5 text-[11px] leading-relaxed text-gray-text">
            {reply.content}
          </p>
        )}

        {!isEditing && isOwner && (
          <div className="mt-1 flex items-center gap-3">
            <button
              onClick={onStartEdit}
              className="flex items-center gap-0.5 text-[10px] text-gray-text transition-colors hover:text-dark"
            >
              <Pencil size={9} />
              {t("editComment")}
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-0.5 text-[10px] text-gray-text transition-colors hover:text-discount"
            >
              <Trash2 size={9} />
              {t("deleteComment")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
