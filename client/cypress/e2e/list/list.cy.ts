/// <reference types="cypress" />
describe("Flux Listes et Cartes", () => {
  beforeEach(() => {
    const email = `listcard_${Date.now()}@test.com`;

    cy.request("POST", `${Cypress.env("apiUrl")}/api/createUser`, {
      email,
      firstname: "Alice",
      lastname: "Martin",
      password: "bonpassword",
    });

    cy.visit("/");
    cy.get("input[name='email']").type(email);
    cy.get("input[name='password']").type("bonpassword");
    cy.get("button[type='submit']").click();
    cy.contains("Alice Martin").should("be.visible");

    cy.contains("Nouveau board").click();
    cy.get("input[placeholder]").type("Board de test");
    cy.contains("Créer").click();
    cy.contains("Board de test").click();
  });

  describe("Créer une liste", () => {
    it("doit afficher le bouton pour ajouté une liste", () => {
      cy.contains("Ajouter une liste").should("be.visible");
    });

    it("doit créer une liste et l'afficher dans le board", () => {
      cy.contains("Ajouter une liste").click();
      cy.get("input[placeholder]").type("Todo");
      cy.contains("Ajouter").click();

      cy.contains("Todo").should("be.visible");
    });

    it("doit pouvoir créer plusieur listes dans le meme board", () => {
      cy.contains("Ajouter une liste").click();
      cy.get("input[placeholder]").type("Todo");
      cy.contains("Ajouter").click();

      cy.contains("Ajouter une liste").click();
      cy.get("input[placeholder]").type("En cours");
      cy.contains("Ajouter").click();

      cy.contains("Ajouter une liste").click();
      cy.get("input[placeholder]").type("Terminé");
      cy.contains("Ajouter").click();

      cy.contains("Todo").should("be.visible");
      cy.contains("En cours").should("be.visible");
      cy.contains("Terminé").should("be.visible");
    });
  });

  describe("Créer une carte", () => {
    beforeEach(() => {
      cy.contains("Ajouter une liste").click();
      cy.get("input[placeholder]").type("Todo");
      cy.contains("Ajouter").click();
      cy.contains("Todo").should("be.visible");
    });

    it("doit créer une carte dans une liste et l'afficher", () => {
      cy.contains("Ajouter une carte").click();
      cy.get("input[placeholder]").type("Ma premiere carte");
      cy.contains("Ajouter").click();

      cy.contains("Ma premiere carte").should("be.visible");
    });

    it("doit pouvoir créer plusieur carte dans la meme liste", () => {
      cy.contains("Ajouter une carte").click();
      cy.get("input[placeholder]").type("Carte 1");
      cy.contains("Ajouter").click();

      cy.contains("Ajouter une carte").click();
      cy.get("input[placeholder]").type("Carte 2");
      cy.contains("Ajouter").click();

      cy.contains("Carte 1").should("be.visible");
      cy.contains("Carte 2").should("be.visible");
    });

    it("doit afficher la carte dans la bonne liste", () => {
      cy.contains("Ajouter une liste").click();
      cy.get("input[placeholder]").type("En cours");
      cy.contains("Ajouter").click();

      cy.contains("Todo").parent().contains("Ajouter une carte").click();
      cy.get("input[placeholder]").type("Carte dans todo");
      cy.contains("Ajouter").click();

      cy.contains("Todo").parent().contains("Carte dans todo").should("exist");
      cy.contains("En cours")
        .parent()
        .contains("Carte dans todo")
        .should("not.exist");
    });
  });
});
