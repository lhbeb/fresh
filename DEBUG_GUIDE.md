# Debug Tools Guide

When you click "Add to Cart" and get an internal server error, use these debugging tools in the Chrome console:

## Quick Debug Commands

Open Chrome DevTools (F12) and go to the Console tab, then use:

### 1. View All Debug Logs
```javascript
window.__debug.logs()
```
This shows a table of all debug logs with timestamps, labels, and data.

### 2. View Cart Data
```javascript
window.__debug.cart()
```
This shows what's currently stored in localStorage for the cart.

### 3. Clear Debug Logs
```javascript
window.__debug.clear()
```
This clears all debug logs and the console.

## What to Look For

When you click "Add to Cart", you should see logs in this order:

1. **handleAddToCart: Function called** - Button click detected
2. **handleAddToCart: {productId, productSlug}** - Product details
3. **🛒 Cart: addToCart called** - Cart function invoked
4. **🛒 Cart: creating clean product** - Product being processed
5. **🛒 Cart: serialization successful** - Product can be serialized
6. **🛒 Cart: stored in localStorage** - Cart saved successfully
7. **🧭 Navigation: Attempting navigation to /checkout** - Starting navigation
8. **handleAddToCart: Using router.push** - Next.js router navigation
9. **handleAddToCart: router.push called successfully** - Navigation initiated

If you see an error (🔴 red badge), it will show:
- Where the error occurred
- The error message
- The stack trace
- Full error details

## Common Error Patterns

### If error happens at "addToCart: serialization failed"
- The product data contains non-serializable data
- Check the product object structure

### If error happens at "localStorage.setItem failed"
- localStorage might be full or disabled
- Check browser storage settings

### If error happens at "router.push failed"
- Navigation issue
- May need to use `window.location.href` fallback

### If error happens at "CheckoutPage: useEffect"
- The checkout page is trying to read cart data
- Cart might be corrupted or missing

## Server Error Troubleshooting

If you see "Internal Server Error":

1. **Check Network Tab** - Look for any failed API requests
2. **Check Console Logs** - Use `window.__debug.logs()` to see the flow
3. **Check Cart Data** - Use `window.__debug.cart()` to verify cart contents
4. **Check Server Logs** - Look at terminal/vercel logs for server-side errors

## Export Debug Data

To share debug information:
```javascript
console.log(JSON.stringify(window.__debugLogs, null, 2))
```
Copy the output and share it for troubleshooting.

