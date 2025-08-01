interface SlackNotificationData {
  itemName: string
  cfMethod: string
  cfProduct: string
  cfApiCategory: string
  cfNatureOfItem: string
  rate: number
  cfApiId: string
}

export async function sendSlackNotification(data: SlackNotificationData): Promise<boolean> {
  try {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL

    if (!webhookUrl) {
      console.error("Slack webhook URL not configured")
      return false
    }

    // Format the message to match the example image - conditionally show rate
    const rateText = data.cfNatureOfItem === "Charge" ? `\n*Rate:* ${data.rate}` : ""

    const message = {
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*API Name:* ${data.itemName}\n*Product:* ${data.cfProduct}\n*Category:* ${data.cfApiCategory || "N/A"}\n*Nature of Item:* ${data.cfNatureOfItem}${rateText}\n*API Id:* ${data.cfMethod}:${data.cfApiId}`,
          },
        },
      ],
    }

    // Send the notification
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    })

    if (!response.ok) {
      console.error("Failed to send Slack notification:", await response.text())
      return false
    }

    return true
  } catch (error) {
    console.error("Error sending Slack notification:", error)
    return false
  }
}
