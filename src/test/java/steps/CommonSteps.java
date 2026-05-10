package steps;

import io.cucumber.java.en.Given;

/**
 * Common no-op steps shared across scenarios.
 * Each step class does its own @Before seeding; this step only exists to satisfy the Gherkin background.
 */
public class CommonSteps {
    @Given("a fresh backend context")
    public void a_fresh_backend_context() {
        // no-op: each Steps class seeds repositories in its own @Before
    }
}
