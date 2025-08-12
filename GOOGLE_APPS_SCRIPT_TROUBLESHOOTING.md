# Google Apps Script Troubleshooting Guide

## 🔍 **Common Issues & Solutions**

### Issue 1: Form Not Submitting to Google Sheets

#### **Problem:**
- Form submission shows success but no data appears in Google Sheets
- No email notification received
- Google Sheet remains empty

#### **Solution: Check Your Google Apps Script**

1. **Verify Your Script Has the Correct Code:**
   - Open your Google Sheet
   - Go to Extensions → Apps Script
   - Make sure your script has the `doPost(e)` function

2. **Required Script Structure:**
```javascript
var SHEET_NAME = "Form Responses 1"; // Must match your sheet name
var RECIPIENT_EMAIL = "hs5422902@gmail.com"; // Your email

function doPost(e) {
  try {
    // Get the parameters from the POST request
    var name = e.parameter.name;
    var email = e.parameter.email;
    var phone = e.parameter.phone;
    var service = e.parameter.service;
    var message = e.parameter.message;
    
    // Get the active spreadsheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    
    // If sheet doesn't exist, create it
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);
      // Add headers
      sheet.appendRow(["Timestamp", "Name", "Email", "Phone", "Service", "Message", "Email Sent Status"]);
    }
    
    // Add a new row with the form data
    var timestamp = new Date();
    sheet.appendRow([timestamp, name, email, phone, service, message, "Processing..."]);
    
    // Send email notification
    var emailStatus = sendEmailNotification(name, email, phone, service, message);
    
    // Update the email status in the sheet
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 7).setValue(emailStatus);
    
    // Return a success response
    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      message: "Form submitted successfully"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch(error) {
    // Log the error for debugging
    Logger.log("Error in doPost: " + error.toString());
    
    // Return an error response
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function sendEmailNotification(name, email, phone, service, message) {
  var subject = "New Vehicle Inquiry - " + service;
  
  var body = "You have received a new contact form submission from your Autohaus dealership website:\n\n" +
             "─────────────────────────────────\n" +
             "📝 Customer Information:\n" +
             "Name: " + name + "\n" +
             "Email: " + email + "\n" +
             "Phone: " + (phone || "Not provided") + "\n\n" +
             "🚗 Vehicle of Interest:\n" +
             service + "\n\n" +
             "💬 Message:\n" +
             message + "\n" +
             "─────────────────────────────────\n\n" +
             "📅 Submitted: " + new Date().toLocaleString() + "\n\n" +
             "Please respond to this inquiry promptly to provide excellent customer service.\n\n" +
             "This is an automated notification from your Autohaus dealership website.";
  
  try {
    MailApp.sendEmail({
      to: RECIPIENT_EMAIL,
      subject: subject,
      body: body
    });
    
    Logger.log("Email notification sent successfully to " + RECIPIENT_EMAIL);
    return "Email sent: " + new Date().toLocaleString();
    
  } catch (emailError) {
    Logger.log("Failed to send email notification: " + emailError.toString());
    return "Email failed: " + emailError.toString();
  }
}
```

### Issue 2: Google Sheet Name Mismatch

#### **Problem:**
- Script can't find the sheet because the name doesn't match

#### **Solution:**
1. **Check Your Sheet Name:**
   - Open your Google Sheet
   - Look at the tab name at the bottom
   - It must match exactly what's in your script

2. **Common Sheet Names:**
   - "Form Responses 1" (default for Google Forms)
   - "Sheet1" (default for new sheets)
   - "Autohaus Contact Submissions" (custom name)

3. **Update Your Script:**
```javascript
var SHEET_NAME = "Sheet1"; // Change to match your actual sheet name
```

### Issue 3: Web App Deployment Issues

#### **Problem:**
- Web app URL not working
- Permissions not set correctly
- Web app not deployed as "Execute as: Me" and "Who has access: Anyone"

#### **Solution:**
1. **Redeploy Your Web App:**
   - Open your Google Apps Script
   - Click "Deploy" → "New deployment"
   - Click the gear icon and select "Web app"
   - Set:
     - **Description**: "Autohaus Contact Form Handler"
     - **Execute as**: "Me (your email address)"
     - **Who has access**: "Anyone"
   - Click "Deploy"
   - Authorize the permissions

2. **Get the Correct URL:**
   - After deployment, copy the "Web app URL"
   - It should look like: `https://script.google.com/macros/s/.../exec`

### Issue 4: Email Not Sending

#### **Problem:**
- Data appears in sheet but no email received
- Email status shows "Email failed"

#### **Solution:**
1. **Check Email Address:**
```javascript
var RECIPIENT_EMAIL = "hs5422902@gmail.com"; // Make sure this is correct
```

2. **Check Email Quotas:**
- Google Apps Script has email sending limits
- Free accounts: 100 recipients per day
- If you exceed the limit, emails won't send

3. **Check Spam Folder:**
- Sometimes emails go to spam
- Check your spam/junk folder

### Issue 5: CORS Issues

#### **Problem:**
- Browser console shows CORS errors
- Form submission blocked by browser

#### **Solution:**
Your website code should use:
```javascript
const response = await fetch(scriptUrl, {
  method: 'POST',
  body: urlEncodedData,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  mode: 'no-cors' // This is required
});
```

## 🔧 **Testing Steps**

### Step 1: Test the Web App Directly
1. Open your web app URL in a browser
2. You should see a JSON response like: `{"status":"active","message":"Autohaus Contact Form Web App is running"}`

### Step 2: Test with curl
```bash
curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -d "name=Test User&email=test@example.com&phone=555-123-4567&service=Test Vehicle&message=Test message" "https://script.google.com/macros/s/AKfycbwVP4X9ufkMhEunl6JCH-QL9DUu59RMMJ1lFjSLbEYcZiItfTQ0vf4iSy9yzOEOZQPAIA/exec"
```

### Step 3: Check Google Apps Script Logs
1. Open your Google Apps Script
2. Click "Executions" in the left sidebar
3. Look for recent executions and any error messages

### Step 4: Check Google Sheet
1. Open your Google Sheet
2. Look for new rows with test data
3. Check the "Email Sent Status" column

## 🚨 **Quick Fix Checklist**

### If Nothing Works:
1. ✅ **Sheet name matches** in script
2. ✅ **Email address is correct** in script
3. ✅ **Web app deployed** with "Anyone" access
4. ✅ **Script has doPost function**
5. ✅ **Script has sendEmailNotification function**
6. ✅ **Website uses URL-encoded data**
7. ✅ **Website uses mode: 'no-cors'**

### Still Not Working?
1. **Create a new Google Sheet** and start fresh
2. **Copy the exact script** from this guide
3. **Redeploy the web app** with a new deployment
4. **Update the website** with the new URL

## 📞 **Final Troubleshooting**

If you've tried everything and it's still not working:

1. **Check Browser Console:**
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for any error messages when submitting the form

2. **Check Network Tab:**
   - Open Developer Tools (F12)
   - Go to Network tab
   - Submit the form
   - Look for the request to your script URL
   - Check the response status

3. **Manual Test:**
   - Fill out the form on your website
   - Check if the data appears in Google Sheets within 1-2 minutes
   - Check your email within 5 minutes

## 🎯 **Success Indicators**

When everything is working correctly:
- ✅ Form submission shows success message
- ✅ Data appears in Google Sheets immediately
- ✅ Email notification arrives within 1-2 minutes
- ✅ "Email Sent Status" column shows timestamp
- ✅ No errors in browser console
- ✅ No errors in Apps Script executions