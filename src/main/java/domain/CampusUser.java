package domain;

import java.util.ArrayList;
import java.util.List;

public class CampusUser {

    private String name;
    private String email;
    private String country;
    private StudentCredit studentCredit;
    private List<Allergy> allergies;

    public CampusUser(String name, String email, String country) {
        this.name = name;
        this.email = email;
        this.country = country;
        this.studentCredit = null; // se poate atașa ulterior
        this.allergies = new ArrayList<>();
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getCountry() {
        return country;
    }

    // === Student Credit ===
    public void assignStudentCredit(StudentCredit credit) {
        this.studentCredit = credit;
    }

    public StudentCredit getStudentCredit() {
        return studentCredit;
    }

    // === Allergies ===
    public void addAllergy(Allergy allergy) {
        allergies.add(allergy);
    }

    public List<Allergy> getAllergies() {
        return allergies;
    }

    public boolean hasAllergy(String label) {
        return allergies.stream()
                .anyMatch(a -> a.getLabel().equalsIgnoreCase(label));
    }

    @Override
    public String toString() {
        return "CampusUser{" +
                "name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", studentCredit=" + studentCredit +
                ", allergies=" + allergies +
                '}';
    }

}
