const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

// Environment variables to integrate into the build
const envVars = {
  NODE_ENV: "production",
  PORT: "3001",
  HOST: "localhost",
  API_PREFIX: "/api",
  BODY_LIMIT: "10mb",
  COMPRESSION: "true",
  DATABASE_URL: "postgresql://r_pos:restaurant_pos1234567@localhost:5432/r_pos",
  DATABASE_SSL: "false",
  JWT_SECRET_KEY:
    "K#8zR2qoJp7@yV!9FgNc*4hGmL6vP5u^3H@X&6sL1wB+T3iA2nC_0sM*O0aG6eE#9lK3oM8xQ@yU8vB4kL1zI7aR!3jE3bG3d",
  BASE_URL: "http://localhost:3001",
  B2_KEY_ID: "",
  B2_KEY: "",
  BUCKET_NAME: "restaurant-pos",
  CUSTOMER_COUNT: "100",
};

// Create define object for esbuild
const define = {};
Object.entries(envVars).forEach(([key, value]) => {
  define[`process.env.${key}`] = JSON.stringify(value);
});

// Build optimized single bundle with environment variables integrated
esbuild
  .build({
    entryPoints: ["src/server.ts"],
    bundle: true,
    platform: "node",
    target: "node20",
    outfile: "dist/server.js",
    external: [
      // Only keep modules that absolutely cannot be bundled (native binaries)
      "canvas",
      "puppeteer",
      "node-thermal-printer",
      "@point-of-sale/network-receipt-printer",
      "node-html-to-image",
      "html-to-image",
      "pdf-to-printer",
      "node-gyp",
      "node-pre-gyp",
    ],
    define,
    sourcemap: true,
    minify: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    format: "cjs",
    loader: {
      ".ts": "ts",
    },
    treeShaking: true,
  })
  .then(() => {
    console.log(
      "✅ Bundle built successfully with environment variables integrated"
    );

    // Create minimal runtime package.json for native dependencies
    const runtimePackage = {
      name: "pos-backend-runtime",
      version: "1.0.0",
      description: "Runtime dependencies for bundled POS backend",
      main: "server.js",
      scripts: {
        start: "node server.js",
        "install-deps": "npm install --only=production",
      },
      dependencies: {
        canvas: "^3.1.2",
        puppeteer: "^24.12.0",
        "node-thermal-printer": "^4.5.0",
        "@point-of-sale/network-receipt-printer": "^2.0.1",
        "node-html-to-image": "^5.0.0",
        "html-to-image": "^1.11.13",
        "pdf-to-printer": "^5.6.0",
      },
    };

    // Ensure dist directory exists
    if (!fs.existsSync("dist")) {
      fs.mkdirSync("dist");
    }

    fs.writeFileSync(
      path.join("dist", "package.json"),
      JSON.stringify(runtimePackage, null, 2)
    );

    // Copy Prisma query engines and client
    const prismaClientPath = path.join("node_modules", "@prisma", "client");
    const distPrismaPath = path.join(
      "dist",
      "node_modules",
      "@prisma",
      "client"
    );

    if (fs.existsSync(prismaClientPath)) {
      // Create the directory structure
      fs.mkdirSync(distPrismaPath, { recursive: true });

      // Copy the entire Prisma client directory
      fs.cpSync(prismaClientPath, distPrismaPath, { recursive: true });
      console.log("✅ Prisma client copied to dist/");
    }

    // Copy native Prisma query engine binary
    const prismaQueryEnginePath = path.join(
      "node_modules",
      "prisma",
      "query_engine-windows.dll.node"
    );
    const distQueryEnginePath = path.join(
      "dist",
      "query_engine-windows.dll.node"
    );

    if (fs.existsSync(prismaQueryEnginePath)) {
      fs.copyFileSync(prismaQueryEnginePath, distQueryEnginePath);
      console.log("✅ Prisma query engine binary copied to dist/");
    }

    // Copy Prisma schema directory and migrations
    const prismaDir = path.join("dist", "prisma");
    if (!fs.existsSync(prismaDir)) {
      fs.mkdirSync(prismaDir, { recursive: true });
    }

    // Copy schema directory
    const schemaPath = "src/infrastructure/database/prisma/schema";
    if (fs.existsSync(schemaPath)) {
      const schemaDest = path.join(prismaDir, "schema");
      if (!fs.existsSync(schemaDest)) {
        fs.mkdirSync(schemaDest, { recursive: true });
      }
      // Copy schema directory recursively
      fs.cpSync(schemaPath, schemaDest, { recursive: true });
    }

    // Copy migrations if they exist
    const migrationsPath = "src/infrastructure/database/prisma/migrations";
    if (fs.existsSync(migrationsPath)) {
      const migrationsDest = path.join(prismaDir, "migrations");
      if (!fs.existsSync(migrationsDest)) {
        fs.mkdirSync(migrationsDest, { recursive: true });
      }
      // Copy migrations directory
      fs.cpSync(migrationsPath, migrationsDest, { recursive: true });
    }

    console.log("✅ Runtime package.json created");
    console.log("✅ Prisma files copied to dist/");
    console.log(
      "📦 Bundle size:",
      (fs.statSync("dist/server.js").size / 1024 / 1024).toFixed(2),
      "MB"
    );
    console.log("🚀 Ready to run: npm run start");
    console.log("📋 To install native dependencies: cd dist && npm install");
    console.log("💡 The dist folder is now completely self-contained!");
  })
  .catch((error) => {
    console.error("❌ Build failed:", error);
    process.exit(1);
  });
