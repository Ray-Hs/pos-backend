import prisma from "./infrastructure/database/prisma/client";
import { hash } from "./infrastructure/utils/encryptPassword";

const handleSetup = async () => {
  const userRole = await prisma.userRole.create({
    data: {
      name: "ADMIN",
      description: "Admin role with all permissions",
      permissions: {
        create: [
          {
            key: "manage_tables",
            name: "Manage Tables",
            description: "Allow user access the table management section ",
            category: "tables",
          },
          {
            key: "transfer_table",
            name: "Transfer Table",
            description: "Allow user to transfer table content",
            category: "tables",
          },
          {
            key: "table_design",
            name: "Table Design",
            description:
              "Allow users to access table design, incuding creating sections | tables.",
            category: "tables",
          },
          {
            key: "manage_inventory",
            name: "Manage Inventory",
            description:
              "Allow users to access inventory management section, incuding creating | editing | deleting items.",
            category: "inventory",
          },
          {
            key: "manage_inventory_menu_items",
            name: "Manage Inventory Menu Items",
            description: "Allow users to access inventory menu items section",
            category: "inventory",
          },
          {
            key: "manage_inventory_add_menu_items",
            name: "Manage Inventory Menu Items",
            description: "Allow users to access inventory menu items section",
            category: "inventory",
          },
          {
            key: "manage_inventory_read_storage",
            name: "Manage Inventory Read Storage",
            description: "Allow users to access inventory storage section",
            category: "inventory",
          },
          {
            key: "manage_inventory_read_purchased_products",
            name: "Manage Inventory Read Purchased Products",
            description:
              "Allow users to access inventory purchased products section",
            category: "inventory",
          },
          {
            key: "manage_inventory_read_expired_products",
            name: "Manage Inventory Read Expired Products",
            description:
              "Allow users to access inventory expired products section",
            category: "inventory",
          },
          {
            key: "manage_finance",
            name: "Manage Finance",
            description: "Allow users to access finance management section",
            category: "finance",
          },
          {
            key: "manage_finance_customer_debts",
            name: "Manage Finance Customer Debts",
            description: "Allow users to access finance customer debts section",
            category: "finance",
          },
          {
            key: "manage_finance_customer_debts_tab",
            name: "Manage Finance Customer Debts Tab",
            description:
              "Allow users to access finance customer debts tab section",
            category: "finance",
          },
          {
            key: "manage_finance_customer_payments_tab",
            name: "Manage Finance Customer Payments Tab",
            description:
              "Allow users to access finance customer payments tab section",
            category: "finance",
          },
          {
            key: "manage_finance_customer_payments",
            name: "Manage Finance Customer Payments",
            description:
              "Allow users to access finance customer payments section",
            category: "finance",
          },
          {
            key: "manage_finance_create_customer_debts",
            name: "Manage Finance Create Customer Debts",
            description:
              "Allow users to access finance create customer debts section",
            category: "finance",
          },
          {
            key: "manage_finance_company_debts",
            name: "Manage Finance Company Debts",
            description: "Allow users to access finance company debts section",
            category: "finance",
          },
          {
            key: "manage_finance_company_debts_tab",
            name: "Manage Finance Company Debts Tab",
            description:
              "Allow users to access finance company debts tab section",
            category: "finance",
          },
          {
            key: "manage_finance_company_payments_tab",
            name: "Manage Finance Company Payments Tab",
            description:
              "Allow users to access finance company payments tab section",
            category: "finance",
          },
          {
            key: "manage_finance_company_debts_payments_tab",
            name: "Manage Finance Company Debts & Payments Tab",
            description:
              "Allow users to access finance company debts & payments tab section",
            category: "finance",
          },
          {
            key: "manage_finance_invoices",
            name: "Manage Finance Invoices",
            description: "Allow users to access finance invoices section",
            category: "finance",
          },
          {
            key: "manage_finance_daily_exchange_rate",
            name: "Manage Finance Daily Exchange",
            description: "Allow users to access finance daily exchange section",
            category: "finance",
          },
          {
            key: "manage_reports",
            name: "Manage Reports",
            description: "Allow users to access reports section",
            category: "reports",
          },
          {
            key: "manage_reports_general_reports",
            name: "Manage Reports General Reports",
            description:
              "Allow users to access reports general reports section",
            category: "reports",
          },
          {
            key: "manage_reports_end_of_day",
            name: "Manage End Of Day Reports",
            description: "Allow users to access end of day reports section",
            category: "reports",
          },
          {
            key: "manage_reports_deleted_order_items",
            name: "Manage Deleted Order Items",
            description: "Allow users to access deleted order items section",
            category: "reports",
          },
          {
            key: "manage_crm",
            name: "Manage CRM",
            description: "Allow users to access crm section",
            category: "crm",
          },
          {
            key: "manage_crm_customers",
            name: "Manage CRM Customers",
            description: "Allow users to access crm customers section",
            category: "crm",
          },
          {
            key: "manage_crm_companies",
            name: "Manage CRM Companies",
            description: "Allow users to access crm companies section",
            category: "crm",
          },
          {
            key: "manage_crm_customer_discounts",
            name: "Manage CRM Customer Discounts",
            description: "Allow users to access crm customer discounts section",
            category: "crm",
          },
          {
            key: "manage_settings",
            name: "Manage Settings",
            description:
              "Allow users to access settings section such as language, general, currency settings",
            category: "settings",
          },
          {
            key: "manage_settings_general",
            name: "Manage General Settings",
            description: "Allow users to access settings general section",
            category: "settings",
          },
          {
            key: "manage_settings_language",
            name: "Manage Language Settings",
            description: "Allow users to access settings language section",
            category: "settings",
          },
          {
            key: "manage_settings_currency",
            name: "Manage Currency Settings ",
            description: "Allow users to access settings currency section",
            category: "settings",
          },
          {
            key: "manage_settings_printers",
            name: "Manage Printers Settings",
            description: "Allow users to access settings printers section",
            category: "settings",
          },
          {
            key: "manage_settings_users",
            name: "Manage Users Settings",
            description: "Allow users to access settings users section",
            category: "settings",
          },
          {
            key: "manage_settings_constants",
            name: "Manage Constants Settings",
            description: "Allow users to access settings constants section",
            category: "settings",
          },
        ],
      },
    },
  });

  const hashedPassword = hash("admin");

  const user = await prisma.user.create({
    data: {
      password: hashedPassword,
      username: "admin",
      roleId: userRole.id,
    },
  });
};

handleSetup();
