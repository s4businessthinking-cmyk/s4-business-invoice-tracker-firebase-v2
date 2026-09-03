import React from "react";

export default function ActionButtonsRow({
  canDelete,
  hasProduct,
  busy,
  onNew,
  onSave,
  onDelete,
  onSearch,
  onClose,
  productMaintenanceActive,
  onPrintOpeningStockBarcodes,
  onOpeningStockEntry,
  onGenerateWeighingFile,
  showOpeningTools = true,
  showWeighingExport = true,
}) {
  return (
    <div className="pm-actions pm-actions--primary-only">
      {showOpeningTools && (
        <div className="pm-opening-tools">
          <button type="button" className="pm-btn-secondary" onClick={onPrintOpeningStockBarcodes}>Print Opening stock Barcodes</button>
          <button type="button" className="pm-btn-secondary" onClick={onOpeningStockEntry}>Opening Stock Entry</button>
        </div>
      )}
      {showWeighingExport && (
        <button type="button" className="pm-btn-secondary pm-weighing-btn" onClick={onGenerateWeighingFile}>
          Generate Data file for Weighing barcode machine
        </button>
      )}
      <div className="pm-primary-actions">
        <button type="button" className="pm-btn" onClick={onNew}>New</button>
        <button type="button" className="pm-btn" onClick={onSave} disabled={busy || productMaintenanceActive}>{busy ? "Saving..." : "Save"}</button>
        <button type="button" className="pm-btn" onClick={onDelete} disabled={!hasProduct || !canDelete}>Delete</button>
        <button type="button" className="pm-btn" onClick={onSearch}>Search<br />(F10)</button>
        <button type="button" className="pm-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
