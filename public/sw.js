self.addEventListener('push', event => {
  const data = event.data.json();
  const tag = data.type || 'default'; // Group notifications by type
  
  // Get existing notifications
  self.registration.getNotifications({ tag }).then(existingNotifications => {
    let title = data.title;
    let body = data.body;
    
    // If there are existing notifications of the same type
    if (existingNotifications.length > 0) {
      // Close existing notifications
      existingNotifications.forEach(notification => notification.close());
      
      // Update the message to show count
      const count = existingNotifications.length + 1;
      title = `${title} (${count})`;
      body = `You have ${count} new notifications`;
    }
    
    const options = {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag, // Use the tag for grouping
      renotify: true, // Notify the user even if there's an existing notification
      data: {
        url: data.url
      }
    };

    self.registration.showNotification(title, options);
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});