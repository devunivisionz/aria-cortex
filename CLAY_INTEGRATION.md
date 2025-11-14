# Clay API Integration Guide

This document explains how to integrate your application with Clay using the provided API key and table.

## Configuration

### Clay Details
- **API Key**: `a363ea7304d00dbd5f58`
- **Workspace ID**: `843156`
- **Workbook ID**: `wb_0t58hta6NcAtSFkPU8v`
- **Table ID**: `t_0t58htaPzJySmBRUWUx`
- **Table URL**: https://app.clay.com/workspaces/843156/workbooks/wb_0t58hta6NcAtSFkPU8v/tables/t_0t58htaPzJySmBRUWUx/views/gv_0t58htb3umgsvqwXsx2

### Environment Variables

Add these to your Supabase Edge Function secrets:

```bash
# Set Clay API Key
supabase secrets set CLAY_API_KEY=a363ea7304d00dbd5f58

# Get your Clay table's webhook URL from Clay UI (Table Settings > Webhooks)
# Then set it here:
supabase secrets set CLAY_WEBHOOK_URL=https://webhook.clay.com/webhook/your-webhook-id
```

For local development, create a `.env.local` file in `supabase/functions/`:

```env
CLAY_API_KEY=a363ea7304d00dbd5f58
CLAY_WEBHOOK_URL=https://webhook.clay.com/webhook/your-webhook-id
```

## How Clay Integration Works

Clay doesn't provide a traditional REST API for reading table data. Instead, it uses:

1. **Webhooks** - For sending data INTO Clay and receiving data FROM Clay
2. **HTTP API Actions** - For Clay to push enriched data to your system
3. **Enterprise API** (if applicable) - For basic lookups

## Setup Steps

### 1. Database Migration

Run the migration to create the `clay_data` table:

```bash
supabase db push
```

This creates a table to store data received from Clay.

### 2. Deploy the Edge Function

```bash
supabase functions deploy clay-integration
```

### 3. Configure Clay Webhook (Send Data FROM Clay TO Your App)

In your Clay table:
1. Go to **Table Settings** > **Integrations** > **Webhooks**
2. Click **Add Webhook**
3. Set the webhook URL to:
   ```
   https://your-project.supabase.co/functions/v1/clay-integration/webhook
   ```
4. Configure which columns to send
5. Set trigger conditions (e.g., when a row is created/updated)

### 4. Get Clay's Webhook URL (Send Data FROM Your App TO Clay)

In your Clay table:
1. Go to **Sources** > **Add Source** > **Webhook**
2. Copy the webhook URL provided
3. Add it to your environment variables as `CLAY_WEBHOOK_URL`

## API Endpoints

### 1. Receive Data from Clay
**Endpoint**: `POST /clay-integration/webhook`

Clay will automatically POST to this endpoint when configured.

**Example Payload from Clay**:
```json
{
  "tableId": "t_0t58htaPzJySmBRUWUx",
  "rowId": "row_123",
  "data": {
    "company_name": "Example Corp",
    "email": "contact@example.com",
    "industry": "Technology"
  }
}
```

### 2. Send Data to Clay
**Endpoint**: `POST /clay-integration/send`

Send individual records to Clay.

**Example Request**:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/clay-integration/send \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "New Company",
    "website": "https://example.com",
    "industry": "SaaS"
  }'
```

### 3. Sync Supabase Data to Clay
**Endpoint**: `GET /clay-integration/sync?limit=50`

Bulk sync companies from your Supabase database to Clay.

**Example Request**:
```bash
curl https://your-project.supabase.co/functions/v1/clay-integration/sync?limit=100
```

### 4. Check Integration Status
**Endpoint**: `GET /clay-integration/status`

Verify your Clay integration configuration.

**Example Request**:
```bash
curl https://your-project.supabase.co/functions/v1/clay-integration/status
```

**Example Response**:
```json
{
  "success": true,
  "status": {
    "apiKeyConfigured": true,
    "webhookUrlConfigured": true,
    "tableId": "t_0t58htaPzJySmBRUWUx",
    "workspaceId": "843156",
    "workbookId": "wb_0t58hta6NcAtSFkPU8v"
  }
}
```

## Usage Examples

### Example 1: Automatic Lead Enrichment Flow

1. New lead enters your system (via form, CRM, etc.)
2. Your app sends lead data to Clay via `/send` endpoint
3. Clay enriches the lead (finds email, company info, etc.)
4. Clay sends enriched data back via webhook to `/webhook`
5. Your app stores enriched data in `clay_data` table

### Example 2: Bulk Company Sync

```javascript
// Sync 100 companies to Clay for enrichment
const response = await fetch(
  'https://your-project.supabase.co/functions/v1/clay-integration/sync?limit=100'
);
const result = await response.json();
console.log(`Synced ${result.results.length} companies to Clay`);
```

### Example 3: Receive Enriched Data from Clay

Clay will automatically POST to your webhook endpoint. The data is stored in the `clay_data` table:

```sql
-- Query enriched data from Clay
SELECT * FROM clay_data 
WHERE table_id = 't_0t58htaPzJySmBRUWUx'
ORDER BY created_at DESC;
```

## Database Schema

### `clay_data` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| table_id | TEXT | Clay table ID |
| row_id | TEXT | Clay row ID |
| data | JSONB | The actual data from Clay |
| created_at | TIMESTAMP | When record was created |
| updated_at | TIMESTAMP | When record was last updated |

## Troubleshooting

### Webhook Not Receiving Data
1. Check that the webhook URL is correct in Clay
2. Verify the Edge Function is deployed: `supabase functions list`
3. Check Edge Function logs: `supabase functions logs clay-integration`

### Cannot Send Data to Clay
1. Verify `CLAY_WEBHOOK_URL` is set correctly
2. Check that the webhook is active in Clay
3. Verify the data format matches Clay's expected schema

### API Key Issues
1. Ensure `CLAY_API_KEY` is set in Supabase secrets
2. Note: Clay's API key is primarily for Enterprise features
3. For most operations, you'll use webhooks (no API key needed)

## Security Best Practices

1. **Never commit API keys** - Use environment variables
2. **Validate webhook payloads** - Verify data before storing
3. **Use Row Level Security** - The `clay_data` table has RLS enabled
4. **Rate limiting** - Consider adding rate limits to prevent abuse
5. **Webhook signatures** - If Clay provides webhook signatures, validate them

## Additional Resources

- [Clay University - Using Clay as an API](https://www.clay.com/university/guide/using-clay-as-an-api)
- [Clay Webhook Documentation](https://www.clay.com/university/guide/webhook-integration-guide)
- [Clay HTTP API Integration](https://www.clay.com/university/guide/http-api-integration-overview)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

## Support

For Clay-specific questions:
- Clay Community: https://community.clay.com
- Clay Support: support@clay.com

For integration issues:
- Check Edge Function logs
- Review this documentation
- Contact your development team
