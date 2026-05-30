import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useNotes } from "../hooks/useNotes";
import NoteModal from "../components/NoteModal";
import ConfirmModal from "../components/ConfirmModal";
import "./Dashboard.css";

const SearchIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

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

const LogoutIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const Dashboard = () => {
  const { user, encryptionKey, logout } = useAuth();
  const toast = useToast();
  const { notes, loading, fetchNotes, createNote, updateNote, deleteNote } =
    useNotes(encryptionKey);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editNote, setEditNote] = useState(null); // null = new note
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const searchTimer = useRef(null);

  // initial load
  useEffect(() => {
    fetchNotes();
  }, []);

  // debounced search
  const handleSearch = useCallback(
    (val) => {
      setSearch(val);
      clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => fetchNotes(val), 350);
    },
    [fetchNotes],
  );

  // ── note CRUD ────────────────────────────────────────────────────────────────
  const handleSave = async (title, content) => {
    try {
      if (editNote) {
        await updateNote(editNote._id || editNote.id, title, content);
        toast.success("Note updated.");
      } else {
        await createNote(title, content);
        toast.success("Note saved.");
      }
      setShowModal(false);
      setEditNote(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save note.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteNote(deleteTarget._id || deleteTarget.id);
      toast.success("Note deleted.");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete note.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openNew = () => {
    setEditNote(null);
    setShowModal(true);
  };
  const openEdit = (note) => {
    setEditNote(note);
    setShowModal(true);
  };

  // avatar initials
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard">
      {/* Navbar – matches PDF */}
      <header className="navbar">
        <span className="navbar-brand">Secure Notes</span>
        <div className="navbar-right">
          <button className="navbar-logout-btn" onClick={logout}>
            <LogoutIcon /> Logout
          </button>
          <div className="navbar-avatar" title={user?.name}>
            {initials}
          </div>
        </div>
      </header>

      <main className="dashboard-body">
        {/* Toolbar – Add Note + Search */}
        <div className="toolbar">
          <button className="btn btn-primary" onClick={openNew}>
            Add Note
          </button>
          <div className="search-box">
            <SearchIcon />
            <input
              type="text"
              className="search-input"
              placeholder="Search"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => handleSearch("")}>
                ×
              </button>
            )}
          </div>
        </div>

        {/* Notes list – matches PDF list style */}
        {loading ? (
          <div className="notes-loading">
            <span className="spinner spinner-dark" />
            Loading notes…
          </div>
        ) : notes.length === 0 ? (
          <div className="notes-empty">
            {search ? (
              <p>No notes found for "{search}".</p>
            ) : (
              <p>
                You have no notes yet. Click <strong>Add Note</strong> to get
                started.
              </p>
            )}
            {!search && (
              <button className="btn btn-primary" onClick={openNew}>
                Add Note
              </button>
            )}
          </div>
        ) : (
          <div className="notes-list">
            {notes.map((note) => (
              <div
                key={note._id || note.id}
                className="note-item"
                onClick={() => openEdit(note)}
              >
                <div className="note-item-text">
                  <div className="note-item-title">{note.title}</div>
                  <div className="note-item-preview">
                    {note.content
                      ? note.content.slice(0, 90)
                      : note.preview || ""}
                  </div>
                </div>
                <div
                  className="note-item-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(note);
                  }}
                >
                  <button className="btn-danger-icon" title="Delete note">
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Note create / edit modal */}
      {showModal && (
        <NoteModal
          note={editNote}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditNote(null);
          }}
        />
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <ConfirmModal
          title="Delete Note"
          message={`Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
