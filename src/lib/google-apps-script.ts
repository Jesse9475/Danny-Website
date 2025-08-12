// Google Apps Script integration utility
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyjpSRgo-F63jXH4BMR7C-eyHMQwZHjQboqoGhNkHiMY5mXMZjEqKinpqIittny1QqVdw/exec';

export interface GoogleAppsScriptResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
}

export async function callGoogleAppsScript(action: string, params: Record<string, any> = {}): Promise<GoogleAppsScriptResponse> {
  try {
    console.log('Calling Google Apps Script with action:', action, 'params:', params);
    
    // Create FormData object for the POST request
    const data = new FormData();
    
    // Add action parameter
    data.append('action', action);
    
    // Add all other parameters
    Object.entries(params).forEach(([key, value]) => {
      data.append(key, value?.toString() || '');
    });

    // Send POST request to Google Apps Script
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      body: data,
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error text:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Response result:', result);
    
    if (result.result === 'success') {
      return { 
        success: true, 
        data: result.data,
        message: result.message || 'Operation completed successfully!' 
      };
    } else {
      throw new Error(result.error || 'Unknown error occurred');
    }
  } catch (error) {
    console.error('Error calling Google Apps Script:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to complete operation' 
    };
  }
}

export async function submitToGoogleAppsScript(formData: ContactFormData): Promise<{ success: boolean; message: string }> {
  try {
    console.log('Submitting form data:', formData);
    
    // Create FormData object for the POST request
    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('phone', formData.phone || '');
    data.append('service', formData.service || 'General Inquiry');
    data.append('message', formData.message);

    console.log('Sending request to:', GOOGLE_APPS_SCRIPT_URL);

    // Send POST request to Google Apps Script
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      body: data,
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error text:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Response result:', result);
    
    if (result.result === 'success') {
      return { success: true, message: 'Form submitted successfully!' };
    } else {
      throw new Error(result.error || 'Unknown error occurred');
    }
  } catch (error) {
    console.error('Error submitting to Google Apps Script:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to submit form' 
    };
  }
}

// Helper function for test drive requests
export async function submitTestDriveRequest(
  name: string,
  email: string,
  phone: string,
  vehicleInfo: string,
  preferredDate?: string,
  preferredTime?: string,
  additionalNotes?: string
): Promise<{ success: boolean; message: string }> {
  const message = `Test Drive Request for ${vehicleInfo}${preferredDate ? `\nPreferred Date: ${preferredDate}` : ''}${preferredTime ? `\nPreferred Time: ${preferredTime}` : ''}${additionalNotes ? `\nAdditional Notes: ${additionalNotes}` : ''}`;
  
  return submitToGoogleAppsScript({
    name,
    email,
    phone,
    service: `Test Drive - ${vehicleInfo}`,
    message
  });
}

// Additional utility functions for different actions
export async function submitInventoryUpdate(carData: any): Promise<GoogleAppsScriptResponse> {
  return callGoogleAppsScript('update_inventory', carData);
}

export async function submitSalesReport(salesData: any): Promise<GoogleAppsScriptResponse> {
  return callGoogleAppsScript('sales_report', salesData);
}

export async function submitCustomerInquiry(inquiryData: any): Promise<GoogleAppsScriptResponse> {
  return callGoogleAppsScript('customer_inquiry', inquiryData);
}
