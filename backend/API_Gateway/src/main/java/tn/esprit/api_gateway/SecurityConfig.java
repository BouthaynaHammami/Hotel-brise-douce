package tn.esprit.api_gateway;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
            // Activation du CORS via la source de configuration standard
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Désactivation du CSRF (API stateless)
            .csrf(ServerHttpSecurity.CsrfSpec::disable)

            // Autorisation des requêtes
            .authorizeExchange(exchanges -> exchanges
                // Autoriser les pré-vols CORS (OPTIONS)
                .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Routes publiques : Authentification utilisateurs
                .pathMatchers(HttpMethod.POST, "/utilisateurs/api/login").permitAll()
                .pathMatchers(HttpMethod.POST, "/utilisateurs/api/register").permitAll()
                .pathMatchers(HttpMethod.POST, "/utilisateurs/api/users").permitAll()

                // Toutes les autres routes nécessitent un JWT valide
                .anyExchange().authenticated()
            )

            // Configuration du Resource Server JWT (Keycloak)
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(Customizer.withDefaults()) // L'issuer-uri est lu depuis application.properties
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
         CorsConfiguration corsConfig = new CorsConfiguration();
         corsConfig.setAllowedOrigins(Arrays.asList("http://localhost:4200"));
         corsConfig.setMaxAge(3600L);
         corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
         corsConfig.addAllowedHeader("*");
         corsConfig.setExposedHeaders(Arrays.asList("Authorization"));
         corsConfig.setAllowCredentials(true);

         UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
         source.registerCorsConfiguration("/**", corsConfig);
         return source;
    }
}

