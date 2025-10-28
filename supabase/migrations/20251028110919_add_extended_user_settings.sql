/*
  # Add Extended User Settings

  1. Schema Changes
    - Add gameplay settings columns (timer, difficulty, hints, auto-next)
    - Add theme/personalization columns (theme color, background style, UI layout, button style)
    - Add audio settings columns (music volume, SFX volume, voice volume)
    - Add control settings columns (keyboard shortcuts, touch gestures, mouse speed)
    - Add notification settings columns (friend requests, game invites, achievements, leaderboard, email notifications, notification sound)
    - Add accessibility settings columns (colorblind mode, screen reader, text-to-speech, keyboard navigation)

  2. New Columns
    Gameplay Settings:
    - `timer_enabled` (boolean) - Enable/disable quiz timer
    - `timer_speed` (integer) - Timer speed percentage (50-150)
    - `hints_enabled` (boolean) - Show hints during gameplay
    - `difficulty_level` (text) - Difficulty level (easy, medium, hard, expert)
    - `auto_next_question` (boolean) - Auto-advance to next question

    Theme/Personalization:
    - `theme_color` (text) - Primary theme color (blue, green, red, orange, purple, pink)
    - `background_style` (text) - Background style (solid, gradient, pattern, image)
    - `ui_layout` (text) - UI layout density (compact, normal, spacious)
    - `button_style` (text) - Button style (default, rounded, sharp, pill)

    Audio Settings:
    - `music_volume` (integer) - Music volume (0-100)
    - `sfx_volume` (integer) - Sound effects volume (0-100)
    - `voice_volume` (integer) - Voice/narration volume (0-100)

    Control Settings:
    - `keyboard_shortcuts_enabled` (boolean) - Enable keyboard shortcuts
    - `touch_gestures_enabled` (boolean) - Enable touch gestures
    - `mouse_speed` (integer) - Mouse sensitivity (10-100)

    Notification Settings:
    - `notify_friend_requests` (boolean) - Notify on friend requests
    - `notify_game_invites` (boolean) - Notify on game invitations
    - `notify_achievements` (boolean) - Notify on achievements
    - `notify_leaderboard` (boolean) - Notify on leaderboard changes
    - `email_notifications` (boolean) - Enable email notifications
    - `notification_sound` (text) - Notification sound (default, chime, bell, ding, none)

    Accessibility Settings:
    - `colorblind_mode` (text) - Colorblind mode (none, protanopia, deuteranopia, tritanopia, monochromacy)
    - `screen_reader_mode` (boolean) - Screen reader optimization
    - `text_to_speech` (boolean) - Text-to-speech enabled
    - `keyboard_navigation` (boolean) - Enhanced keyboard navigation

  3. Migration Safety
    - Uses ALTER TABLE ADD COLUMN IF NOT EXISTS
    - Sets sensible default values
    - No data loss risk
*/

-- Gameplay Settings
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS timer_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS timer_speed integer DEFAULT 100 CHECK (timer_speed >= 50 AND timer_speed <= 150),
  ADD COLUMN IF NOT EXISTS hints_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS difficulty_level text DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'expert')),
  ADD COLUMN IF NOT EXISTS auto_next_question boolean DEFAULT false;

-- Theme/Personalization Settings
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS theme_color text DEFAULT 'blue' CHECK (theme_color IN ('blue', 'green', 'red', 'orange', 'purple', 'pink')),
  ADD COLUMN IF NOT EXISTS background_style text DEFAULT 'gradient' CHECK (background_style IN ('solid', 'gradient', 'pattern', 'image')),
  ADD COLUMN IF NOT EXISTS ui_layout text DEFAULT 'normal' CHECK (ui_layout IN ('compact', 'normal', 'spacious')),
  ADD COLUMN IF NOT EXISTS button_style text DEFAULT 'default' CHECK (button_style IN ('default', 'rounded', 'sharp', 'pill'));

-- Audio Settings
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS music_volume integer DEFAULT 50 CHECK (music_volume >= 0 AND music_volume <= 100),
  ADD COLUMN IF NOT EXISTS sfx_volume integer DEFAULT 50 CHECK (sfx_volume >= 0 AND sfx_volume <= 100),
  ADD COLUMN IF NOT EXISTS voice_volume integer DEFAULT 50 CHECK (voice_volume >= 0 AND voice_volume <= 100);

-- Control Settings
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS keyboard_shortcuts_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS touch_gestures_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS mouse_speed integer DEFAULT 50 CHECK (mouse_speed >= 10 AND mouse_speed <= 100);

-- Notification Settings
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS notify_friend_requests boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_game_invites boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_achievements boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_leaderboard boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_notifications boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS notification_sound text DEFAULT 'default' CHECK (notification_sound IN ('default', 'chime', 'bell', 'ding', 'none'));

-- Accessibility Settings
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS colorblind_mode text DEFAULT 'none' CHECK (colorblind_mode IN ('none', 'protanopia', 'deuteranopia', 'tritanopia', 'monochromacy')),
  ADD COLUMN IF NOT EXISTS screen_reader_mode boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS text_to_speech boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS keyboard_navigation boolean DEFAULT false;
