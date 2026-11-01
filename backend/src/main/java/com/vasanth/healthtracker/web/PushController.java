package com.vasanth.healthtracker.web;

import com.vasanth.healthtracker.model.PushSubscription;
import com.vasanth.healthtracker.push.EveningReminderJob;
import com.vasanth.healthtracker.push.PushNotificationService;
import com.vasanth.healthtracker.repository.PushSubscriptionRepository;
import com.vasanth.healthtracker.repository.VapidKeysRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/push")
public class PushController {

    private record SubscriptionKeys(String p256dh, String auth) {}
    private record SubscriptionRequest(String endpoint, SubscriptionKeys keys) {}

    private final PushSubscriptionRepository subscriptions;
    private final VapidKeysRepository vapidKeys;
    private final PushNotificationService pushService;
    private final EveningReminderJob eveningReminderJob;

    public PushController(PushSubscriptionRepository subscriptions, VapidKeysRepository vapidKeys,
                           PushNotificationService pushService, EveningReminderJob eveningReminderJob) {
        this.subscriptions = subscriptions;
        this.vapidKeys = vapidKeys;
        this.pushService = pushService;
        this.eveningReminderJob = eveningReminderJob;
    }

    @GetMapping("/vapid-public-key")
    public Map<String, String> vapidPublicKey() {
        return Map.of("publicKey", vapidKeys.findById(1L).orElseThrow().getPublicKey());
    }

    @PostMapping("/subscribe")
    public void subscribe(@RequestBody SubscriptionRequest request) {
        PushSubscription sub = subscriptions.findByEndpoint(request.endpoint()).orElseGet(PushSubscription::new);
        sub.setEndpoint(request.endpoint());
        sub.setP256dh(request.keys().p256dh());
        sub.setAuth(request.keys().auth());
        if (sub.getCreatedAt() == null) sub.setCreatedAt(Instant.now());
        subscriptions.save(sub);
    }

    @Transactional
    @DeleteMapping("/subscribe")
    public void unsubscribe(@RequestBody Map<String, String> body) {
        subscriptions.deleteByEndpoint(body.get("endpoint"));
    }

    /** Manual trigger for verifying the pipeline end to end. */
    @PostMapping("/test")
    public Map<String, Integer> test() {
        int sent = pushService.sendToAll("Health Tracker", "Test notification — push is working.");
        return Map.of("sent", sent);
    }

    /** Runs the evening-reminder decision logic right now, instead of waiting for 9pm. */
    @PostMapping("/test-reminder")
    public Map<String, Object> testReminder() {
        String message = eveningReminderJob.evaluateAndSend();
        return Map.of("sent", message != null, "message", message == null ? "" : message);
    }
}
