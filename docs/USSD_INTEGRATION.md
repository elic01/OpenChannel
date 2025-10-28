# USSD Integration Guide

## Overview

OpenChannel supports USSD (Unstructured Supplementary Service Data) for feature phone access, enabling employees without smartphones to submit anonymous feedback.

## How It Works

1. **Dial USSD Code**: Employees dial a short code (e.g., `*384*123#`)
2. **Navigate Menu**: Interactive text-based menu system
3. **Submit Feedback**: Type feedback directly via USSD
4. **Anonymous**: Phone numbers are hashed, not stored

## Menu Flow

\`\`\`
Welcome to OpenChannel
1. Submit Feedback
2. Respond to Poll
3. View Recent Updates
0. Exit

→ Select 1 (Submit Feedback)

Select feedback category:
1. Workplace Culture
2. Management
3. Compensation
4. Work-Life Balance
5. Career Development
6. Communication
7. Facilities
8. Diversity & Inclusion
9. Other
0. Back

→ Select category (e.g., 2 for Management)

Please type your feedback.
Keep it brief and clear.
0. Cancel

→ Type feedback text

Confirm submission:
Category: Management
Feedback: [preview]
1. Submit
2. Edit
0. Cancel

→ Select 1 to submit

Thank you! Your feedback has been submitted anonymously.
\`\`\`

## Integration Setup

### 1. USSD Gateway Provider

Choose a USSD gateway provider (examples):
- **Africa's Talking** (Africa)
- **Twilio** (Global)
- **Nexmo/Vonage** (Global)
- **Local Telecom Providers**

### 2. Configure Webhook

Point your USSD gateway to:
\`\`\`
POST https://your-domain.com/api/ussd/webhook
\`\`\`

### 3. Request Format

The webhook expects:
\`\`\`json
{
  "sessionId": "unique-session-id",
  "serviceCode": "*384*123#",
  "phoneNumber": "+254712345678",
  "text": "1*2*My feedback text"
}
\`\`\`

### 4. Response Format

Returns USSD-formatted responses:
- `CON [message]` - Continue session (show menu)
- `END [message]` - End session (final message)

## Testing

### Local Testing

Use the test endpoint:
\`\`\`bash
curl -X POST http://localhost:3000/api/ussd/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+254712345678",
    "text": "1*2*This is my feedback"
  }'
\`\`\`

### Simulator

Most USSD providers offer simulators:
- Africa's Talking: USSD Simulator in dashboard
- Twilio: Programmable Wireless Simulator

## Privacy & Security

- **Phone Hashing**: Phone numbers are hashed using SHA-256
- **No PII Storage**: Only hashes stored, not actual numbers
- **Rate Limiting**: Prevent spam via phone hash tracking
- **Session Timeout**: 5-minute session expiry

## Limitations

- **Text Length**: USSD messages limited to ~182 characters
- **No Rich Media**: Text-only interface
- **Session Management**: Temporary in-memory storage
- **Network Dependent**: Requires cellular network

## Production Considerations

1. **Session Storage**: Use Redis instead of in-memory
2. **Rate Limiting**: Implement per-phone-hash limits
3. **Monitoring**: Track USSD usage and errors
4. **Localization**: Support multiple languages
5. **Fallback**: Handle network timeouts gracefully

## Cost

USSD costs vary by provider and region:
- Typically $0.01-0.05 per session
- Charged to organization, not employee
- Volume discounts available

## Support

For USSD integration support:
- Check provider documentation
- Test thoroughly with simulators
- Monitor webhook logs
- Implement error handling
