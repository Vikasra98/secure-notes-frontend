import React, { useState, useEffect, useRef } from "react";

const NoteModal = ({ note, onSave, onClose }) => {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = "Title is required.";
    if (!content.trim()) e.content = "Content is required.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await onSave(title.trim(), content.trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box">
        <div className="modal-header">
          <span className="modal-title">{note ? "Edit Note" : "New Note"}</span>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Title</label>
            <input
              ref={titleRef}
              type="text"
              className={`form-control ${errors.title ? "is-error" : ""}`}
              value={title}
              maxLength={200}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
            />
            {errors.title && <p className="field-error">{errors.title}</p>}
          </div>

          <div className="form-group">
            <label>Content</label>
            <textarea
              className={`form-control ${errors.content ? "is-error" : ""}`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here…"
              rows={5}
              style={{
                height: "auto",
                resize: "vertical",
                padding: "8px 10px",
              }}
            />
            {errors.content && <p className="field-error">{errors.content}</p>}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner" />
              ) : note ? (
                "Update"
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteModal;
