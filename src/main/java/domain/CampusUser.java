package domain;

public class CampusUser {
    private String name;
    private String email;
    private String countryOfBirth;

    public CampusUser(String name, String email, String countryOfBirth) {
        this.name = name;
        this.email = email;
        this.countryOfBirth = countryOfBirth;
    }

    // Getters
    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public String toString() {
        return "CampusUser{" +
                "name='" + name + '\'' +
                ", email='" + email + '\'' +
                '}';
    }
}
