# Clay Integration Setup Script for PowerShell
# This script helps you set up the Clay integration

Write-Host "🎨 Clay Integration Setup" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
$supabaseCli = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseCli) {
    Write-Host "❌ Supabase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Supabase CLI found" -ForegroundColor Green
Write-Host ""

# Set Clay API Key
Write-Host "📝 Setting Clay API Key..." -ForegroundColor Yellow
$clayApiKey = "a363ea7304d00dbd5f58"
supabase secrets set CLAY_API_KEY=$clayApiKey

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Clay API Key set successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to set Clay API Key" -ForegroundColor Red
}
Write-Host ""

# Prompt for Clay Webhook URL
Write-Host "🔗 Clay Webhook URL Setup" -ForegroundColor Yellow
Write-Host "To get your Clay webhook URL:" -ForegroundColor Cyan
Write-Host "1. Go to your Clay table" -ForegroundColor White
Write-Host "2. Click 'Sources' > 'Add Source' > 'Webhook'" -ForegroundColor White
Write-Host "3. Copy the webhook URL provided" -ForegroundColor White
Write-Host ""
$webhookUrl = Read-Host "Enter your Clay Webhook URL (or press Enter to skip)"

if ($webhookUrl) {
    supabase secrets set CLAY_WEBHOOK_URL=$webhookUrl
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Clay Webhook URL set successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to set Clay Webhook URL" -ForegroundColor Red
    }
} else {
    Write-Host "⏭️  Skipped webhook URL setup" -ForegroundColor Yellow
}
Write-Host ""

# Run database migration
Write-Host "🗄️  Running database migration..." -ForegroundColor Yellow
supabase db push

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database migration completed" -ForegroundColor Green
} else {
    Write-Host "❌ Database migration failed" -ForegroundColor Red
}
Write-Host ""

# Deploy Edge Function
Write-Host "🚀 Deploying Clay integration Edge Function..." -ForegroundColor Yellow
supabase functions deploy clay-integration

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Edge Function deployed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Edge Function deployment failed" -ForegroundColor Red
}
Write-Host ""

# Display next steps
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Configure Clay webhook to send data to your app:" -ForegroundColor White
Write-Host "   URL: https://your-project.supabase.co/functions/v1/clay-integration/webhook" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Test the integration:" -ForegroundColor White
Write-Host "   curl https://your-project.supabase.co/functions/v1/clay-integration/status" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Read the full documentation:" -ForegroundColor White
Write-Host "   See CLAY_INTEGRATION.md for detailed usage" -ForegroundColor Yellow
Write-Host ""
Write-Host "✨ Setup complete!" -ForegroundColor Green
