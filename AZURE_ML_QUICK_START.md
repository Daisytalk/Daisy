# Azure ML Integration - Quick Start Guide

## ✅ What's Been Set Up

I've implemented a complete Azure ML endpoint integration for your Next.js project that works with your CBT Therapy API hosted on Azure.

### Files Created:

1. **`src/shared/lib/azure-ml.ts`** - Azure ML service module
2. **`src/app/api/azure-ml/inference/route.ts`** - API route handler
3. **`src/shared/types/azure-ml.ts`** - TypeScript type definitions  
4. **`src/shared/hooks/use-azure-ml.ts`** - React hook for frontend
5. **`src/widgets/azure-ml-chat-example.tsx`** - Example components

### Files Updated:

1. **`.env.example`** - Added Azure ML configuration
2. **`src/shared/lib/cbt-api.ts`** - Replaced all AWS references with Azure

---

## 🚀 How to Use

### 1. Environment Setup

Add to your `.env` or `.env.local`:

```env
CBT_API_URL="http://cbt-therapy-api-daisy-ergpf5fecjeheub5.centralus-01.azurewebsites.net"
CBT_API_KEY="apiendpointformyapplication"
CBT_API_TIMEOUT="30000"
```

### 2. Frontend Usage (React Hook)

```tsx
import { useAzureML } from '@/shared/hooks/use-azure-ml';

function MyChatComponent() {
  const { sendPrompt, isLoading, error, response } = useAzureML();

  const handleSend = async (message: string) => {
    await sendPrompt(message, {
      persona: 'empathetic',  // optional
      session_id: conversationId,  // optional
    });
  };

  return (
    <div>
      <button onClick={() => handleSend('Hello!')} disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send'}
      </button>
      
      {response && <p>{response.response}</p>}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

### 3. Direct API Call

```typescript
// POST /api/azure-ml/inference
const response = await fetch('/api/azure-ml/inference', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
  },
  body: JSON.stringify({
    text: 'Your message here',
    session_id: 'optional-session-id',
    persona: 'empathetic',
  }),
});

const data = await response.json();
// Returns: { response, protocol_used, diagnosis, persona_used, tone, ...}
```

---

## 📋 API Format

### Request Format

```typescript
{
  text: string;           // Required: The user's message
  session_id?: string;    // Optional: For conversation tracking
  persona?: string;       // Optional: Persona preference
}
```

### Response Format

```typescript
{
  response: string;           // The AI's response
  protocol_used?: string;     // CBT protocol used
  diagnosis?: string[];       // Diagnosed issues
  persona_used?: string;      // Persona that was used
  tone?: string;              // Tone of response
  status?: string;            // Status
  conversationId?: string;    // Session ID (if provided)
  duration?: number;          // Response time in ms
}
```

---

## 🔄 Changes Made to Existing Files

### `src/shared/lib/cbt-api.ts`

**Before:**
- Used AWS API Gateway URL (`amazonaws.com`)
- Had `apiGatewayUrl` property
- Hardcoded AWS endpoint

**After:**  
- Uses Azure endpoint from environment (`CBT_API_URL`)
- Renamed to `apiUrl` property
- All console logs updated to say "Azure CBT API instead of "API Gateway"
- Fallback to your Azure endpoint if env var not set

---

## 🎯 Key Features

✅ **Authentication** - Automatic user authentication via JWT  
✅ **Error Handling** - Comprehensive error handling and logging  
✅ **Timeout Management** - Configurable request timeouts  
✅ **Type Safety** - Full TypeScript support  
✅ **Auto-Retry** - Optional auto-retry with exponential backoff  
✅ **React Integration** - Easy-to-use React hook  

---

## 📦 Example Components

Two example components are included in `src/widgets/azure-ml-chat-example.tsx`:

1. **AzureMLChatExample** - Full-featured chat with conversation history
2. **SimpleAzureMLExample** - Basic single message/response

---

## ✨ Next Steps

1. ✅ Environment variables are configured in `.env.example`
2. ✅ Import the hook: `import { useAzureML } from '@/shared/hooks/use-azure-ml'`
3. ✅ Use in your components - see examples above
4. ✅ Test with your Azure endpoint

---

## 🔍 Testing

### Check Configuration
```bash
curl http://localhost:3000/api/azure-ml/inference
```

Should return:
```json
{
  "status": "ok",
  "configured": true,
  "message": "Azure ML CBT API endpoint is configured"
}
```

### Test Inference
Use the example components or make a direct API call as shown above.

---

## 📝 Notes

- **User ID** is automatically derived from the authenticated user (JWT token)
- **Session tracking** is optional - provide `session_id` to track conversations
- **Persona** can be specified per request or left to the API to decide
- All network requests include detailed logging for debugging

---

## 🛠️ Troubleshooting

**Problem:** "Azure ML CBT API configuration missing"  
**Solution:** Ensure `CBT_API_URL` and `CBT_API_KEY` are set in your `.env` file

**Problem:** "Authorization token required"  
**Solution:** User must be logged in - the hook automatically gets the auth token from cookies

**Problem:** Request timeout  
**Solution:** Increase `CBT_API_TIMEOUT` in your `.env` file (default: 30000ms)

---

## 📚 Additional Resources

- Full documentation: See the TypeScript types in `src/shared/types/azure-ml.ts`
- Example usage: Check `src/widgets/azure-ml-chat-example.tsx`
- API route: Review `src/app/api/azure-ml/inference/route.ts` for customization

**All AWS references have been replaced with Azure!** 🎉
