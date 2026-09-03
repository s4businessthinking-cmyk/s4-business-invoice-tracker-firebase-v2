import React from "react";

export default function MiddleToolsPanel({
  canClearAll,
  busy,
  onDefaultDiscount,
  onSetReorderLevel,
  onSetRack,
  onImport,
  onExport,
  onClearAndImport,
  onSpecification,
  onPhotoSetting,
}) {
  return (
    <fieldset className="pm-panel pm-middle-tools">
      <legend className="pm-panel-legend">Product Tools</legend>
      <div className="pm-middle-tools-grid">
        <button type="button" className="pm-btn-secondary" onClick={onDefaultDiscount}>Default Discount</button>
        <button type="button" className="pm-btn-secondary" onClick={onSetReorderLevel}>Set Reorder Level</button>
        <button type="button" className="pm-btn-secondary" onClick={onSetRack}>Set Rack</button>
        <button type="button" className="pm-btn-secondary" onClick={onImport}>Import</button>
        <button type="button" className="pm-btn-secondary" onClick={onExport}>Export</button>
        {canClearAll ? (
          <button type="button" className="pm-btn-danger" onClick={onClearAndImport} disabled={busy}>
            Clear &amp; Import
          </button>
        ) : (
          <span className="pm-middle-tools-spacer" aria-hidden="true" />
        )}
      </div>
      <div className="pm-middle-tools-extra">
        <button type="button" className="pm-btn-secondary" onClick={onSpecification}>Product Specification</button>
        <button type="button" className="pm-btn-secondary" onClick={onPhotoSetting}>Product Photo setting...</button>
      </div>
    </fieldset>
  );
}
