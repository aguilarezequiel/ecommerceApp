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
    subject: `✅ Confirmación de Pedido #${orderData.id.slice(-8)} - ShopApp`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Confirmación de Pedido</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
            .order-info { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .tracking-code { background: #dbeafe; border: 2px dashed #3b82f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; }
            .tracking-code code { font-size: 24px; font-weight: bold; color: #1d4ed8; letter-spacing: 2px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            th { background-color: #f9fafb; font-weight: 600; }
            .total-row { background-color: #f3f4f6; font-weight: bold; font-size: 18px; }
            .button { display: inline-block; background: #2563eb; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 5px; }
            .button:hover { background: #1d4ed8; }
            .features { display: flex; justify-content: space-around; margin: 30px 0; }
            .feature { text-align: center; flex: 1; padding: 0 10px; }
            .feature-icon { font-size: 30px; margin-bottom: 10px; }
            @media (max-width: 600px) { .features { flex-direction: column; } .feature { margin-bottom: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 ¡Pedido Confirmado!</h1>
            <p>Gracias por tu compra en ShopApp</p>
          </div>
          
          <div class="content">
            <p>Hola,</p>
            <p>¡Excelentes noticias! Tu pedido ha sido confirmado y está siendo procesado. Aquí tienes todos los detalles:</p>
            
            <div class="order-info">
              <h3>📦 Información del Pedido</h3>
              <p><strong>Número de pedido:</strong> #${orderData.id.slice(-8)}</p>
              <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p><strong>Total:</strong> $${orderData.total.toFixed(2)}</p>
            </div>

            <div class="tracking-code">
              <h3>🔍 Código de Seguimiento</h3>
              <p>Guarda este código para hacer seguimiento de tu pedido:</p>
              <code>${orderData.trackingCode}</code>
            </div>
            
            <h3>🛍️ Productos Comprados</h3>
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${orderData.items.map(item => `
                  <tr>
                    <td>${item.productName}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>$${(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="3">TOTAL</td>
                  <td>$${orderData.total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div class="features">
              <div class="feature">
                <div class="feature-icon">📧</div>
                <h4>Te mantendremos informado</h4>
                <p>Recibirás actualizaciones por email sobre el estado de tu pedido</p>
              </div>
              <div class="feature">
                <div class="feature-icon">🚚</div>
                <h4>Envío rápido</h4>
                <p>Tu pedido será enviado en 1-2 días hábiles</p>
              </div>
              <div class="feature">
                <div class="feature-icon">🔒</div>
                <p>Compra segura y protegida</p>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/track?code=${orderData.trackingCode}" class="button">
                🔍 Hacer Seguimiento
              </a>
              <a href="${process.env.FRONTEND_URL}/orders" class="button">
                📋 Ver Mis Pedidos
              </a>
            </div>
          </div>
          
          <div class="footer">
            <h3>📞 ¿Necesitas ayuda?</h3>
            <p>Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos:</p>
            <p>📧 Email: soporte@shopapp.com | 📱 Teléfono: +54 11 1234-5678</p>
            <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">
              Este email fue enviado desde ShopApp. Si no realizaste esta compra, 
              <a href="mailto:soporte@shopapp.com" style="color: #2563eb;">contáctanos inmediatamente</a>.
            </p>
          </div>
        </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log(`Order confirmation email sent successfully to ${customerEmail}`);
};

export const sendOrderStatusUpdate = async (
  customerEmail: string,
  orderData: {
    id: string;
    trackingCode: string;
    status: string;
    customerName: string;
  }
) => {
  const statusMessages = {
    CONFIRMED: { title: '✅ Pedido Confirmado', message: 'Tu pedido ha sido confirmado y será procesado pronto.' },
    PROCESSING: { title: '⚡ Preparando tu Pedido', message: 'Estamos preparando tu pedido para el envío.' },
    SHIPPED: { title: '🚚 Pedido Enviado', message: '¡Tu pedido está en camino! Pronto llegará a tu dirección.' },
    DELIVERED: { title: '📦 Pedido Entregado', message: '¡Tu pedido ha sido entregado! Esperamos que disfrutes tu compra.' },
    CANCELLED: { title: '❌ Pedido Cancelado', message: 'Tu pedido ha sido cancelado. Si tienes preguntas, contáctanos.' }
  };

  const statusInfo = statusMessages[orderData.status as keyof typeof statusMessages];
  
  if (!statusInfo) return;

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: customerEmail,
    subject: `${statusInfo.title} - Pedido #${orderData.id.slice(-8)}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 8px;">
            <h1>${statusInfo.title}</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb;">
            <p>Hola ${orderData.customerName},</p>
            <p>${statusInfo.message}</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Pedido:</strong> #${orderData.id.slice(-8)}</p>
              <p><strong>Código de seguimiento:</strong> ${orderData.trackingCode}</p>
              <p><strong>Estado actual:</strong> ${statusInfo.title}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/track?code=${orderData.trackingCode}" 
                 style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                Ver Estado del Pedido
              </a>
            </div>
          </div>
        </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log(`Status update email sent to ${customerEmail} for order ${orderData.id}`);
};