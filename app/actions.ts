"use server"

import { v4 as uuidv4 } from "uuid"
import { appendToGoogleSheet } from "@/lib/google-sheets"
import { sendSlackNotification } from "@/lib/slack-notification"

interface FormData {
  itemName: string
  cfMethod: string
  cfProduct: string
  cfApiCategory: string
  cfNatureOfItem: string
  cfDeveloperHub: string
  rate: string // Add rate field
  cfEndpoint: string
}

export async function submitToGoogleSheets(formData: FormData) {
  try {
    // Generate complete data with auto-filled fields
    const sku = uuidv4()
    const cfApiId = `${formData.cfMethod}:${formData.cfEndpoint}`

    const completeData = {
      // User inputs
      itemName: formData.itemName,
      cfMethod: formData.cfMethod,
      cfProduct: formData.cfProduct,
      cfApiCategory: formData.cfApiCategory,
      cfNatureOfItem: formData.cfNatureOfItem,
      cfUsageCount: formData.cfNatureOfItem === "Usage" ? 1 : 0,
      cfDeveloperHub: formData.cfDeveloperHub,

      // Auto-generated/fixed fields
      sku,
      description: null,
      hsnSac: "998314",
      rate: formData.cfNatureOfItem === "Charge" ? Number.parseFloat(formData.rate) : 0.0,
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
      cfEndpoint: formData.cfEndpoint,
      cfApiId,
      itemId: null,
    }

    // Submit to Google Sheets
    const result = await appendToGoogleSheet(completeData)

    // Send Slack notification on successful Google Sheets submission
    try {
      await sendSlackNotification({
        itemName: completeData.itemName,
        cfMethod: completeData.cfMethod,
        cfProduct: completeData.cfProduct,
        cfApiCategory: completeData.cfApiCategory || "N/A",
        cfNatureOfItem: completeData.cfNatureOfItem,
        rate: completeData.rate,
        cfApiId: completeData.cfEndpoint, // Pass just the endpoint, we'll format in the notification
      })
    } catch (notificationError) {
      // Log notification error but don't fail the submission
      console.error("Failed to send notification:", notificationError)
    }

    return {
      success: true,
      message: "Item successfully added to Google Sheet!",
      data: completeData,
      sheetInfo: result,
    }
  } catch (error) {
    console.error("Server action error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to add item to Google Sheet",
      data: null,
      sheetInfo: null,
    }
  }
}
