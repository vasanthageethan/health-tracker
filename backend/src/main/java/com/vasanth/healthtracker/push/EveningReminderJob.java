package com.vasanth.healthtracker.push;

import com.vasanth.healthtracker.model.Treatment;
import com.vasanth.healthtracker.repository.DailyLogRepository;
import com.vasanth.healthtracker.repository.TreatmentLogRepository;
import com.vasanth.healthtracker.repository.TreatmentRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/** Matches the doc's "9 pm daily log" reminder trigger; also folds in any hair-routine
 *  item due today that hasn't been marked done, rather than a separate reminder per item. */
@Component
public class EveningReminderJob {

    private final DailyLogRepository dailyLogs;
    private final TreatmentRepository treatments;
    private final TreatmentLogRepository treatmentLogs;
    private final PushNotificationService pushService;

    public EveningReminderJob(DailyLogRepository dailyLogs, TreatmentRepository treatments,
                               TreatmentLogRepository treatmentLogs, PushNotificationService pushService) {
        this.dailyLogs = dailyLogs;
        this.treatments = treatments;
        this.treatmentLogs = treatmentLogs;
        this.pushService = pushService;
    }

    @Scheduled(cron = "0 0 21 * * *")
    public void sendEveningReminder() {
        evaluateAndSend();
    }

    /** Runs the same decision logic on demand (not waiting for 9pm), for verification.
     *  Returns the body that was sent, or null if there was nothing to remind about. */
    public String evaluateAndSend() {
        LocalDate today = LocalDate.now();
        boolean loggedToday = dailyLogs.findById(today).isPresent();

        List<String> missed = treatments.findAll().stream()
                .filter(t -> isDueOn(t, today))
                .filter(t -> treatmentLogs.findByDateAndTreatmentId(today, t.getId())
                        .map(l -> !Boolean.TRUE.equals(l.getDone()))
                        .orElse(true))
                .map(Treatment::getName)
                .toList();

        if (loggedToday && missed.isEmpty()) {
            return null;
        }

        StringBuilder body = new StringBuilder();
        if (!loggedToday) body.append("Log today's entry. ");
        if (!missed.isEmpty()) body.append("Still due: ").append(String.join(", ", missed));

        String message = body.toString().trim();
        pushService.sendToAll("Health Tracker reminder", message);
        return message;
    }

    private static boolean isDueOn(Treatment t, LocalDate date) {
        if (t.getEndDate() != null && date.isAfter(t.getEndDate())) return false;
        if (t.getStartDate() != null && date.isBefore(t.getStartDate())) return false;
        if ("DAILY".equals(t.getSchedule())) return true;
        String code = switch (date.getDayOfWeek()) {
            case MONDAY -> "MON";
            case TUESDAY -> "TUE";
            case WEDNESDAY -> "WED";
            case THURSDAY -> "THU";
            case FRIDAY -> "FRI";
            case SATURDAY -> "SAT";
            case SUNDAY -> "SUN";
        };
        return List.of(t.getSchedule().split(",")).contains(code);
    }
}
