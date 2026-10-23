package com.vasanth.healthtracker.web;

import com.vasanth.healthtracker.model.HairPhoto;
import com.vasanth.healthtracker.repository.HairPhotoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/hair-photos")
public class HairPhotoController {

    private static final Set<String> VIEWS = Set.of("HAIRLINE", "TEMPLES", "CROWN");
    private static final Map<String, String> CONTENT_TYPE_TO_EXT = Map.of(
            "image/jpeg", "jpg", "image/png", "png", "image/webp", "webp");

    private final HairPhotoRepository repository;
    private final Path photosDir;

    public HairPhotoController(HairPhotoRepository repository,
                                @Value("${app.photos-dir:./data/photos}") String photosDir) {
        this.repository = repository;
        this.photosDir = Path.of(photosDir);
    }

    @GetMapping
    public List<HairPhoto> list() {
        return repository.findAllByOrderByDateDesc();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public HairPhoto upload(@RequestParam LocalDate date,
                             @RequestParam String view,
                             @RequestParam(required = false) String sheddingNote,
                             @RequestParam(required = false) String sideEffectNote,
                             @RequestParam MultipartFile file) {
        String normalizedView = view.toUpperCase();
        if (!VIEWS.contains(normalizedView)) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Unknown view: " + view);
        }
        String ext = CONTENT_TYPE_TO_EXT.get(file.getContentType());
        if (ext == null) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Unsupported image type: " + file.getContentType());
        }

        try {
            Files.createDirectories(photosDir);
            String filename = UUID.randomUUID() + "." + ext;
            file.transferTo(photosDir.resolve(filename));

            HairPhoto photo = new HairPhoto(null, date, normalizedView, filename, sheddingNote, sideEffectNote);
            return repository.save(photo);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<FileSystemResource> image(@PathVariable Long id) {
        HairPhoto photo = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND));
        Path file = photosDir.resolve(photo.getFilePath());
        String ext = photo.getFilePath().substring(photo.getFilePath().lastIndexOf('.') + 1);
        MediaType type = switch (ext) {
            case "png" -> MediaType.IMAGE_PNG;
            case "webp" -> MediaType.valueOf("image/webp");
            default -> MediaType.IMAGE_JPEG;
        };
        return ResponseEntity.ok().contentType(type).body(new FileSystemResource(file));
    }
}
