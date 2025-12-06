# Email Setup Instructions

To enable email functionality for the checkout form, you need to set up the following environment variables:

## 1. Create a `.env.local` file in the root directory with:

```
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Base URL for the application
APP_BASE_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 2. Gmail Setup Instructions:

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

### Step 2: Generate App Password
1. Go to your Google Account settings
2. Navigate to Security
3. Under "2-Step Verification", click on "App passwords"
4. Generate a new app password for "Mail"
5. Use this password as your `EMAIL_PASS` in the `.env.local` file

### Step 3: Update Environment Variables
- Replace `your-email@gmail.com` with your actual Gmail address
- Replace `your-app-password` with the app password you generated

## 3. For Production:
- Update both `APP_BASE_URL` and `NEXT_PUBLIC_BASE_URL` to your production domain
- Ensure your hosting provider supports environment variables

## 4. Testing:
- The checkout form will now validate phone numbers
- Shipping information will be sent to matrix01mehdi@gmail.com
- The form requires all fields including phone number before proceeding

## Security Notes:
- Never commit your `.env.local` file to version control
- The `.env.local` file is already in `.gitignore`
- Use app passwords instead of your main Gmail password 