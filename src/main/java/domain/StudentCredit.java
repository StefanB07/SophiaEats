package domain;

import java.time.LocalDate;

public class StudentCredit {

    private double monthlyAllowance;
    private double usedAmount;
    private LocalDate dueDate;
    private boolean blocked;

    public StudentCredit(double monthlyAllowance, LocalDate dueDate) {
        this.monthlyAllowance = monthlyAllowance;
        this.usedAmount = 0.0;
        this.dueDate = dueDate;
        this.blocked = false;
    }

    public double getMonthlyAllowance() {
        return monthlyAllowance;
    }
    public void setMonthlyAllowance(double monthlyAllowance) {}


    public double getUsedAmount() {
        return usedAmount;
    }
    public void setUsedAmount(double usedAmount) {}


    public LocalDate getDueDate() {
        return dueDate;
    }
    public void setDueDate(LocalDate dueDate) {}


    public boolean isBlocked() {
        return blocked;
    }
    public void setBlocked(boolean blocked) {}


    /**
     * Folosit când studentul plătește cu creditul studențesc.
     * @param amount suma de folosit
     * @return true dacă s-a putut folosi creditul, false dacă nu este disponibil
     */
    public boolean useCredit(double amount) {
        if (blocked || usedAmount + amount > monthlyAllowance) {
            return false;
        }
        usedAmount += amount;
        return true;
    }


     //Reîmprospătează creditul la începutul unei noi luni.
     public void resetMonthlyAllowance(double newAllowance, LocalDate newDueDate) {
        this.monthlyAllowance = newAllowance;
        this.usedAmount = 0.0;
        this.dueDate = newDueDate;
        this.blocked = false;
     }

    //Marchează creditul ca blocat dacă nu s-a plătit la timp.
    public void block() {
        this.blocked = true;
    }

    //Deblochează creditul după rambursare.
    public void unblock() {
        this.blocked = false;
    }

    @Override
    public String toString() {
        return "StudentCredit{" +
                "monthlyAllowance=" + monthlyAllowance +
                ", usedAmount=" + usedAmount +
                ", dueDate=" + dueDate +
                ", blocked=" + blocked +
                '}';
    }
}
