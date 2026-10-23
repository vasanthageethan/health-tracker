package com.vasanth.healthtracker.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;

/** Denver-only for now -- see the doc's Portability note for moving this later. */
@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    private static final double LATITUDE = 39.7392;
    private static final double LONGITUDE = -104.9903;
    private static final String CITY = "Denver";

    private record WeatherSummary(String city, double highF, double lowF, String warmestHour,
                                   double warmestTempF, String clothingGuide) {}

    private final RestClient restClient;

    public WeatherController(RestClient.Builder builder) {
        this.restClient = builder.baseUrl("https://api.open-meteo.com").build();
    }

    @GetMapping("/today")
    public WeatherSummary today() {
        Map<String, Object> response = restClient.get()
                .uri(uriBuilder -> uriBuilder.path("/v1/forecast")
                        .queryParam("latitude", LATITUDE)
                        .queryParam("longitude", LONGITUDE)
                        .queryParam("hourly", "temperature_2m")
                        .queryParam("temperature_unit", "fahrenheit")
                        .queryParam("timezone", "America/Denver")
                        .queryParam("forecast_days", 1)
                        .build())
                .retrieve()
                .body(Map.class);

        @SuppressWarnings("unchecked")
        Map<String, Object> hourly = (Map<String, Object>) response.get("hourly");
        @SuppressWarnings("unchecked")
        List<String> times = (List<String>) hourly.get("time");
        @SuppressWarnings("unchecked")
        List<Number> temps = (List<Number>) hourly.get("temperature_2m");

        int warmestIndex = 0;
        double high = Double.NEGATIVE_INFINITY;
        double low = Double.POSITIVE_INFINITY;
        for (int i = 0; i < temps.size(); i++) {
            double t = temps.get(i).doubleValue();
            if (t > high) { high = t; warmestIndex = i; }
            if (t < low) low = t;
        }

        String warmestHour = LocalTime.parse(times.get(warmestIndex).substring(11)).toString();
        return new WeatherSummary(CITY, high, low, warmestHour, high, clothingGuideFor(high));
    }

    private static String clothingGuideFor(double tempF) {
        if (tempF > 40) return "Shorts and a t-shirt are fine.";
        if (tempF >= 25) return "Tights and a long-sleeve layer.";
        return "Full thermal layers, gloves, and cover your face.";
    }
}
