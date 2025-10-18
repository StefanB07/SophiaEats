package domain;

public class StudentCredit {
    private double budget;

    public StudentCredit() {
        this.budget = 0.0;
    }

    public StudentCredit(double budget) {
        this.budget = budget;
    }

    public double getBudget() {
        return budget;
    }

    public void setBudget(double budget) {
        this.budget = budget;
    }

    @Override
    public String toString() {
        return "StudentCredit{" +
                "budget=" + budget +
                '}';
    }
}
