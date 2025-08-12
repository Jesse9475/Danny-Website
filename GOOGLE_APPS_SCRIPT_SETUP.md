# Google Apps Script Web App Setup Guide

## Overview
This guide will walk you through setting up a Google Apps Script Web App to receive contact submissions from your dealership website, automatically save them to Google Sheets, and send email notifications.

## Step 1: Create Your Google Sheet

### 1.1 Go to Google Sheets
- Visit [sheets.google.com](https://sheets.google.com)
- Click "+ Blank" to create a new spreadsheet
- Name it "Autohaus Contact Submissions"

### 1.2 Set Up Column Headers
In the first row, add these headers:
```
A1: Timestamp
B1: Name
C1: Email
D1: Phone
E1: Service (Vehicle)
F1: Message
G1: Email Sent Status
```

### 1.3 Format the Sheet
- Select all headers and make them bold
- Adjust column widths as needed
- Freeze the header row (View → Freeze → 1 row)

## Step 2: Create the Google Apps Script

### 2.1 Open Apps Script Editor
1. In your Google Sheet, click "Extensions" → "Apps Script"
2. This will open the script editor in a new tab

### 2.2 Create the Web App Script
Replace the default code with the following:

```javascript
// Global variables
var SHEET_NAME = "Form Responses 1"; // Change this if your sheet has a different name
var RECIPIENT_EMAIL = "hs5422902@gmail.com"; // Replace with your email

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

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    message: "Autohaus Contact Form Web App is running"
  })).setMimeType(ContentService.MimeType.JSON);
}

function setup() {
  // This function helps set up the sheet if it doesn't exist
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);
    // Add headers
    sheet.appendRow(["Timestamp", "Name", "Email", "Phone", "Service", "Message", "Email Sent Status"]);
    
    // Format headers
    var headersRange = sheet.getRange("A1:G1");
    headersRange.setFontWeight("bold");
    headersRange.setBackground("#f3f3f3");
    
    Logger.log("Sheet '" + SHEET_NAME + "' created successfully");
  } else {
    Logger.log("Sheet '" + SHEET_NAME + "' already exists");
  }
}

function testEmail() {
  // Test function to verify email functionality
  var testResult = sendEmailNotification(
    "Test Customer",
    "test@example.com",
    "555-123-4567",
    "2023 BMW 3 Series",
    "This is a test message to verify the email notification system is working correctly."
  );
  
  Logger.log("Test email result: " + testResult);
  return testResult;
}
```

### 2.3 Save the Script
1. Click the floppy disk icon (💾) to save the script
2. Name your project "Autohaus Contact Form Web App"

## Step 3: Deploy as Web App

### 3.1 Deploy the Web App
1. Click "Deploy" → "New deployment" in the top right
2. Click the gear icon (⚙️) next to "Select type" and choose "Web app"
3. Configure the deployment settings:
   - **Description**: "Autohaus Contact Form Handler"
   - **Execute as**: "Me (your email address)"
   - **Who has access**: "Anyone" (this allows public submissions from your website)
4. Click "Deploy"

### 3.2 Authorize the Web App
1. Google will ask for permissions
2. Click "Authorize access"
3. Select your Google account
4. Click "Advanced" (it might say "Go to Autohaus Contact Form Web App (unsafe)")
5. Click "Go to Autohaus Contact Form Web App (unsafe)"
6. Click "Allow"

### 3.3 Get Your Web App URL
1. After deployment, you'll see a "Web app URL"
2. Copy this URL - it will look like: `https://script.google.com/macros/s/YOUR_WEB_APP_ID/exec`
3. This is the URL you need to put in your website code

## Step 4: Update Your Website Code

### 4.1 Replace the Web App URL
In `/src/app/[make]/[model]/[id]/page.tsx`, replace the placeholder URL:

```javascript
const scriptUrl = 'https://script.google.com/macros/s/YOUR_WEB_APP_ID/exec';
```

Replace `YOUR_WEB_APP_ID` with your actual web app ID.

### 4.2 Update Email Address
In the Google Apps Script, update the recipient email:

```javascript
var RECIPIENT_EMAIL = "hs5422902@gmail.com"; // Replace with your email
```

## Step 5: Test the Integration

### 5.1 Test the Web App
1. Open your web app URL in a browser - you should see a JSON response
2. Test the email function by running `testEmail` from the script editor

### 5.2 Test the Form
1. Go to your website
2. Click on any car and open the contact form
3. Fill out the form with test data
4. Click "Send Message"

### 5.3 Check Results
1. Check your Google Sheet - the submission should appear
2. Check your email - you should receive a notification
3. The "Email Sent Status" column should show the timestamp

## Step 6: Advanced Features (Optional)

### 6.1 Multiple Recipients
Update the email function to send to multiple people:

```javascript
var RECIPIENT_EMAILS = ["hs5422902@gmail.com", "sales@autohaus.com", "manager@autohaus.com"];

// In sendEmailNotification function:
MailApp.sendEmail({
  to: RECIPIENT_EMAILS.join(","), // Join multiple emails with commas
  subject: subject,
  body: body
});
```

### 6.2 HTML Email
For better formatting, use HTML emails:

```javascript
function sendEmailNotification(name, email, phone, service, message) {
  var subject = "New Vehicle Inquiry - " + service;
  
  var htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff;">
        <h2 style="color: #333; margin-top: 0;">🚗 New Vehicle Inquiry</h2>
        <p style="color: #666; margin-bottom: 20px;">You have received a new contact form submission from your Autohaus dealership website.</p>
        
        <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
          <h3 style="color: #333; margin-top: 0; border-bottom: 2px solid #007bff; padding-bottom: 5px;">📝 Customer Information</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
        </div>
        
        <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
          <h3 style="color: #333; margin-top: 0; border-bottom: 2px solid #007bff; padding-bottom: 5px;">🚗 Vehicle of Interest</h3>
          <p>${service}</p>
        </div>
        
        <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
          <h3 style="color: #333; margin-top: 0; border-bottom: 2px solid #007bff; padding-bottom: 5px;">💬 Message</h3>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            📅 Submitted: ${new Date().toLocaleString()}<br>
            This is an automated notification from your Autohaus dealership website.
          </p>
        </div>
      </div>
    </div>
  `;
  
  try {
    MailApp.sendEmail({
      to: RECIPIENT_EMAIL,
      subject: subject,
      htmlBody: htmlBody
    });
    
    Logger.log("HTML email notification sent successfully to " + RECIPIENT_EMAIL);
    return "HTML email sent: " + new Date().toLocaleString();
    
  } catch (emailError) {
    Logger.log("Failed to send HTML email notification: " + emailError.toString());
    return "HTML email failed: " + emailError.toString();
  }
}
```

### 6.3 Error Handling and Logging
Add more robust error handling:

```javascript
function doPost(e) {
  try {
    // Validate input parameters
    if (!e.parameter.name || !e.parameter.email || !e.parameter.message) {
      return ContentService.createTextOutput(JSON.stringify({
        result: "error",
        error: "Missing required fields"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Rest of the code...
    
  } catch(error) {
    Logger.log("Error in doPost: " + error.toString());
    Logger.log("Stack trace: " + error.stack);
    
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      error: "Internal server error",
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Make sure you're using `mode: 'no-cors'` in your fetch request
2. **Permission Denied**: Ensure your web app is deployed with "Anyone" access
3. **Email Not Sending**: Check that you've authorized the script correctly
4. **Sheet Not Found**: Verify the sheet name matches exactly in the script

### Debug Mode:
Add logging to help troubleshoot:

```javascript
function doPost(e) {
  Logger.log("Received parameters: " + JSON.stringify(e.parameter));
  // ... rest of the code
}
```

Check logs in Apps Script: View → Logs

### Testing the Web App:
You can test your web app using curl:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phone":"555-123-4567","service":"Test Vehicle","message":"Test message"}' \
  "https://script.google.com/macros/s/YOUR_WEB_APP_ID/exec"
```

## Security Notes:
- The web app is publicly accessible, but only accepts POST requests
- All submissions are logged in your Google Sheet
- Consider adding rate limiting or CAPTCHA if you receive spam
- Regularly check your sheet for submissions

This setup provides a robust, automated system for handling contact form submissions from your dealership website, with immediate email notifications and organized data storage in Google Sheets.