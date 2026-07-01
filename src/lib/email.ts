export async function sendWelcomeEmail(data: {
  to: string;
  name: string;
  role: string;
  passwordText: string;
  loginUrl: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  const emailSubject = "Simply Updify Portal Access Credentials";
  const textContent = `
    Hello ${data.name},
    
    Welcome to Simply Updify! Your profile has been successfully configured.
    
    Here are your portal access details:
    ---------------------------------------------------
    Login URL: ${data.loginUrl}
    Username:  ${data.to}
    Password:  ${data.passwordText}
    Assigned Role: ${data.role}
    ---------------------------------------------------
    
    Please sign in and configure your personal profile dossier, including uploading your resume, college ID, and offer letter.
    
    This is an automated security transmission.
  `;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #0078d4; margin-bottom: 5px;">Welcome to Simply Updify</h2>
      <p style="color: #666; font-size: 13px; margin-top: 0;">Authorized Workspace Gateway</p>
      <p>Hello <strong>${data.name}</strong>,</p>
      <p>Your portal account has been configured by the system administrator. You can now log in using the details below:</p>
      <div style="background-color: #f3f2f1; padding: 15px; border-radius: 4px; font-family: monospace; margin: 20px 0; border-left: 4px solid #0078d4;">
        <p style="margin: 5px 0;"><strong>Portal URL:</strong> <a href="${data.loginUrl}" style="color: #0078d4; text-decoration: none;">${data.loginUrl}</a></p>
        <p style="margin: 5px 0;"><strong>Username:</strong> ${data.to}</p>
        <p style="margin: 5px 0;"><strong>Password:</strong> ${data.passwordText}</p>
        <p style="margin: 5px 0;"><strong>Assigned Role:</strong> ${data.role}</p>
      </div>
      <p style="color: #555; font-size: 13px;">
        Upon logging in, please upload your verification credentials (Resume, College ID, and Offer Letter) inside your profile dossier.
      </p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #999; font-size: 11px; text-align: center;">
        This is an automated security transmission. Do not reply to this message.
      </p>
    </div>
  `;

  if (!apiKey) {
    console.log("========================================================================");
    console.log("📨 SIMULATED WELCOME EMAIL (RESEND_API_KEY missing in environment)");
    console.log(`To:      ${data.to}`);
    console.log(`From:    ${fromEmail}`);
    console.log(`Subject: ${emailSubject}`);
    console.log(textContent);
    console.log("========================================================================");
    return { success: true, logged: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `Simply Updify <${fromEmail}>`,
        to: [data.to],
        subject: emailSubject,
        html: htmlContent,
        text: textContent,
      }),
    });

    const resData = await res.json();
    if (res.ok) {
      return { success: true, logged: false, messageId: resData.id };
    } else {
      console.error("Resend API rejection:", resData);
      return { success: false, error: resData.message || "Email API error" };
    }
  } catch (error: any) {
    console.error("Resend dispatch failed:", error);
    return { success: false, error: error.message || "Failed to dispatch email" };
  }
}
