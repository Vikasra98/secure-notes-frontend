import { useState, useCallback } from "react";
import api from "../utils/api";
import { encryptContent, decryptContent } from "../utils/crypto";
import { useToast } from "../context/ToastContext";

export const useNotes = (encryptionKey) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // fetch + decrypt all notes for the logged-in user
  const fetchNotes = useCallback(
    async (search = "") => {
      setLoading(true);
      try {
        const params = search ? { search } : {};
        const res = await api.get("/notes", { params });
        const raw = res.data.data.notes;

        const decrypted = raw.map((note) => ({
          ...note,
          content: encryptionKey
            ? decryptContent(note.encrypted_content, encryptionKey)
            : note.preview || "",
        }));

        setNotes(decrypted);
        return decrypted;
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load notes.");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [encryptionKey, toast],
  );

  // create note – encrypt before sending
  const createNote = useCallback(
    async (title, content) => {
      if (!encryptionKey) throw new Error("Encryption key missing.");

      const encryptedContent = encryptContent(content, encryptionKey);
      const preview = content.slice(0, 80) + (content.length > 80 ? "…" : "");

      const res = await api.post("/notes", {
        title,
        encryptedContent,
        preview,
      });
      const note = res.data.data.note;

      setNotes((prev) => [{ ...note, content }, ...prev]);
      return note;
    },
    [encryptionKey],
  );

  // update note
  const updateNote = useCallback(
    async (id, title, content) => {
      if (!encryptionKey) throw new Error("Encryption key missing.");

      const encryptedContent = encryptContent(content, encryptionKey);
      const preview = content.slice(0, 80) + (content.length > 80 ? "…" : "");

      const res = await api.put(`/notes/${id}`, {
        title,
        encryptedContent,
        preview,
      });
      const updated = res.data.data.note;

      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...updated, content } : n)),
      );
      return updated;
    },
    [encryptionKey],
  );

  // delete note
  const deleteNote = useCallback(async (id) => {
    await api.delete(`/notes/${id}`);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notes, loading, fetchNotes, createNote, updateNote, deleteNote };
};
