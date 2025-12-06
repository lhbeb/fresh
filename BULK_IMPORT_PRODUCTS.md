# 📦 Bulk Import Products (JSON + Images)

This guide explains how to import many products at once, including their images, into Supabase.

---

## ✅ What You Need

- Node 18+ installed locally
- Access to this repository with hardcoded Supabase keys
- A local folder that contains one sub-folder per product

### Directory structure

```
products-to-import/
├─ product-slug-one/
│  ├─ product.json
│  ├─ img1.jpg
│  └─ img2.jpg
├─ product-slug-two/
│  ├─ product.json
│  ├─ thumbnail.png
│  └─ gallery-1.png
└─ ...
```

- `product.json` holds the product metadata (similar to existing JSON files).
- Image filenames can be anything (e.g. `img1.jpg`, `main.png`, etc.). The importer automatically renames them to `img1`, `img2`, … in Supabase Storage.

---

## 🧾 product.json Format

```json
{
  "slug": "sample-product",
  "title": "Sample Product",
  "description": "Detailed description...",
  "price": 199.99,
  "condition": "Brand New",
  "category": "electronics",
  "brand": "Acme",
  "checkoutLink": "https://example.com/checkout/sample-product",
  "images": [
    "thumbnail.jpg",
    "gallery-1.jpg",
    "https://existing-host.com/remote-image.jpg"
  ],
  "payeeEmail": "optional@example.com",
  "currency": "USD",
  "rating": 4.8,
  "reviewCount": 12,
  "inStock": true,
  "reviews": [],
  "meta": {}
}
```

- `images` supports a mix of local filenames and fully-qualified URLs. Remote URLs are used as-is.
- `payeeEmail` is optional. Leave blank to use your default payout email.

---

## ▶️ Run the Importer

```bash
npm install
npm run import-products -- ./products-to-import
```

### What the script does

1. Scans the provided folder for sub-directories.
2. Expects each sub-directory to contain a `product.json` file and referenced image files.
3. Uploads any local images to the Supabase `product-images` bucket under `product-slug/img#.ext`.
4. Rewrites the `images` array to use the public Supabase URLs.
5. Upserts the product data into the `products` table (creates or updates based on `slug`).

### Output

- For each product you will see `✓ Imported {slug}` or an error message.
- A final summary displays imported / skipped / failed counts.

---

## 💡 Tips

- Make sure image filenames in `product.json` exactly match the files inside the product folder.
- Remote URLs in the `images` array are preserved and not re-uploaded.
- Existing products with the same slug are updated (images list will be replaced with the newly generated URLs).
- If a product folder is missing `product.json` or required fields, it is skipped with a warning.

---

## 🔄 Updating Existing Products

To update an existing product:

- Use the same slug.
- Include the updated `product.json` and any new images you want hosted.
- Run the importer; it will overwrite the images array and product details.

---

## 🛠 Troubleshooting

- **“Image file not found”** – ensure the filenames in `images` match actual files.
- **“Supabase upsert failed”** – double-check required fields (`slug`, `title`, `description`, `price`, `images`, `condition`, `category`, `brand`, `checkoutLink`).
- **Mixed uppercase/lowercase slugs** – the storage path is sanitized to alphanumeric, dashes, and underscores. Keep slugs simple for consistent folders.

---

## 📤 Need JSON Export?

If you already have JSON files in `src/lib/products-raw/`, you can copy them into the import folder, add the image files, update the `images` entries to point to the local filenames, and run the importer.

---

Happy importing! 🚀

