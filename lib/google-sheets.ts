import { google } from "googleapis"

interface SheetData {
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
}

export async function appendToGoogleSheet(data: SheetData) {
  try {
    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: "service_account",
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_CLIENT_EMAIL}`,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })
    const spreadsheetId = process.env.GOOGLE_SHEET_ID

    if (!spreadsheetId) {
      throw new Error("Google Sheet ID not configured")
    }

    // Convert data to array format for Google Sheets - REORDERED to match your column mapping
    const values = [
      [
        data.itemId, // Column 1: itemId
        data.itemName, // Column 2: itemName
        data.sku, // Column 3: sku
        data.description, // Column 4: description
        data.hsnSac, // Column 5: hsnSac
        data.rate, // Column 6: rate
        data.account, // Column 7: account
        data.taxable, // Column 8: taxable
        data.taxabilityType, // Column 9: taxabilityType
        data.productType, // Column 10: productType
        data.intraStateTaxName, // Column 11: intraStateTaxName
        data.intraStateTaxRate, // Column 12: intraStateTaxRate
        data.intraStateTaxType, // Column 13: intraStateTaxType
        data.interStateTaxName, // Column 14: interStateTaxName
        data.interStateTaxRate, // Column 15: interStateTaxRate
        data.interStateTaxType, // Column 16: interStateTaxType
        data.status, // Column 17: status
        data.itemType, // Column 18: itemType
        data.cfMethod, // Column 19: cfMethod
        data.cfEndpoint, // Column 20: cfEndpoint
        data.cfApiId, // Column 21: cfApiId
        data.cfDeveloperHub, // Column 22: cfDeveloperHub
        data.cfProduct, // Column 23: cfProduct
        data.cfApiCategory, // Column 24: cfApiCategory
        data.cfNatureOfItem, // Column 25: cfNatureOfItem
        data.cfUsageCount, // Column 26: cfUsageCount
        new Date().toISOString(), // Column 27: timestamp
      ],
    ]

    // Append data to the sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: process.env.GOOGLE_SHEET_RANGE || "Sheet1!A:AA",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    })

    return {
      success: true,
      updatedRows: response.data.updates?.updatedRows || 0,
      spreadsheetId,
    }
  } catch (error) {
    console.error("Error appending to Google Sheet:", error)
    throw new Error(`Failed to append to Google Sheet: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function initializeGoogleSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: "service_account",
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_CLIENT_EMAIL}`,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })
    const spreadsheetId = process.env.GOOGLE_SHEET_ID

    if (!spreadsheetId) {
      throw new Error("Google Sheet ID not configured")
    }

    // Check if headers exist, if not, add them - REORDERED to match your column mapping
    const headerValues = [
      [
        "Item ID", // Column 1
        "Item Name", // Column 2
        "SKU", // Column 3
        "Description", // Column 4
        "HSN/SAC", // Column 5
        "Rate", // Column 6
        "Account", // Column 7
        "Taxable", // Column 8
        "Taxability Type", // Column 9
        "Product Type", // Column 10
        "Intra State Tax Name", // Column 11
        "Intra State Tax Rate", // Column 12
        "Intra State Tax Type", // Column 13
        "Inter State Tax Name", // Column 14
        "Inter State Tax Rate", // Column 15
        "Inter State Tax Type", // Column 16
        "Status", // Column 17
        "Item Type", // Column 18
        "CF.Method", // Column 19
        "CF.Endpoint", // Column 20
        "CF.API Id", // Column 21
        "CF.Developer Hub", // Column 22
        "CF.Product", // Column 23
        "CF.API Category", // Column 24
        "CF.Nature of Item", // Column 25
        "CF.Usage Count", // Column 26
        "Created At", // Column 27
      ],
    ]

    // Try to get existing data to check if headers exist
    try {
      const existingData = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Sheet1!A1:AA1",
      })

      if (!existingData.data.values || existingData.data.values.length === 0) {
        // No headers exist, add them
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: "Sheet1!A1:AA1",
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: headerValues,
          },
        })
      }
    } catch (error) {
      // If we can't read the sheet, try to add headers anyway
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Sheet1!A1:AA1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: headerValues,
        },
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Error initializing Google Sheet:", error)
    throw new Error(`Failed to initialize Google Sheet: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
