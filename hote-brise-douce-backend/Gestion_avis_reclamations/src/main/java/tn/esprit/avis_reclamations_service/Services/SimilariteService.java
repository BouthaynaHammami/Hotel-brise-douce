package tn.esprit.avis_reclamations_service.Services;

import org.springframework.stereotype.Service;
import tn.esprit.avis_reclamations_service.entite.ReclamationFeedback;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class SimilariteService {

    private static final Set<String> STOP_WORDS = Set.of(
            "le", "la", "les", "un", "une", "des", "de", "du", "en",
            "et", "est", "je", "mon", "ma", "mes", "dans", "pour",
            "avec", "sur", "par", "au", "aux", "ce", "se", "qui", "que"
    );

    public double calculerSimilarite(String texte1, String texte2) {
        Set<String> tokens1 = tokeniser(texte1);
        Set<String> tokens2 = tokeniser(texte2);

        if (tokens1.isEmpty() || tokens2.isEmpty()) return 0.0;

        Set<String> intersection = new HashSet<>(tokens1);
        intersection.retainAll(tokens2);

        Set<String> union = new HashSet<>(tokens1);
        union.addAll(tokens2);

        return (double) intersection.size() / union.size();
    }

    private Set<String> tokeniser(String texte) {
        if (texte == null) return Set.of();
        return Arrays.stream(texte.toLowerCase()
                        .replaceAll("[^a-zàâçéèêëîïôùûü ]", " ")
                        .split("\\s+"))
                .filter(t -> t.length() > 2 && !STOP_WORDS.contains(t))
                .collect(Collectors.toSet());
    }

    public String construireTexte(ReclamationFeedback r) {
        return Stream.of(r.getTitre(), r.getDescription(), r.getCategorie())
                .filter(Objects::nonNull)
                .collect(Collectors.joining(" "));
    }
}