# Jugnu: website and order system

The website for a family bedsheet manufacturer in **Ichra, Lahore**.
It is built with **TypeScript, NestJS and PostgreSQL**.

## Features

- **Catalog**: 16 starter products in 7 categories, with search, category and fabric filters, sorting, a detail popup and shareable product links (`/products?id=JT-101`).
- **Two price levels**: retail and wholesale. The wholesale rate applies automatically once an item reaches its minimum order quantity (MOQ). The server always recalculates prices from the database.
- **Order list (cart)**: customers add items and choose sizes and quantities, then send an order request. They get a reference number such as `JT-261111-4821` and can follow up on WhatsApp.
- **Wholesale page**: a live rate table, private-label (OEM) information and a quote request form.
- **Contact page**: contact form, phone, WhatsApp, email and an embedded Google Map of Ichra.
- **English / اردو toggle**, including right-to-left layout and a Nastaliq font.
- **About & Process**: the full Pakistani supply chain, from cotton field to bed.
- **Admin panel** (`/admin`): view and filter orders and inquiries, update their status (new → contacted → confirmed → in production → dispatched → closed), add private notes, and add, edit, hide or delete products, prices and stock.
- **Protection**: input validation, a spam honeypot, a rate limit of 5 submissions per minute per IP, and a password on the admin area.
- **SEO basics**: titles and meta tags on every page, `robots.txt` blocks `/admin`, and the layout is mobile-first.

The products currently have **illustrations** generated from their print colours. Once you have real photos, paste a photo URL into a product's **Photo URL** field in the admin panel.

## Research

See [docs/SUPPLY_CHAIN.md](docs/SUPPLY_CHAIN.md) for the supply chain from cotton to bed: cost breakdown, risks, seasonality, growth opportunities, a supplier checklist and a glossary.

## Run locally

```bash
# needs Node 20+ and PostgreSQL
createdb jugnu
cp .env.example .env        # then edit ADMIN_TOKEN and your business details
npm install
npm run build && npm start  # http://localhost:3000   (admin: /admin)
```

## Deploy on Render

1. Go to <https://dashboard.render.com/blueprints> and choose **New Blueprint Instance**. Select this repo.
2. Render reads `render.yaml` and creates the web service and the Postgres database.
3. In the service's **Environment** tab, copy the generated `ADMIN_TOKEN`. That is your admin password. Set your real WhatsApp number, phone, email and address there too.

> Render's free Postgres expires after 30 days. For long-term use, either upgrade the database (around $7/month), or create a free database at [neon.tech](https://neon.tech) and set `DATABASE_URL` to its connection string with `DATABASE_SSL=true`.

## Project layout

```
src/                 NestJS backend (TypeScript)
  products/          Product entity, seed catalog, public + admin APIs
  inquiries/         Orders / quotes / contact messages, pricing, admin APIs
  site/              Business info API and health check
  common/            Admin guard
client/              Frontend TypeScript, compiled to public/js
public/              HTML pages and CSS, served by Nest
docs/                Supply-chain research
```

## API

| Method | Path | Auth |
|---|---|---|
| GET | `/api/site` | Public |
| GET | `/api/products?category=` · `/api/products/:id` | Public |
| POST | `/api/inquiries` | Public (rate-limited) |
| GET/PATCH | `/api/admin/inquiries` · `/api/admin/inquiries/stats` · `/api/admin/inquiries/:id` | `x-admin-token` |
| GET/POST/PATCH/DELETE | `/api/admin/products[/:id]` | `x-admin-token` |
