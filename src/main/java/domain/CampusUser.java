package domain;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class CampusUser {
    private final String id;
    private String name;
    private String email;
    private String country;
    private StudentCredit studentCredit;
    private List<Allergy> allergies;

    public CampusUser(String name, String email, String country) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.email = email;
        this.country = country;
        this.studentCredit = null; // se poate atașa ulterior
        this.allergies = new ArrayList<>();
    }

    public String getId() {
        return id;
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
