/// <reference types="cypress" />
describe("Flux Board", () => {
  beforeEach(() => {
    cy.request("POST", `${Cypress.env("apiUrl")}/api/createUser`, {
      email: `board_${Date.now()}@test.com`,
      firstname: "Jean",
      lastname: "Dupont",
      password: "bonpassword",
    }).then((res) => {
      const email = res.requestBody
        ? JSON.parse(res.requestBody).email
        : `board_${Date.now()}@test.com`;

      cy.visit("/");
      cy.get("input[name='email']").type(email);
      cy.get("input[name='password']").type("bonpassword");
      cy.get("button[type='submit']").click();
      cy.contains("Jean Dupont").should("be.visible");
    });
  });

  describe("Créer un board", () => {
    it("doit afficher le bouton pour créer un nouveau bord", () => {
      cy.contains("Nouveau board").should("be.visible");
    });

    it("doit créer un board et l'afficher dans la liste", () => {
      cy.contains("Nouveau board").click();
      cy.get("input[placeholder]").type("Mon premier board");
      cy.contains("Créer").click();

      cy.contains("Mon premier board").should("be.visible");
    });

    it("doit pouvoir créer plusieur boards et les afficher tout", () => {
      cy.contains("Nouveau board").click();
      cy.get("input[placeholder]").type("Board A");
      cy.contains("Créer").click();
      cy.contains("Board A").should("be.visible");

      cy.contains("Nouveau board").click();
      cy.get("input[placeholder]").type("Board B");
      cy.contains("Créer").click();
      cy.contains("Board B").should("be.visible");
    });

    it("doit ouvrir le board quand on clique dessus", () => {
      cy.contains("Nouveau board").click();
      cy.get("input[placeholder]").type("Board cliclable");
      cy.contains("Créer").click();

      cy.contains("Board cliclable").click();
      cy.contains("Ajouter une liste").should("be.visible");
    });
  });
});
