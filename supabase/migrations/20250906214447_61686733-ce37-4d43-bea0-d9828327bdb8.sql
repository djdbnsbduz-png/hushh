-- Add customization fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS customization JSONB DEFAULT '{
  "theme": "dark",
  "font_family": "Inter",
  "font_size": "medium",
  "background_type": "default",
  "background_value": null,
  "accent_color": "#6B7280",
  "message_bubble_style": "rounded",
  "sidebar_width": "normal",
  "custom_css": null
}'::jsonb;