import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendOrderConfirmation = async (
  customerEmail: string,
  orderData: {
    id: string;
    total: number;
    trackingCode: string;
    items: Array<{
      productName: string;
      quantity: number;
      price: number;
    }>;
  }
) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: customerEmail,
    subject: `Confirmación de Pedido #${orderData.id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>¡Gracias por tu pedido!</h2>
        <p><strong>Número de pedido:</strong> ${orderData.id}</p>
        <p><strong>Código de seguimiento:</strong> ${orderData.trackingCode}</p>
        
        <h3>Detalles del pedido:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 10px; border: 1px solid #ddd;">Producto</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Cantidad</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${orderData.items.map(item => `
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${item.productName}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${item.quantity}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">$${item.price.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="margin-top: 20px; font-size: 18px;">
          <strong>Total: $${orderData.total.toFixed(2)}</strong>
        </div>
        
        <p style="margin-top: 30px;">
          Puedes hacer seguimiento de tu pedido usando el código: <strong>${orderData.trackingCode}</strong>
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};