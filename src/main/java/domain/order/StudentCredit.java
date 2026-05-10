package domain.order;

public class StudentCredit {
    private double budget;
    private boolean blocked;

    public StudentCredit() {
        this.budget = 0.0;
        this.blocked = false;
    }

    public StudentCredit(double budget) {
        this.budget = budget;
        this.blocked = false;
    }

    public double getBudget() {
        return budget;
    }

    public void setBudget(double budget) {
        this.budget = budget;
    }

    public boolean isBlocked() {
        return blocked;
    }

    public void setBlocked(boolean blocked) {
        this.blocked = blocked;
    }

    @Override
    public String toString() {
        return "StudentCredit{" +
                "budget=" + budget +
                ", blocked=" + blocked +
                '}';
    }
}

