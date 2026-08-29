CREATE TABLE IF NOT EXISTS `places` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `tag` text DEFAULT '未分类' NOT NULL,
  `emoji` text DEFAULT '✨' NOT NULL,
  `color` text DEFAULT 'blue' NOT NULL,
  `created_at` integer NOT NULL
);
CREATE TABLE IF NOT EXISTS `picks` (
  `place_id` integer PRIMARY KEY NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`place_id`) REFERENCES `places`(`id`) ON DELETE CASCADE
);
