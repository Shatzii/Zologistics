Missing TWILIO_ACCOUNT_SID and TWILIO_PHONE_NUMBER in deployment secrets
Add TWILIO_ACCOUNT_SID and TWILIO_PHONE_NUMBER to deployment secrets with valid Twilio credentials
Missing ANTHROPIC_API_KEY in deployment secrets
Add ANTHROPIC_API_KEY to deployment secrets with valid Anthropic API key
No email service configured - email notifications disabled
Add SENDGRID_API_KEY to deployment secrets to enable email notifications
Application crashes when encountering errors during route registration
Wrap route registration and startup code in try-catch blocks to handle errors gracefully without crashing
Application fails to start when optional services like Twilio or email are not configured
Add conditional initialization for optional services so app can start even when some integrations are missing