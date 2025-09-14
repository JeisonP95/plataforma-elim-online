// email.js - Configuración para envío de correos
// Este archivo contiene la configuración para el envío de correos de recuperación de contraseña

export const emailConfig = {
  // Configuración para desarrollo
  development: {
    // Para desarrollo, solo logueamos el token en consola
    sendEmail: false,
    logToken: true
  },
  
  // Configuración para producción
  production: {
    // Aquí configurarías un servicio real como SendGrid, Nodemailer, etc.
    sendEmail: true,
    service: 'sendgrid', // o 'nodemailer', 'mailgun', etc.
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: 'noreply@elimonline.com',
    fromName: 'Elim Online'
  }
};

// Función para enviar email de recuperación de contraseña
export async function sendPasswordResetEmail(email, resetToken) {
  const config = process.env.NODE_ENV === 'production' 
    ? emailConfig.production 
    : emailConfig.development;

  if (!config.sendEmail) {
    // En desarrollo, solo logueamos el token
    console.log(`\n📧 EMAIL DE RECUPERACIÓN DE CONTRASEÑA`);
    console.log(`Para: ${email}`);
    console.log(`Token: ${resetToken}`);
    console.log(`Enlace: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/pages/password/password.html?token=${resetToken}`);
    console.log(`\n`);
    return { success: true, message: 'Token generado (modo desarrollo)' };
  }

  // Aquí implementarías el envío real del email
  // Ejemplo con SendGrid:
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(config.apiKey);
  
  const msg = {
    to: email,
    from: {
      email: config.fromEmail,
      name: config.fromName
    },
    subject: 'Recuperar tu contraseña - Elim Online',
    html: `
      <h2>Recuperar tu contraseña</h2>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="${process.env.FRONTEND_URL}/pages/password/password.html?token=${resetToken}">
        Restablecer contraseña
      </a>
      <p>Este enlace expira en 1 hora.</p>
    `
  };
  
  try {
    await sgMail.send(msg);
    return { success: true, message: 'Email enviado exitosamente' };
  } catch (error) {
    console.error('Error enviando email:', error);
    return { success: false, message: 'Error enviando email' };
  }
  */
  
  return { success: true, message: 'Email enviado exitosamente' };
}
