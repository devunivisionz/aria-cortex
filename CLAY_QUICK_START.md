# Clay Integration - Quick Start

## 🚀 Setup (5 minutes)

### 1. Deploy to Supabase
```bash
# Run the setup script
.\scripts\setup-clay.ps1

# Or manually:
supabase secrets set CLAY_API_KEY=a363ea7304d00dbd5f58
supabase db push
supabase functions deploy clay-integration
```

### 2. Configure Clay Webhook (Send FROM Clay TO Your App)
1. Open your Clay table: https://app.clay.com/workspaces/843156/workbooks/wb_0t58hta6NcAtSFkPU8v/tables/t_0t58htaPzJySmBRUWUx
2. Go to **Table Settings** → **Integrations** → **Webhooks**
3. Add webhook URL: `https://your-project.supabase.co/functions/v1/clay-integration/webhook`
4. Select columns to send
5. Save

### 3. Get Clay's Webhook URL (Send FROM Your App TO Clay)
1. In Clay table, click **Sources** → **Add Source** → **Webhook**
2. Copy the webhook URL
3. Set it: `supabase secrets set CLAY_WEBHOOK_URL=<your-webhook-url>`

### 4. Test
```bash
node scripts/test-clay-integration.js
```

## 📡 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/webhook` | POST | Receive data from Clay |
| `/send` | POST | Send single record to Clay |
| `/sync` | GET | Bulk sync companies to Clay |
| `/status` | GET | Check configuration |

## 💡 Common Use Cases

### Send a Lead to Clay for Enrichment
```javascript
await fetch('https://your-project.supabase.co/functions/v1/clay-integration/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    company_name: "Acme Corp",
    website: "https://acme.com"
  })
});
```

### Sync 100 Companies to Clay
```bash
curl "https://your-project.supabase.co/functions/v1/clay-integration/sync?limit=100"
```

### Query Enriched Data from Clay
```sql
SELECT * FROM clay_data 
WHERE table_id = 't_0t58htaPzJySmBRUWUx'
ORDER BY created_at DESC;
```

## 🔍 Troubleshooting

**Webhook not working?**
- Check Edge Function logs: `supabase functions logs clay-integration`
- Verify webhook URL in Clay settings
- Ensure function is deployed: `supabase functions list`

**Can't send to Clay?**
- Verify `CLAY_WEBHOOK_URL` is set: `supabase secrets list`
- Check Clay webhook is active in Sources

**Need help?**
- See full docs: `CLAY_INTEGRATION.md`
- Clay Community: https://community.clay.com

## 📊 Your Clay Table
- **Workspace**: 843156
- **Table ID**: t_0t58htaPzJySmBRUWUx
- **Direct Link**: https://app.clay.com/workspaces/843156/workbooks/wb_0t58hta6NcAtSFkPU8v/tables/t_0t58htaPzJySmBRUWUx/views/gv_0t58htb3umgsvqwXsx2

---

**Note**: TypeScript errors in the IDE for the Edge Function are expected - Deno types aren't configured in your IDE, but the function will work correctly when deployed to Supabase.
