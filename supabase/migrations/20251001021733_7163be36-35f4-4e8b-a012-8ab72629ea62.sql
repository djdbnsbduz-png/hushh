-- Update profiles table to include new customization fields
-- This updates the default value for existing customization column
ALTER TABLE public.profiles 
ALTER COLUMN customization 
SET DEFAULT '{
  "theme": "dark",
  "font_size": "medium",
  "custom_css": null,
  "font_family": "Inter",
  "accent_color": "#6B7280",
  "sidebar_width": "normal",
  "spacing": "normal",
  "background_type": "default",
  "background_value": null,
  "message_bubble_style": "rounded",
  "border_radius": "medium",
  "card_shadow": "medium",
  "animation_speed": "normal",
  "hover_effects": true
}'::jsonb;