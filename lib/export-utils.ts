interface ExportData {
  itemName: string
  cfMethod: string
  cfProduct: string
  cfApiCategory: string
  cfNatureOfItem: string
  cfUsageCount: number
  cfDeveloperHub: string
  sku: string
  description: null
  hsnSac: string
  rate: number
  account: string
  taxable: boolean
  taxabilityType: null
  productType: string
  intraStateTaxName: string
  intraStateTaxRate: number
  intraStateTaxType: string
  interStateTaxName: string
  interStateTaxRate: number
  interStateTaxType: string
  status: string
  itemType: string
  cfEndpoint: string
  cfApiId: string
  itemId: null
  createdAt: string
}

export function exportToCSV(data: ExportData[], filename = "google-sheets-data.csv") {
  if (data.length === 0) {
    throw new Error("No data to export")
  }

  // Define headers
  const headers = [
    "Item Name",
    "CF.Method",
    "CF.Product",
    "CF.API Category",
    "CF.Nature of Item",
    "CF.Usage Count",
    "CF.Developer Hub",
    "SKU",
    "Description",
    "HSN/SAC",
    "Rate",
    "Account",
    "Taxable",
    "Taxability Type",
    "Product Type",
    "Intra State Tax Name",
    "Intra State Tax Rate",
    "Intra State Tax Type",
    "Inter State Tax Name",
    "Inter State Tax Rate",
    "Inter State Tax Type",
    "Status",
    "Item Type",
    "CF.Endpoint",
    "CF.API Id",
    "Item ID",
    "Created At",
  ]

  // Convert data to CSV format
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      [
        `"${row.itemName}"`,
        `"${row.cfMethod}"`,
        `"${row.cfProduct}"`,
        `"${row.cfApiCategory}"`,
        `"${row.cfNatureOfItem}"`,
        row.cfUsageCount,
        `"${row.cfDeveloperHub}"`,
        `"${row.sku}"`,
        row.description || "",
        `"${row.hsnSac}"`,
        row.rate,
        `"${row.account}"`,
        row.taxable,
        row.taxabilityType || "",
        `"${row.productType}"`,
        `"${row.intraStateTaxName}"`,
        row.intraStateTaxRate,
        `"${row.intraStateTaxType}"`,
        `"${row.interStateTaxName}"`,
        row.interStateTaxRate,
        `"${row.interStateTaxType}"`,
        `"${row.status}"`,
        `"${row.itemType}"`,
        `"${row.cfEndpoint}"`,
        `"${row.cfApiId}"`,
        row.itemId || "",
        `"${row.createdAt}"`,
      ].join(","),
    ),
  ].join("\n")

  // Create and download file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportToJSON(data: ExportData[], filename = "google-sheets-data.json") {
  if (data.length === 0) {
    throw new Error("No data to export")
  }

  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function generateSampleData(): ExportData[] {
  return [
    {
      itemName: "Sample API Call",
      cfMethod: "POST",
      cfProduct: "GST",
      cfApiCategory: "Compliance",
      cfNatureOfItem: "Charge",
      cfUsageCount: 1,
      cfDeveloperHub: "Developer Portal v1.0",
      sku: "550e8400-e29b-41d4-a716-446655440000",
      description: null,
      hsnSac: "998314",
      rate: 50.0,
      account: "Sales",
      taxable: true,
      taxabilityType: null,
      productType: "service",
      intraStateTaxName: "GST18",
      intraStateTaxRate: 18,
      intraStateTaxType: "Group",
      interStateTaxName: "IGST18",
      interStateTaxRate: 18,
      interStateTaxType: "Simple",
      status: "Active",
      itemType: "Sales",
      cfEndpoint: "/gst/compliance",
      cfApiId: "POST:/gst/compliance",
      itemId: null,
      createdAt: new Date().toISOString(),
    },
  ]
}
