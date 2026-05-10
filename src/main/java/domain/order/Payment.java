package domain.order;

public class Payment {
    private PaymentMethod method;
    private double amount;
    private boolean success;

    // NEW: optional provider/redirect info for external payments
    private String provider;
    private String redirectUrl;

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

    // NEW accessors for provider/redirect
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getRedirectUrl() { return redirectUrl; }
    public void setRedirectUrl(String redirectUrl) { this.redirectUrl = redirectUrl; }

    public void setSuccess(boolean success) { this.success = success; }

    @Override
    public String toString() {
        return "Payment{" +
                "method=" + method +
                ", amount=" + amount +
                ", success=" + success +
                ", provider='" + provider + '\'' +
                ", redirectUrl='" + redirectUrl + '\'' +
                '}';
    }
}

