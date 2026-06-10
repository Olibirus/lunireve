CREATE TYPE "public"."age_range" AS ENUM('1-2', '3-4', '5-6', '7-8', '9-10', '11-12');--> statement-breakpoint
CREATE TYPE "public"."character_type" AS ENUM('child', 'sibling', 'parent', 'grandparent', 'friend', 'pet', 'stuffed_toy', 'other');--> statement-breakpoint
CREATE TYPE "public"."language" AS ENUM('fr', 'en');--> statement-breakpoint
CREATE TYPE "public"."print_format" AS ENUM('softcover', 'hardcover');--> statement-breakpoint
CREATE TYPE "public"."print_order_status" AS ENUM('pending_payment', 'paid', 'submitted_to_printer', 'in_production', 'shipped', 'delivered', 'canceled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."story_status" AS ENUM('draft', 'published', 'archived', 'failed');--> statement-breakpoint
CREATE TYPE "public"."story_type" AS ENUM('library', 'text_story', 'picture_story');--> statement-breakpoint
CREATE TYPE "public"."subscription_plan" AS ENUM('decouverte', 'essentiel', 'premium', 'famille_plus');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'trialing', 'canceled', 'past_due', 'paused', 'incomplete');--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"base_id" varchar(30) NOT NULL,
	"language" "language" NOT NULL,
	"slug" varchar(200) NOT NULL,
	"title" varchar(200) NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"cover_image_url" text,
	"meta_description" varchar(300),
	"seo_keywords" text[] DEFAULT '{}'::text[] NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_references" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"child_profile_id" uuid,
	"reference_url" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "child_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"age_range" "age_range" NOT NULL,
	"birth_year" integer,
	"gender" varchar(20),
	"pronouns" varchar(20),
	"appearance" jsonb,
	"favorite_genres" text[] DEFAULT '{}'::text[] NOT NULL,
	"favorite_themes" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"story_id" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_preferences" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"subscribed" boolean DEFAULT true NOT NULL,
	"age_ranges" text[] DEFAULT '{}'::text[] NOT NULL,
	"genres" text[] DEFAULT '{}'::text[] NOT NULL,
	"frequency" varchar(20) DEFAULT 'weekly' NOT NULL,
	"brevo_contact_id" varchar(100),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "print_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"story_id" varchar(50) NOT NULL,
	"format" "print_format" NOT NULL,
	"price_cents" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'EUR' NOT NULL,
	"dedication_text" text,
	"gift_wrap" boolean DEFAULT false NOT NULL,
	"express_shipping" boolean DEFAULT false NOT NULL,
	"shipping_address" jsonb NOT NULL,
	"stripe_payment_intent_id" varchar(100),
	"gelato_order_id" varchar(100),
	"tracking_url" text,
	"status" "print_order_status" DEFAULT 'pending_payment' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"story_id" varchar(50) NOT NULL,
	"stars" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reading_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"child_profile_id" uuid,
	"story_id" varchar(50) NOT NULL,
	"progress_percent" integer DEFAULT 0 NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"last_read_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recurring_characters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"child_profile_id" uuid,
	"name" varchar(100) NOT NULL,
	"type" character_type NOT NULL,
	"description" text,
	"reference_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_user_id" uuid,
	"story_id" varchar(50) NOT NULL,
	"reason" varchar(50) NOT NULL,
	"details" text,
	"resolved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stories" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"base_id" varchar(30) NOT NULL,
	"language" "language" NOT NULL,
	"type" "story_type" NOT NULL,
	"status" "story_status" DEFAULT 'draft' NOT NULL,
	"title" varchar(200) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"primary_seo_keyword" varchar(200),
	"age_range" "age_range" NOT NULL,
	"genre" varchar(50) NOT NULL,
	"themes" text[] DEFAULT '{}'::text[] NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"word_count" integer DEFAULT 0 NOT NULL,
	"estimated_reading_minutes" integer,
	"chapters" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"lexical_words" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"quiz" jsonb,
	"hero_image_url" text,
	"mid_image_url" text,
	"page_images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"audio_url" text,
	"pdf_url" text,
	"pdf_print_ready_url" text,
	"owner_user_id" uuid,
	"child_profile_id" uuid,
	"series_id" uuid,
	"episode_number" integer,
	"rating_average" real DEFAULT 0 NOT NULL,
	"rating_count" integer DEFAULT 0 NOT NULL,
	"generation_metadata" jsonb,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"stripe_customer_id" varchar(100) NOT NULL,
	"stripe_subscription_id" varchar(100),
	"plan" "subscription_plan" DEFAULT 'decouverte' NOT NULL,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "usage_quotas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"text_stories_used" integer DEFAULT 0 NOT NULL,
	"picture_stories_used" integer DEFAULT 0 NOT NULL,
	"pdf_downloads_used" integer DEFAULT 0 NOT NULL,
	"audio_downloads_used" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"first_name" varchar(100),
	"preferred_language" "language" DEFAULT 'fr' NOT NULL,
	"marketing_consent" boolean DEFAULT false NOT NULL,
	"dyslexia_font" boolean DEFAULT false NOT NULL,
	"text_size" varchar(10) DEFAULT 'base' NOT NULL,
	"current_plan" "subscription_plan" DEFAULT 'decouverte' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "character_references" ADD CONSTRAINT "character_references_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_references" ADD CONSTRAINT "character_references_child_profile_id_child_profiles_id_fk" FOREIGN KEY ("child_profile_id") REFERENCES "public"."child_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "child_profiles" ADD CONSTRAINT "child_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_preferences" ADD CONSTRAINT "newsletter_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "print_orders" ADD CONSTRAINT "print_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "print_orders" ADD CONSTRAINT "print_orders_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_history" ADD CONSTRAINT "reading_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_history" ADD CONSTRAINT "reading_history_child_profile_id_child_profiles_id_fk" FOREIGN KEY ("child_profile_id") REFERENCES "public"."child_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_history" ADD CONSTRAINT "reading_history_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_characters" ADD CONSTRAINT "recurring_characters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_characters" ADD CONSTRAINT "recurring_characters_child_profile_id_child_profiles_id_fk" FOREIGN KEY ("child_profile_id") REFERENCES "public"."child_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_characters" ADD CONSTRAINT "recurring_characters_reference_id_character_references_id_fk" FOREIGN KEY ("reference_id") REFERENCES "public"."character_references"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_user_id_users_id_fk" FOREIGN KEY ("reporter_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_child_profile_id_child_profiles_id_fk" FOREIGN KEY ("child_profile_id") REFERENCES "public"."child_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_quotas" ADD CONSTRAINT "usage_quotas_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "blog_posts_slug_lang_idx" ON "blog_posts" USING btree ("language","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "favorites_user_story_idx" ON "favorites" USING btree ("user_id","story_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ratings_user_story_idx" ON "ratings" USING btree ("user_id","story_id");--> statement-breakpoint
CREATE UNIQUE INDEX "stories_keyword_lang_idx" ON "stories" USING btree ("language","primary_seo_keyword");--> statement-breakpoint
CREATE UNIQUE INDEX "stories_slug_lang_idx" ON "stories" USING btree ("language","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "usage_quotas_user_period_idx" ON "usage_quotas" USING btree ("user_id","period_start");