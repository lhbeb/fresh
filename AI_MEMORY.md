CRITICAL RULES - NEVER VIOLATE THESE

DO NOT MODIFY CODE WITHOUT EXPLICIT PERMISSION

NEVER change any code unless user specifically says: "change this code" or "modify this file"
If user asks about something, EXPLAIN first, don't modify
Always ASK before making changes: "Do you want me to modify this file?"


VERIFY BEFORE ACTION

COUNT all images in folders before updating any product JSON
CHECK file extensions match exactly (JPEG vs JPG vs PNG)
CONFIRM paths exist before referencing them



PROJECT STRUCTURE - MEMORIZE THIS
File Locations
Product Data: /src/lib/products-raw/[slug]/product.json
Product Images: /public/products/[slug]/
About Page: /src/app/about/page.tsx
Contact Page: /src/app/contact/page.tsx
Privacy Policy: /src/app/privacy-policy/page.tsx
Footer: /src/components/Footer.tsx
Checkout: /src/app/checkout/page.tsx
Current Configuration

Business Address: 315 Lancaster Avenue, Haverford, PA 19041, USA
Tech Stack: Next.js 15, TypeScript, Tailwind CSS
Supported Countries: US, Canada, UK, Australia, Netherlands

PRODUCT MANAGEMENT PROTOCOL
When Adding New Product:

CREATE slug format: brand-model-description-lowercase-with-dashes
COUNT actual images in /public/products/[slug]/ folder
VERIFY each image file extension (don't assume .jpg if it's .jpeg)
CREATE JSON with exact structure:

json{
  "name": "Product Full Name",
  "slug": "exact-slug-matching-folder",
  "price": 0.00,
  "description": "Description here",
  "images": ["image1.jpeg", "image2.jpeg"],
  "category": "appropriate-category",
  "inStock": true,
  "specifications": {},
  "seo": {
    "title": "SEO Title",
    "description": "SEO Description",
    "keywords": ["keyword1", "keyword2"]
  }
}
When Updating Product:

FIRST check existing product.json
COUNT images in public folder
COMPARE image count with JSON
UPDATE only changed fields
PRESERVE all other data

CHECKOUT FORM DATA
Netherlands Provinces (COMPLETE LIST):

Drenthe
Flevoland
Friesland
Gelderland
Groningen
Limburg
North Brabant
North Holland
Overijssel
South Holland
Utrecht
Zeeland

Form Validation Requirements:

Email: valid format required
Phone: numbers only
Province: 2+ characters to show suggestions
All fields marked with * are required

ERROR PREVENTION CHECKLIST
Before ANY action:

 Did user explicitly request this change?
 Have I verified all file paths exist?
 Have I counted actual images vs JSON references?
 Will this break existing functionality?
 Have I preserved all existing data?

RESPONSE TEMPLATES
When user asks to check something:
"I'll investigate [specific item]. Let me check the current state first..."
[Show findings]
"Would you like me to make any changes?"
When user reports an error:
"I see the issue with [specific problem]. The current state shows:
[Current state]
The issue is: [explanation]
Would you like me to fix this by [specific solution]?"
When adding products:
"I'll add the [product name] with:
- Slug: [slug]
- Images found: [count] files
- Price: $[amount]
Should I proceed with these settings?"
FORBIDDEN ACTIONS - NEVER DO THESE

NEVER assume file extensions
NEVER modify code "to improve" without permission
NEVER delete existing data when updating
NEVER change addresses without explicit instruction
NEVER guess image counts - always verify
NEVER change prices without confirmation
NEVER modify checkout flow without testing

SUCCESS CRITERIA
Your response is successful when:

Zero functionality breaks
All images load correctly
User explicitly confirms changes
No assumptions were made
All paths were verified
Existing features remain intact

REMEMBER: When in doubt, ASK FIRST, ACT SECOND