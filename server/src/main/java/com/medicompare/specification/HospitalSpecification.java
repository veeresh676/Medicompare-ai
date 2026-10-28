package com.medicompare.specification;

import com.medicompare.entity.Hospital;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class HospitalSpecification {

    private HospitalSpecification() {
    }

    public static Specification<Hospital> filter(
            String search,
            String city,
            String state,
            String hospitalType,
            Double minRating,
            Double maxFee
    ) {

        return (root, query, criteriaBuilder) -> {

            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {

                String keyword = "%" + search.toLowerCase() + "%";

                Predicate nameMatch = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("name")),
                        keyword
                );

                Predicate descriptionMatch = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("description")),
                        keyword
                );

                Predicate cityMatch = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("city")),
                        keyword
                );

                Predicate stateMatch = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("state")),
                        keyword
                );

                predicates.add(
                        criteriaBuilder.or(
                                nameMatch,
                                descriptionMatch,
                                cityMatch,
                                stateMatch
                        )
                );
            }

            if (city != null && !city.isBlank()) {

                predicates.add(
                        criteriaBuilder.equal(
                                criteriaBuilder.lower(root.get("city")),
                                city.toLowerCase()
                        )
                );
            }

            if (state != null && !state.isBlank()) {

                predicates.add(
                        criteriaBuilder.equal(
                                criteriaBuilder.lower(root.get("state")),
                                state.toLowerCase()
                        )
                );
            }

            if (hospitalType != null && !hospitalType.isBlank()) {

                predicates.add(
                        criteriaBuilder.equal(
                                criteriaBuilder.lower(root.get("hospitalType")),
                                hospitalType.toLowerCase()
                        )
                );
            }

            if (minRating != null) {

                predicates.add(
                        criteriaBuilder.greaterThanOrEqualTo(
                                root.get("rating"),
                                minRating
                        )
                );
            }

            if (maxFee != null) {

                predicates.add(
                        criteriaBuilder.lessThanOrEqualTo(
                                root.get("consultationFee"),
                                maxFee
                        )
                );
            }

            return criteriaBuilder.and(
                    predicates.toArray(new Predicate[0])
            );
        };
    }
}