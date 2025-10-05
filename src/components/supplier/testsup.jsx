import React from "react";
import ShipmentsWithInlineDetailsMock from "./Supplier_shipment_details";
import ShipmentsModernInline from "./testsup2";
export default function TestShipmentInlinePage() {
  return (
    <div className="container py-4">
      <h4>Inline Shipment Details Demo</h4>
      <p className="text-muted">Click a shipment row to expand details below the row. This is a mock demo (no API).</p>

      <ShipmentsModernInline supplierUuid="supplier-1" />
    </div>
  );
}
