/// <reference types="cypress" />
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

    it("doit créer un compte et conecter l'utlisateur automatiquement", () => {
      cy.contains("Inscription").click();

      cy.get("input[name='email']").type(`user_${Date.now()}@test.com`);
      cy.get("input[name='firstname']").type("Jean");
      cy.get("input[name='lastname']").type("Dupont");
      cy.get("input[name='password']").type("monmotdepasse");

      cy.get("button[type='submit']").click();

      cy.contains("Jean Dupont").should("be.visible");
    });

    it("doit afficher une érreur si l'email est déja utlisé", () => {
      cy.request({
        method: "DELETE",
        url: `${Cypress.env("apiUrl")}/api/deleteUser`,
        failOnStatusCode: false,
        body: { email: "doublon@test.com" },
      }).then(() => {
        cy.request("POST", `${Cypress.env("apiUrl")}/api/createUser`, {
          email: "doublon@test.com",
          firstname: "Paul",
          lastname: "Martin",
          password: "pass123",
        });
      });

      cy.contains("Inscription").click();

      cy.get("input[name='email']").type("doublon@test.com");
      cy.get("input[name='firstname']").type("Paul");
      cy.get("input[name='lastname']").type("Martin");
      cy.get("input[name='password']").type("pass123");

      cy.get("button[type='submit']").click();

      cy.contains("Impossible de créer le compte").should("be.visible");
    });

    it("doit pas soumettre le formulaire si des champs sont manquant", () => {
      cy.contains("Inscription").click();

      cy.get("input[name='email']").type("incomplet@test.com");
      cy.get("button[type='submit']").click();

      cy.contains("Jean").should("not.exist");
    });
  });

  describe("Connexion", () => {
    beforeEach(() => {
      cy.request({
        method: "DELETE",
        url: `${Cypress.env("apiUrl")}/api/deleteUser`,
        failOnStatusCode: false,
        body: { email: "existant@test.com" },
      }).then(() => {
        cy.request("POST", `${Cypress.env("apiUrl")}/api/createUser`, {
          email: "existant@test.com",
          firstname: "Alice",
          lastname: "Martin",
          password: "bonpassword",
        });
      });
    });

    it("doit afficher le formulaire de connexion par défaut", () => {
      cy.get("input[name='email']").should("be.visible");
      cy.get("input[name='password']").should("be.visible");
      cy.contains("Se connecter").should("be.visible");
    });

    it("doit connecter l'utlisateur avec des idenfiant valides", () => {
      cy.get("input[name='email']").type("existant@test.com");
      cy.get("input[name='password']").type("bonpassword");
      cy.get("button[type='submit']").click();

      cy.contains("Alice Martin").should("be.visible");
    });

    it("doit afficher une érreur si le mot de passe est incorect", () => {
      cy.get("input[name='email']").type("existant@test.com");
      cy.get("input[name='password']").type("mauvaispassword");
      cy.get("button[type='submit']").click();

      cy.contains("Alice Martin").should("not.exist");
    });

    it("doit afficher une érreur si l'email n'existe pas en base", () => {
      cy.get("input[name='email']").type("inconnu@test.com");
      cy.get("input[name='password']").type("nimportequoi");
      cy.get("button[type='submit']").click();

      cy.contains("Alice Martin").should("not.exist");
    });
  });

  describe("Déconnexion", () => {
    beforeEach(() => {
      cy.request({
        method: "DELETE",
        url: `${Cypress.env("apiUrl")}/api/deleteUser`,
        failOnStatusCode: false,
        body: { email: "logout@test.com" },
      }).then(() => {
        cy.request("POST", `${Cypress.env("apiUrl")}/api/createUser`, {
          email: "logout@test.com",
          firstname: "Bob",
          lastname: "Logout",
          password: "passtest",
        }).then(() => {
          cy.get("input[name='email']").type("logout@test.com");
          cy.get("input[name='password']").type("passtest");
          cy.get("button[type='submit']").click();
          cy.contains("Bob Logout").should("be.visible");
        });
      });
    });

    it("doit deconnecter l'utlisateur et revenir sur la page de conexion", () => {
      cy.contains("Déconnexion").click();

      cy.get("input[name='email']").should("be.visible");
      cy.contains("Bob Logout").should("not.exist");
    });
  });
});
