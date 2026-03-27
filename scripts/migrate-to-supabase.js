// Script to migrate data from Neon (Prisma) to Supabase
// Run: node scripts/migrate-to-supabase.js

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE env vars. Make sure .env is loaded.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function migrateProducts() {
  // Connect to Neon via pg
  const { Client } = require("pg");
  const pg = new Client({ connectionString: DATABASE_URL });
  await pg.connect();

  console.log("Connected to Neon database...");

  // Fetch all products from Neon
  const { rows: products } = await pg.query('SELECT * FROM "Product" ORDER BY "createdAt" DESC');
  console.log(`Found ${products.length} products in Neon`);

  for (const p of products) {
    const slug = p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const { error } = await supabase.from("products").insert({
      name: p.name,
      slug: slug,
      description: p.description || "",
      price: p.price,
      pricing_tiers: p.pricingTiers,
      instructions: p.instructions,
      image_url: p.imageUrl || "",
      image_public_id: p.imagePublicId,
      pinned_image_url: p.pinnedImageUrl,
      pinned_image_public_id: p.pinnedImagePublicId,
      in_stock: p.inStock,
      is_visible: p.isVisible,
    });

    if (error) {
      console.error(`Failed to insert "${p.name}": ${error.message}`);
    } else {
      console.log(`Migrated: ${p.name}`);
    }
  }

  // Migrate settings
  const { rows: settings } = await pg.query('SELECT * FROM "Settings" LIMIT 1');
  if (settings.length > 0) {
    const s = settings[0];
    // Update existing default settings
    const { error } = await supabase
      .from("settings")
      .update({
        site_password: s.sitePassword,
        whatsapp_number: s.whatsappNumber,
        telegram_username: s.telegramUsername,
        site_name: s.siteName,
        site_description: s.siteDescription,
        products_sold: s.productsSold || 0,
      })
      .not("id", "is", null); // update all rows

    if (error) {
      console.error(`Failed to migrate settings: ${error.message}`);
    } else {
      console.log("Migrated settings");
    }
  }

  // Migrate reviews
  const { rows: reviews } = await pg.query(`
    SELECT r.*, u.email, u.username
    FROM "Review" r
    JOIN "User" u ON r."userId" = u.id
  `);
  console.log(`Found ${reviews.length} reviews`);

  // We can't migrate reviews without matching user IDs, so just log them
  if (reviews.length > 0) {
    console.log("Note: Reviews require matching Supabase user IDs. You may need to re-submit them.");
  }

  await pg.end();
  console.log("\nMigration complete!");
}

async function createAdminUser() {
  const email = "anildev26@gmail.com";
  const password = "Aio2026";
  const username = "Anil";

  console.log(`\nCreating admin user: ${email}...`);

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username },
  });

  if (error) {
    if (error.message.includes("already")) {
      console.log("Admin user already exists, updating role...");
      // Find and update role
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (profiles) {
        await supabase
          .from("profiles")
          .update({ role: "ADMIN" })
          .eq("id", profiles.id);
        console.log("Role updated to ADMIN");
      }
    } else {
      console.error(`Failed to create admin: ${error.message}`);
    }
    return;
  }

  // Update profile to ADMIN
  if (data.user) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: "ADMIN" })
      .eq("id", data.user.id);

    if (profileError) {
      console.error(`Failed to set admin role: ${profileError.message}`);
    } else {
      console.log(`Admin user created: ${email} / ${password}`);
    }
  }
}

async function main() {
  await createAdminUser();
  if (DATABASE_URL) {
    await migrateProducts();
  } else {
    console.log("\nNo DATABASE_URL found. Skipping product migration.");
    console.log("To migrate products, add DATABASE_URL to .env and re-run.");
  }
}

main().catch(console.error);
