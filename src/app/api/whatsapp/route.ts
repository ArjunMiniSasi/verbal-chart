import { NextRequest, NextResponse } from 'next/server'

const MSG91_API_URL = 'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/'
const MSG91_AUTH_KEY = '416736AumKHkzR65d6ec4bP1'
const INTEGRATED_NUMBER = '917907827984'
const TEMPLATE_NAME = 'farmer_alert'
const LANGUAGE_CODE = 'hi'
const NAMESPACE = '85df72af_b23d_42d8_8ed9_b6af31924e91'
const IMAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/vetqure-pms.firebasestorage.app/o/Hackathon%2FLSD.png?alt=media&token=54d6290a-0192-4266-a8cf-efa5e1c9af68'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Format phone number (ensure it starts with country code)
    const formattedPhone = phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`

    // Construct MSG91 API payload
    const payload = {
      integrated_number: INTEGRATED_NUMBER,
      content_type: 'template',
      payload: {
        messaging_product: 'whatsapp',
        type: 'template',
        template: {
          name: TEMPLATE_NAME,
          language: {
            code: LANGUAGE_CODE,
            policy: 'deterministic'
          },
          namespace: NAMESPACE,
          to_and_components: [
            {
              to: [formattedPhone],
              components: {
                header_1: {
                  type: 'image',
                  value: IMAGE_URL
                }
              }
            }
          ]
        }
      }
    }

    console.log('📱 Sending WhatsApp message to:', formattedPhone)
    console.log('📱 MSG91 Payload:', JSON.stringify(payload, null, 2))

    // Make request to MSG91 API
    const response = await fetch(MSG91_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': MSG91_AUTH_KEY
      },
      body: JSON.stringify(payload)
    })

    console.log('📱 MSG91 API Response Status:', response.status)

    // Check if response is OK and has JSON content
    let responseData
    const contentType = response.headers.get('content-type')

    if (contentType && contentType.includes('application/json')) {
      try {
        responseData = await response.json()
        console.log('📱 MSG91 API Response:', JSON.stringify(responseData, null, 2))
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError)
        const text = await response.text()
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid JSON response from MSG91 API',
            details: text.substring(0, 200)
          },
          { status: 500 }
        )
      }
    } else {
      const text = await response.text()
      console.log('📱 MSG91 API Response (non-JSON):', text.substring(0, 200))
      responseData = { message: text, raw: text }
    }

    if (!response.ok) {
      console.error('❌ MSG91 API Error:', responseData)
      return NextResponse.json(
        {
          success: false,
          error: responseData.message || responseData.error || 'Failed to send WhatsApp message',
          details: responseData
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'WhatsApp message sent successfully',
      data: responseData
    })

  } catch (error) {
    console.error('❌ WhatsApp API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send WhatsApp message'
      },
      { status: 500 }
    )
  }
}
