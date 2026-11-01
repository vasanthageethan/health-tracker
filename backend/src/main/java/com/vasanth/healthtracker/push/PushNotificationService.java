package com.vasanth.healthtracker.push;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vasanth.healthtracker.model.PushSubscription;
import com.vasanth.healthtracker.model.VapidKeys;
import com.vasanth.healthtracker.repository.PushSubscriptionRepository;
import com.vasanth.healthtracker.repository.VapidKeysRepository;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import org.apache.http.HttpResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.GeneralSecurityException;
import java.util.List;
import java.util.Map;

@Service
public class PushNotificationService {

    private static final Logger log = LoggerFactory.getLogger(PushNotificationService.class);

    private final PushSubscriptionRepository subscriptions;
    private final VapidKeysRepository vapidKeysRepository;
    private final String subject;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Built lazily on first real send, since the VAPID keys row is created by a
    // CommandLineRunner that runs after this bean is constructed.
    private PushService pushService;

    public PushNotificationService(PushSubscriptionRepository subscriptions, VapidKeysRepository vapidKeysRepository,
                                    @Value("${app.vapid-subject}") String subject) {
        this.subscriptions = subscriptions;
        this.vapidKeysRepository = vapidKeysRepository;
        this.subject = subject;
    }

    private synchronized PushService pushService() throws GeneralSecurityException {
        if (pushService == null) {
            VapidKeys keys = vapidKeysRepository.findById(1L)
                    .orElseThrow(() -> new IllegalStateException("VAPID keys have not been generated yet"));
            pushService = new PushService(keys.getPublicKey(), keys.getPrivateKey(), subject);
        }
        return pushService;
    }

    /** Returns how many subscriptions were successfully sent to. */
    @Transactional
    public int sendToAll(String title, String body) {
        List<PushSubscription> all = subscriptions.findAll();
        if (all.isEmpty()) return 0;

        String payload;
        try {
            payload = objectMapper.writeValueAsString(Map.of("title", title, "body", body));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }

        int sent = 0;
        for (PushSubscription sub : all) {
            try {
                Subscription.Keys keys = new Subscription.Keys(sub.getP256dh(), sub.getAuth());
                Subscription subscription = new Subscription(sub.getEndpoint(), keys);
                Notification notification = new Notification(subscription, payload);
                HttpResponse response = pushService().send(notification);
                int status = response.getStatusLine().getStatusCode();
                if (status == 404 || status == 410) {
                    subscriptions.deleteByEndpoint(sub.getEndpoint());
                } else if (status >= 200 && status < 300) {
                    sent++;
                } else {
                    log.warn("Push to subscription {} returned status {}", sub.getId(), status);
                }
            } catch (Exception e) {
                log.warn("Push failed for subscription {}: {}", sub.getId(), e.getMessage());
            }
        }
        return sent;
    }
}
