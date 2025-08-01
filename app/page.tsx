"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle, Info, AlertCircle, ExternalLink } from "lucide-react"
import { submitToGoogleSheets } from "./actions"

interface FormData {
  itemName: string
  cfMethod: string
  cfProduct: string
  cfApiCategory: string
  cfNatureOfItem: string
  cfDeveloperHub: string
  rate: string
  cfEndpoint: string
}

interface SubmissionResult {
  success: boolean
  message: string
  data: any
  sheetInfo: any
}

export default function GoogleSheetsForm() {
  const [formData, setFormData] = useState<FormData>({
    itemName: "",
    cfMethod: "",
    cfProduct: "",
    cfApiCategory: "",
    cfNatureOfItem: "",
    cfDeveloperHub: "",
    rate: "",
    cfEndpoint: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null)
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }

    // Clear previous results when user starts typing
    if (submissionResult) {
      setSubmissionResult(null)
    }
  }

  const validateForm = () => {
    const errors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.itemName.trim()) {
      errors.itemName = "Item name is required"
    }

    if (!formData.cfMethod) {
      errors.cfMethod = "Method selection is required"
    }

    if (!formData.cfProduct) {
      errors.cfProduct = "Product selection is required"
    }

    if (!formData.cfNatureOfItem) {
      errors.cfNatureOfItem = "Nature of item selection is required"
    }

    if (!formData.cfEndpoint.trim()) {
      errors.cfEndpoint = "Endpoint is required"
    }

    if (formData.cfNatureOfItem === "Charge") {
      if (!formData.rate.trim()) {
        errors.rate = "Rate is required when nature of item is 'Charge'"
      } else {
        const rateValue = Number(formData.rate)
        if (isNaN(rateValue)) {
          errors.rate = "Rate must be a valid number"
        } else if (rateValue < 0) {
          errors.rate = "Rate cannot be negative"
        } else if (rateValue > 999999) {
          errors.rate = "Rate cannot exceed 999,999"
        }
      }
    }

    return errors
  }

  const isFormValid = () => {
    const errors = validateForm()
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors = validateForm()
    setValidationErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    setIsSubmitting(true)
    setSubmissionResult(null)

    try {
      const result = await submitToGoogleSheets(formData)
      setSubmissionResult(result)

      if (result.success) {
        // Clear form on success
        setFormData({
          itemName: "",
          cfMethod: "",
          cfProduct: "",
          cfApiCategory: "",
          cfNatureOfItem: "",
          cfDeveloperHub: "",
          rate: "",
          cfEndpoint: "",
        })
        setValidationErrors({})
      }
    } catch (error) {
      setSubmissionResult({
        success: false,
        message: "An unexpected error occurred. Please try again.",
        data: null,
        sheetInfo: null,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getGoogleSheetsUrl = () => {
    const sheetId = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID
    return sheetId ? `https://docs.google.com/spreadsheets/d/${sheetId}` : null
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Add New API to Google Sheet</CardTitle>
              <CardDescription className="text-center">
                Fill out the form below to automatically add a new item to the Sandbox API Google Sheet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Item Name */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="itemName">Item Name *</Label>
                   </div>
                  <Input
                    id="itemName"
                    value={formData.itemName}
                    onChange={(e) => handleInputChange("itemName", e.target.value)}
                    placeholder="E.g., Generate Form16 - Certificates Generated"
                    required
                    disabled={isSubmitting}
                  />
                  {validationErrors.itemName && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.itemName}</p>
                  )}
                </div>

                {/* CF.Method */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="cfMethod">Method *</Label>
                  </div>
                  <Select
                    value={formData.cfMethod}
                    onValueChange={(value) => handleInputChange("cfMethod", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="E.g., POST" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.cfMethod && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.cfMethod}</p>
                  )}
                </div>

                {/* CF.Product */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="cfProduct">Product *</Label>
               </div>
                  <Select
                    value={formData.cfProduct}
                    onValueChange={(value) => handleInputChange("cfProduct", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="E.g., TDS" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TDS">TDS</SelectItem>
                      <SelectItem value="Income Tax">Income Tax</SelectItem>
                      <SelectItem value="KYC">KYC</SelectItem>
                      <SelectItem value="GST">GST</SelectItem>
                      <SelectItem value="Virtual Bank">Virtual Bank</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.cfProduct && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.cfProduct}</p>
                  )}
                </div>

                {/* CF.API Category */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="cfApiCategory">API Category</Label>
                 </div>
                  <Select
                    value={formData.cfApiCategory}
                    onValueChange={(value) => handleInputChange("cfApiCategory", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="E.g., Analytics" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Compliance">Compliance</SelectItem>
                      <SelectItem value="Reports">Reports</SelectItem>
                      <SelectItem value="Calculator">Calculator</SelectItem>
                      <SelectItem value="Analytics">Analytics</SelectItem>
                      <SelectItem value="OCR">OCR</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.cfApiCategory && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.cfApiCategory}</p>
                  )}
                </div>

                {/* CF.Endpoint */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="cfEndpoint">Endpoint *</Label>
                  </div>
                  <Input
                    id="cfEndpoint"
                    value={formData.cfEndpoint}
                    onChange={(e) => handleInputChange("cfEndpoint", e.target.value)}
                    placeholder="E.g.,, /gst/compliance/tax-payer/gstrs/gstr-1/{year}/{month}"
                    required
                    disabled={isSubmitting}
                  />
                  {validationErrors.cfEndpoint && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.cfEndpoint}</p>
                  )}
                </div>

                {/* CF.Nature of Item */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="cfNatureOfItem">Nature of Item *</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Usage item deducts quota, Charge item deducts wallet balance. For a Paid Item, you will have one Usage item and one Charge item</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select
                    value={formData.cfNatureOfItem}
                    onValueChange={(value) => handleInputChange("cfNatureOfItem", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="E.g., Charge" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Usage">Usage</SelectItem>
                      <SelectItem value="Charge">Charge</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.cfNatureOfItem && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.cfNatureOfItem}</p>
                  )}
                </div>

                {/* Rate Field - Conditional */}
                {formData.cfNatureOfItem === "Charge" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="rate">Rate *</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enter the rate in Rupees (required when Nature of Item is Charge)</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="rate"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.rate}
                      onChange={(e) => handleInputChange("rate", e.target.value)}
                      placeholder="E.g., 0.10"
                      required
                      disabled={isSubmitting}
                    />
                    {validationErrors.rate && <p className="text-sm text-red-600 mt-1">{validationErrors.rate}</p>}
                  </div>
                )}

                {/* CF.Developer Hub */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="cfDeveloperHub">Developer Hub</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Link to API reference on our documentation</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="cfDeveloperHub"
                    value={formData.cfDeveloperHub}
                    onChange={(e) => handleInputChange("cfDeveloperHub", e.target.value)}
                    placeholder="E.g., https://developer.sandbox.co.in/reference/download-form-16-api"
                    disabled={isSubmitting}
                  />
                  {validationErrors.cfDeveloperHub && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.cfDeveloperHub}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={!isFormValid() || isSubmitting}>
                  {isSubmitting ? "Adding to Google Sheet..." : "Add Item to Google Sheet"}
                </Button>
              </form>

              {/* Results */}
              {submissionResult && (
                <div className="mt-6 space-y-4">
                  {submissionResult.success ? (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <div className="space-y-2">
                          <p className="font-medium">{submissionResult.message}</p>
                          {submissionResult.sheetInfo && (
                            <p className="text-sm">
                              Successfully added {submissionResult.sheetInfo.updatedRows} row(s) to your Google Sheet.
                            </p>
                          )}
                          {getGoogleSheetsUrl() && (
                            <a
                              href={getGoogleSheetsUrl()!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-800 underline"
                            >
                              View Google Sheet <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        <p className="font-medium">Error: {submissionResult.message}</p>
                        <p className="text-sm mt-1">Please check your configuration and try again.</p>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}
