# S4 Product Master (Standalone Package)

Complete Product Master UI module extracted from **S4 Business Thinking**.

## Contents

```
src/product-master/
├── ProductMasterScreen.jsx      Main screen (entry point)
├── ProductDetailsForm.jsx       Product form fields
├── ProductListGrid.jsx          Product list / grid
├── PricingPanel.jsx             Purchase / cost pricing
├── SellingRatesPanel.jsx        Multi-rate selling prices
├── ActionButtonsRow.jsx         Toolbar actions
├── pmStyles.js                  Scoped CSS (PM_CSS)
├── shopPartNumbers.js           Shop part number format engine
├── code128.js                   Barcode CODE128 encoder
├── csv.js                       CSV parser helper
├── importFile.js                Excel/CSV import parser
├── Modal.jsx                    Base modal component
└── modals/
    ├── AdditionalBarcodeConfirmModal.jsx
    ├── BarcodePrintModal.jsx
    ├── ClearProductsModal.jsx
    ├── DefaultDiscountModal.jsx
    ├── GlobalSearchModal.jsx
    ├── ImportModal.jsx
    ├── MoreBarcodesModal.jsx
    ├── NewLookupModal.jsx
    ├── OpeningStockModal.jsx
    ├── PhotoModal.jsx
    ├── RackModal.jsx
    ├── ReorderLevelModal.jsx
    ├── ShopPartFormatModal.jsx
    └── SpecificationModal.jsx
```

## Dependencies

| Package | Used for |
|---------|----------|
| `react` ^18 | UI components |
| `react-dom` ^18 | React DOM |
| `xlsx` ^0.18 | Excel import (`importFile.js`) |

No Firebase or other S4 app modules are required inside this folder.

## Quick integration

```jsx
import ProductMasterScreen from "./product-master/ProductMasterScreen.jsx";

<ProductMasterScreen
  shopId={shopId}
  products={products}
  filteredProducts={filteredProducts}
  productsLoading={loading}
  companies={companies}
  form={form}
  upd={updateFormField}
  selectedId={selectedProductId}
  canDelete={isOwner}
  saving={saving}
  onNew={handleNew}
  onSave={handleSave}
  onDelete={handleDelete}
  onClose={handleClose}
  onSelectProduct={handleSelect}
  onExport={handleExportCsv}
  onImportRecords={handleImport}
  onClearAll={handleClearAll}
  clearingProducts={clearing}
  replacementActive={replacementActive}
  onFinishReplacement={finishReplacement}
  productMaintenanceActive={maintenanceActive}
  onGenerateWeighingFile={handleWeighingExport}
  onPrintBarcodes={handlePrintBarcodes}
  notify={(message, kind) => toast(message, kind)}
  shopPartEnabled={shopPartEnabled}
/>
```

Inject styles once where the screen mounts:

```jsx
import { PM_CSS } from "./product-master/pmStyles.js";

// Inside component or layout:
<style>{PM_CSS}</style>
```

## Keyboard shortcuts (inside Product Master)

- **F10** — Global product search
- **Ctrl/Cmd + S** — Save product
- **Escape** — Close / back (when no modal open)

## Local storage keys

- `s4-product-master-units-{shopId}`
- `s4-product-master-customer-types-{shopId}`

## Source app

Extracted from: `s4-business-thinking-app` v1.0.41  
Extract date: 2026-08-29
