exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const stripeEvent = JSON.parse(event.body);

    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object;
      const customerEmail = session.customer_details.email;
      const customerName = session.customer_details.name ? session.customer_details.name.split(' ')[0] : "there";

      await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: customerEmail }] }],
          from: { email: "hello@stravy.co.uk" },
          subject: "Welcome to STRAVY! (Access your deals inside)",
          content: [{ 
            type: "text/html", 
            value: `
              <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px; line-height: 1.6;">
                <h2 style="color: #290849;">Hi ${customerName}!</h2>
                <p>Welcome to <strong>STRAVY</strong>!</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                  <p style="margin-bottom: 10px; font-weight: bold;">ACCESS YOUR 235 DEALS:</p>
                  <a href="https://stravy.co.uk/members.html" style="background-color: #290849; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Click Here to Access Members Area</a>
                </div>

                <p>Everything you need is there—from £3 Pret meals to lifetime SaaS deals to 50% off workspaces.</p>
                
                <ul style="list-style: none; padding: 0;">
                  <li>✅ Your £2.97 founder price is locked in forever</li>
                  <li>📅 Next update: February 1st</li>
                </ul>

                <p style="margin-top: 30px;">Questions? Just reply to this email or contact us at <strong>support@stravy.co.uk</strong>!</p>
                <p>Best regards,<br><strong>The Stravy Team</strong></p>
              </div>
            ` 
          }],
        }),
      });
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }
};
