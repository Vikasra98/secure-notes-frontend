import React from "react";

const ConfirmModal = ({
  title,
  message,
  confirmLabel,
  loading,
  onConfirm,
  onCancel,
}) => (
  <div
    className="modal-backdrop"
    onClick={(e) => e.target === e.currentTarget && onCancel()}
  >
    <div className="modal-box" style={{ maxWidth: "380px" }}>
      <div className="modal-header">
        <span className="modal-title">{title}</span>
        <button className="modal-close" onClick={onCancel}>
          ×
        </button>
      </div>
      <p style={{ fontSize: "13.5px", color: "#555", lineHeight: 1.5 }}>
        {message}
      </p>
      <div className="modal-footer">
        <button
          className="btn btn-outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          className="btn"
          style={{ background: "#e53e3e", color: "#fff" }}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? <span className="spinner" /> : confirmLabel || "Confirm"}
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmModal;
