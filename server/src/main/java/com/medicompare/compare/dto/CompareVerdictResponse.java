package com.medicompare.compare.dto;

import java.util.List;

public class CompareVerdictResponse {

    private Long winnerHospitalId;
    private String winnerHospitalName;
    private List<HospitalScore> scores;
    private List<String> winnerReasons;
    private String explanation;
    private boolean aiAvailable;

    public CompareVerdictResponse() {
    }

    public Long getWinnerHospitalId() {
        return winnerHospitalId;
    }

    public void setWinnerHospitalId(
            Long winnerHospitalId
    ) {
        this.winnerHospitalId = winnerHospitalId;
    }

    public String getWinnerHospitalName() {
        return winnerHospitalName;
    }

    public void setWinnerHospitalName(
            String winnerHospitalName
    ) {
        this.winnerHospitalName = winnerHospitalName;
    }

    public List<HospitalScore> getScores() {
        return scores;
    }

    public void setScores(
            List<HospitalScore> scores
    ) {
        this.scores = scores;
    }

    public List<String> getWinnerReasons() {
        return winnerReasons;
    }

    public void setWinnerReasons(
            List<String> winnerReasons
    ) {
        this.winnerReasons = winnerReasons;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(
            String explanation
    ) {
        this.explanation = explanation;
    }

    public boolean isAiAvailable() {
        return aiAvailable;
    }

    public void setAiAvailable(
            boolean aiAvailable
    ) {
        this.aiAvailable = aiAvailable;
    }

    public static class HospitalScore {

        private Long hospitalId;
        private String hospitalName;
        private Double score;
        private String level;

        public HospitalScore() {
        }

        public HospitalScore(
                Long hospitalId,
                String hospitalName,
                Double score,
                String level
        ) {
            this.hospitalId = hospitalId;
            this.hospitalName = hospitalName;
            this.score = score;
            this.level = level;
        }

        public Long getHospitalId() {
            return hospitalId;
        }

        public void setHospitalId(
                Long hospitalId
        ) {
            this.hospitalId = hospitalId;
        }

        public String getHospitalName() {
            return hospitalName;
        }

        public void setHospitalName(
                String hospitalName
        ) {
            this.hospitalName = hospitalName;
        }

        public Double getScore() {
            return score;
        }

        public void setScore(
                Double score
        ) {
            this.score = score;
        }

        public String getLevel() {
            return level;
        }

        public void setLevel(
                String level
        ) {
            this.level = level;
        }
    }
}
