# Google Forms & Sheets Integration Setup Guide

## Overview
This guide will walk you through setting up Google Forms to receive contact submissions from your dealership website, and creating a Google Sheets macro to automatically send email notifications when new submissions are received.

## Step 1: Create Your Google Form

### 1.1 Go to Google Forms
- Visit [forms.google.com](https://forms.google.com)
- Click "+ Blank" to create a new form
- Name your form "Autohaus Contact Form" or similar

### 1.2 Add Form Fields
Add the following fields to your form:

1. **Name** (Short answer) - Required
2. **Email** (Short answer) - Required
3. **Phone** (Short answer) - Optional
4. **Message** (Paragraph) - Required
5. **Vehicle of Interest** (Short answer) - Required
6. **Submission Date** (Date) - Optional
7. **Contact Method Preference** (Multiple choice: Email, Phone, Either) - Optional

### 1.3 Configure Form Settings
- Click the gear icon (⚙️) for settings
- Under "Responses":
  - ✅ Collect email addresses
  - ✅ Limit to 1 response
  - ❌ Allow response editing
  - ❌ See summary charts and text responses
- Click "Linked Sheets" and create a new Google Sheet

## Step 2: Get Your Form Field IDs

### 2.1 Find Field IDs
1. Preview your form (click the eye icon 👁️)
2. Right-click on each form field and select "Inspect"
3. Look for the `name` attribute in the input field - it will look like `entry.1234567890`
4. Copy these IDs for each field

### 2.2 Update Your Website Code
Replace the placeholder IDs in `/src/app/[make]/[model]/[id]/page.tsx`:

```javascript
formData.append('entry.1234567890', contactForm.name); // Name field ID
formData.append('entry.0987654321', contactForm.email); // Email field ID
formData.append('entry.1122334455', contactForm.phone); // Phone field ID
formData.append('entry.5544332211', contactForm.message); // Message field ID
formData.append('entry.6677889900', `${carData.year} ${carData.make} ${carData.model}`); // Vehicle field ID
```

### 2.3 Get Your Form URL
1. In your Google Form, click "Send" (➤)
2. Click the link icon (🔗)
3. Copy the URL - it will look like: `https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform`
4. Replace `YOUR_FORM_ID` in the website code with your actual form ID

## Step 3: Create the Google Sheets Macro

### 3.1 Open the Linked Google Sheet
- Your Google Form automatically created a Google Sheet
- Open this sheet (it should be named "Autohaus Contact Form (Responses)")

### 3.2 Open Apps Script Editor
1. In the Google Sheet, click "Extensions" → "Apps Script"
2. This will open the script editor in a new tab

### 3.3 Create the Email Notification Macro
Replace the default code with the following:

```javascript
function onFormSubmit(e) {
  // Get the form submission data
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var row = e.range.getRow();
  var data = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Extract form data (adjust column indices based on your sheet structure)
  var timestamp = data[0]; // Column A
  var email = data[1]; // Column B
  var name = data[2]; // Column C
  var phone = data[3]; // Column D
  var message = data[4]; // Column E
  var vehicle = data[5]; // Column F
  var submissionDate = data[6]; // Column G
  var contactPreference = data[7]; // Column H
  
  // Create email subject and body
  var subject = "New Vehicle Inquiry - " + vehicle;
  
  var emailBody = `
New contact form submission received:

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Vehicle of Interest: ${vehicle}
Submission Date: ${submissionDate || timestamp}
Contact Preference: ${contactPreference || 'Not specified'}

Message:
${message}

---
This is an automated notification from your Autohaus dealership website.
Please respond to the customer promptly.
  `;
  
  // Send email notification
  try {
    MailApp.sendEmail({
      to: "your-dealership@email.com", // Replace with your dealership email
      subject: subject,
      body: emailBody,
      name: "Autohaus Dealership"
    });
    
    // Log the email sent
    sheet.getRange(row, sheet.getLastColumn()).setValue("Email sent: " + new Date());
    
  } catch (error) {
    // Log any errors
    sheet.getRange(row, sheet.getLastColumn()).setValue("Email failed: " + error.message);
  }
}

function createTrigger() {
  // Create a trigger that runs when form is submitted
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.newTrigger('onFormSubmit')
    .forSpreadsheet(sheet)
    .onFormSubmit()
    .create();
}
```

### 3.4 Save and Set Up the Trigger
1. Click the floppy disk icon (💾) to save the script
2. Name your project "Autohaus Email Notifications"
3. Click the clock icon (⏰) in the left sidebar to open Triggers
4. Click "+ Add Trigger" in the bottom right
5. Configure the trigger as follows:
   - Choose which function to run: `onFormSubmit`
   - Select event source: `From spreadsheet`
   - Select event type: `On form submit`
   - Click "Save"

### 3.5 Authorize the Script
1. Google will ask for permissions to send emails
2. Click "Review permissions"
3. Select your Google account
4. Click "Advanced" (it might say "Go to Autohaus Email Notifications (unsafe)")
5. Click "Go to Autohaus Email Notifications (unsafe)"
6. Click "Allow"

## Step 4: Test the Integration

### 4.1 Test the Form
1. Go to your website
2. Click on any car and open the contact form
3. Fill out the form with test data
4. Click "Send Message"

### 4.2 Check Results
1. Check your Google Sheet - the submission should appear
2. Check your email - you should receive a notification
3. The last column should show "Email sent: [timestamp]"

## Step 5: Customize and Enhance

### 5.1 Email Customization
You can customize the email template in the script to include:
- Your dealership logo
- Additional formatting
- Links to vehicle details
- Contact information

### 5.2 Multiple Recipients
To send emails to multiple people, modify the email section:

```javascript
MailApp.sendEmail({
  to: "sales@autohaus.com, manager@autohaus.com", // Multiple emails separated by commas
  subject: subject,
  body: emailBody,
  name: "Autohaus Dealership"
});
```

### 5.3 Add CC/BCC
```javascript
MailApp.sendEmail({
  to: "sales@autohaus.com",
  cc: "manager@autohaus.com",
  bcc: "owner@autohaus.com",
  subject: subject,
  body: emailBody,
  name: "Autohaus Dealership"
});
```

## Troubleshooting

### Common Issues:
1. **Form not submitting**: Check that field IDs are correct
2. **Email not sending**: Verify the trigger is set up correctly
3. **Permission errors**: Make sure you've authorized the script
4. **Column mismatch**: Adjust column indices in the script to match your sheet

### Debug Mode:
Add logging to help troubleshoot:

```javascript
function onFormSubmit(e) {
  Logger.log('Form submitted: ' + JSON.stringify(e));
  // ... rest of the code
}
```

Check logs in Apps Script: View → Logs

## Security Notes:
- The form uses Google's secure infrastructure
- Emails are sent from your Google account
- All data is stored in your Google Sheet
- Consider setting up email filters to organize incoming inquiries

This setup will automatically email your dealership whenever someone submits a contact form through your website, making it easy to respond quickly to potential customers.