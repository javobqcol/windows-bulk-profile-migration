// Función para copiar texto al portapapeles con notificación
export const copyToClipboard = (text, type = 'IP') => {
  if (!navigator.clipboard) {
    // Fallback para navegadores antiguos
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showNotification(`Copiado: ${text}`);
    return;
  }

  navigator.clipboard.writeText(text)
    .then(() => showNotification(`${type} copiado: ${text}`))
    .catch(err => console.error('Error al copiar:', err));
};

// Mostrar notificación temporal
const showNotification = (message) => {
  // Eliminar notificaciones previas
  const existingNotifications = document.querySelectorAll('.copy-notification');
  existingNotifications.forEach(n => n.remove());

  const notification = document.createElement('div');
  notification.className = 'copy-notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #27ae60;
    color: white;
    padding: 10px 15px;
    border-radius: 6px;
    font-size: 0.85rem;
    z-index: 1000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    animation: slideIn 0.3s ease-out;
  `;

  // Agregar animación CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(notification);
  
  // Remover después de 2 segundos
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }
    style.remove();
  }, 2000);
};

export default copyToClipboard;
