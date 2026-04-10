describe("Flux Inscription / Connexion", () => {
  beforeEach(() => {
    cy.visit("/");
  });
  describe("Inscription", () => {
    it("doit afficher le formulaire d'inscritpion quand on clique sur l'onglet", () => {
      cy.contains("Inscription").click();
      cy.get("input[name='email']").should("be.visible");
      cy.get("input[name='firstname']").should("be.visible");
      cy.get("input[name='lastname']").should("be.visible");
      cy.get("input[name='password']").should("be.visible");
    });
  });
});
