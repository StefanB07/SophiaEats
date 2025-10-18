package domain;

public class Payment {
    private PaymentMethod method;
    private double amount;
    private boolean success;

    public Payment(PaymentMethod method, double amount) {
        this.method = method;
        this.amount = amount;
        this.success = false;
    }

    public void process(CampusUser user) {
        if (method == PaymentMethod.STUDENT_CREDIT) {
            success = user.getStudentCredit().getBudget() >= amount;
        } else {
            // External payment simulated
            success = true;
        }
    }

    public PaymentMethod getMethod() { return method; }
    public double getAmount() { return amount; }

    public boolean isSuccess() {
        return success;
    }

    @Override
    public String toString() {
        return "Payment{" +
                "method=" + method +
                ", amount=" + amount +
                ", success=" + success +
                '}';
    }
}
