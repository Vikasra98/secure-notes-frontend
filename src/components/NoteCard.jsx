import React from "react";
import "./NoteCard.css";

const TrashIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

const EditIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const LockTinyIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const NoteCard = ({ note, onEdit, onDelete }) => {
  return (
    <div
      className="note-card"
      onClick={onEdit}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onEdit()}
    >
      <div className="note-card-body">
        <h3 className="note-title">{note.title}</h3>
        <p className="note-preview">
          {note.content?.slice(0, 110) || note.preview || "…"}
        </p>
      </div>
      <div className="note-card-footer">
        <div className="note-meta">
          <LockTinyIcon />
          <span>{formatDate(note.updatedAt)}</span>
        </div>
        <div className="note-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className="btn btn-icon note-edit-btn"
            onClick={onEdit}
            title="Edit"
          >
            <EditIcon />
          </button>
          <button
            className="btn btn-icon note-delete-btn"
            onClick={onDelete}
            title="Delete"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
