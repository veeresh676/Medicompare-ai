package com.medicompare.compare.dto;

import java.util.List;

public class CompareVerdictRequest {

    private List<Long> hospitalIds;

    public CompareVerdictRequest() {
    }

    public List<Long> getHospitalIds() {
        return hospitalIds;
    }

    public void setHospitalIds(
            List<Long> hospitalIds
    ) {
        this.hospitalIds = hospitalIds;
    }
}
