import Decimal from "decimal.js-light";
import { INITIAL_FARM } from "../../lib/constants";
import { GameState } from "../../types/game";
import { constructBuilding } from "./constructBuilding";

const GAME_STATE: GameState = INITIAL_FARM;

const date = Date.now();

describe("Construct building", () => {
  it("ensures a player has a Bumpkin", () => {
    expect(() =>
      constructBuilding({
        state: { ...GAME_STATE },
        action: {
          type: "building.constructed",
          name: "Workbench",
          coordinates: {
            x: 2,
            y: 2,
          },
        },
      })
    ).toThrow("You do not have a Bumpkin");
  });
  it("ensures Bumpkin level requirements for Workbench are met", () => {
    expect(() =>
      constructBuilding({
        state: {
          ...GAME_STATE,
          bumpkin: {
            id: 1,
            level: 1,
            equipped: {
              body: "Light Brown Farmer Potion",
              hair: "Basic Hair",
              eyes: "Rosy Wide Eyes",
              mouth: "Wide Smile",
              shirt: "Red Farmer Shirt",
              pants: "Farmer Pants",
              shoes: "Black Farmer Boots",
            },
          },
        },
        action: {
          type: "building.constructed",
          name: "Workbench",
          coordinates: {
            x: 0,
            y: 0,
          },
        },
      })
    ).toThrow("Your Bumpkin does not meet the level requirements");
  });

  it("ensures Bumpkin level requirements for Fire Pit are met", () => {
    expect(() =>
      constructBuilding({
        state: GAME_STATE,
        action: {
          type: "building.constructed",
          name: "Fire Pit",
          coordinates: {
            x: 0,
            y: 0,
          },
        },
      })
    ).not.toThrow("Your Bumpkin does not meet the level requirements");
  });

  it("does not craft Fire Pit if there is insufficient ingredients", () => {
    expect(() =>
      constructBuilding({
        state: {
          ...GAME_STATE,
          bumpkin: {
            id: 1,
            level: 2,
            equipped: {
              body: "Light Brown Farmer Potion",
              hair: "Basic Hair",
              eyes: "Rosy Wide Eyes",
              mouth: "Wide Smile",
              shirt: "Red Farmer Shirt",
              pants: "Farmer Pants",
              shoes: "Black Farmer Boots",
            },
          },
        },
        action: {
          type: "building.constructed",
          name: "Fire Pit",
          coordinates: {
            x: 0,
            y: 0,
          },
        },
      })
    ).toThrow("Insufficient ingredient: Wood");
  });

  it("crafts a Fire Pit if there is sufficient ingredients", () => {
    expect(() =>
      constructBuilding({
        state: {
          ...GAME_STATE,
          inventory: {
            Wood: new Decimal(100),
            Stone: new Decimal(100),
          },
        },
        action: {
          type: "building.constructed",
          name: "Fire Pit",
          coordinates: {
            x: 0,
            y: 0,
          },
        },
      })
    ).not.toThrow("Insufficient ingredient: Wood");
  });

  it("does not craft item with insufficient SFL", () => {
    expect(() =>
      constructBuilding({
        state: {
          ...GAME_STATE,
          inventory: {
            Wood: new Decimal(100),
            Stone: new Decimal(100),
          },
          bumpkin: {
            id: 1,
            level: 2,
            equipped: {
              body: "Light Brown Farmer Potion",
              hair: "Basic Hair",
              eyes: "Rosy Wide Eyes",
              mouth: "Wide Smile",
              shirt: "Red Farmer Shirt",
              pants: "Farmer Pants",
              shoes: "Black Farmer Boots",
            },
          },
          balance: new Decimal(0),
        },
        action: {
          type: "building.constructed",
          name: "Workbench",
          coordinates: {
            x: 0,
            y: 0,
          },
        },
      })
    ).toThrow("Insufficient SFL");
  });

  it("crafts item with sufficient SFL", () => {
    expect(() =>
      constructBuilding({
        state: {
          ...GAME_STATE,
          inventory: {
            Wood: new Decimal(100),
            Stone: new Decimal(100),
          },
          bumpkin: {
            id: 1,
            level: 2,
            equipped: {
              body: "Light Brown Farmer Potion",
              hair: "Basic Hair",
              eyes: "Rosy Wide Eyes",
              mouth: "Wide Smile",
              shirt: "Red Farmer Shirt",
              pants: "Farmer Pants",
              shoes: "Black Farmer Boots",
            },
          },
          balance: new Decimal(100),
        },
        action: {
          type: "building.constructed",
          name: "Workbench",
          coordinates: {
            x: 0,
            y: 0,
          },
        },
      })
    ).not.toThrow("Insufficient SFL");
  });

  it("adds the building to the inventory", () => {
    const state = constructBuilding({
      state: {
        ...GAME_STATE,
        balance: new Decimal(100),
        inventory: { Wood: new Decimal(20), Stone: new Decimal(100) },
        bumpkin: {
          id: 1,
          level: 2,
          equipped: {
            body: "Light Brown Farmer Potion",
            hair: "Basic Hair",
            eyes: "Rosy Wide Eyes",
            mouth: "Wide Smile",
            shirt: "Red Farmer Shirt",
            pants: "Farmer Pants",
            shoes: "Black Farmer Boots",
          },
        },
      },
      action: {
        type: "building.constructed",
        name: "Fire Pit",
        coordinates: {
          x: 0,
          y: 0,
        },
      },
    });

    expect(state.inventory["Fire Pit"]).toEqual(new Decimal(1));
  });

  it("does not affect existing inventory", () => {
    const state = constructBuilding({
      state: {
        ...GAME_STATE,
        inventory: {
          Wood: new Decimal(100),
          Stone: new Decimal(100),
          Radish: new Decimal(50),
        },
        bumpkin: {
          id: 1,
          level: 2,
          equipped: {
            body: "Light Brown Farmer Potion",
            hair: "Basic Hair",
            eyes: "Rosy Wide Eyes",
            mouth: "Wide Smile",
            shirt: "Red Farmer Shirt",
            pants: "Farmer Pants",
            shoes: "Black Farmer Boots",
          },
        },
      },
      action: {
        type: "building.constructed",
        name: "Fire Pit",
        coordinates: {
          x: 0,
          y: 0,
        },
      },
    });

    expect(state.inventory["Fire Pit"]).toEqual(new Decimal(1));
    expect(state.inventory["Radish"]).toEqual(new Decimal(50));
  });

  it("adds the building to the buildings data structure", () => {
    const state = constructBuilding({
      state: {
        ...GAME_STATE,
        balance: new Decimal(100),
        inventory: { Wood: new Decimal(20), Stone: new Decimal(100) },
        bumpkin: {
          id: 1,
          level: 2,
          equipped: {
            body: "Light Brown Farmer Potion",
            hair: "Basic Hair",
            eyes: "Rosy Wide Eyes",
            mouth: "Wide Smile",
            shirt: "Red Farmer Shirt",
            pants: "Farmer Pants",
            shoes: "Black Farmer Boots",
          },
        },
      },
      action: {
        type: "building.constructed",
        name: "Fire Pit",
        coordinates: {
          x: 1,
          y: 2,
        },
      },
      createdAt: date,
    });

    expect(state.buildings["Fire Pit"]).toHaveLength(1);
    expect(state.buildings["Fire Pit"]?.[0]).toEqual({
      coordinates: { x: 1, y: 2 },
      readyAt: date + 30 * 1000,
      createdAt: date,
    });
  });

  it("burns SFL on construct building", () => {
    const state = constructBuilding({
      state: {
        ...GAME_STATE,
        balance: new Decimal(100),
        inventory: { Wood: new Decimal(20), Stone: new Decimal(100) },
        bumpkin: {
          id: 1,
          level: 2,
          equipped: {
            body: "Light Brown Farmer Potion",
            hair: "Basic Hair",
            eyes: "Rosy Wide Eyes",
            mouth: "Wide Smile",
            shirt: "Red Farmer Shirt",
            pants: "Farmer Pants",
            shoes: "Black Farmer Boots",
          },
        },
      },
      action: {
        type: "building.constructed",
        name: "Workbench",
        coordinates: {
          x: 1,
          y: 2,
        },
      },
    });
    expect(state.balance).toEqual(new Decimal(99));
  });

  it("burns ingredients on construct building", () => {
    const state = constructBuilding({
      state: {
        ...GAME_STATE,
        balance: new Decimal(100),
        inventory: {
          Wood: new Decimal(20),
          Stone: new Decimal(15),
        },
        bumpkin: {
          id: 1,
          level: 2,
          equipped: {
            body: "Light Brown Farmer Potion",
            hair: "Basic Hair",
            eyes: "Rosy Wide Eyes",
            mouth: "Wide Smile",
            shirt: "Red Farmer Shirt",
            pants: "Farmer Pants",
            shoes: "Black Farmer Boots",
          },
        },
      },
      action: {
        type: "building.constructed",
        name: "Workbench",
        coordinates: {
          x: 1,
          y: 2,
        },
      },
    });
    expect(state.inventory["Wood"]).toEqual(new Decimal(15));
    expect(state.inventory["Stone"]).toEqual(new Decimal(10));
  });

  it("constructs multiple Fire Pits", () => {
    const state = constructBuilding({
      state: {
        ...GAME_STATE,
        balance: new Decimal(100),
        inventory: {
          Wood: new Decimal(20),
          Stone: new Decimal(15),
        },
        bumpkin: {
          id: 1,
          level: 2,
          equipped: {
            body: "Light Brown Farmer Potion",
            hair: "Basic Hair",
            eyes: "Rosy Wide Eyes",
            mouth: "Wide Smile",
            shirt: "Red Farmer Shirt",
            pants: "Farmer Pants",
            shoes: "Black Farmer Boots",
          },
        },
        buildings: {
          "Fire Pit": [
            {
              coordinates: { x: 1, y: 1 },
              createdAt: Date.now(),
              readyAt: Date.now() + 30 * 1000,
              id: "1",
            },
          ],
        },
      },
      action: {
        type: "building.constructed",
        name: "Fire Pit",
        coordinates: {
          x: 1,
          y: 2,
        },
      },
      createdAt: 234567890,
    });
    expect(state.buildings["Fire Pit"]).toHaveLength(2);
  });

  it("does not affect existing Buildings when constructing new Fire Pit", () => {
    const buildings = {
      "Fire Pit": [
        {
          coordinates: { x: 1, y: 1 },
          createdAt: date,
          readyAt: date + 30 * 1000,
          id: "1",
        },
      ],
      Workbench: [
        {
          coordinates: { x: 2, y: 2 },
          createdAt: date,
          readyAt: date + 5 * 60 * 1000,
          id: "2",
        },
      ],
    };

    const state = constructBuilding({
      state: {
        ...GAME_STATE,
        balance: new Decimal(100),
        inventory: {
          Wood: new Decimal(20),
          Stone: new Decimal(15),
        },
        bumpkin: {
          id: 1,
          level: 2,
          equipped: {
            body: "Light Brown Farmer Potion",
            hair: "Basic Hair",
            eyes: "Rosy Wide Eyes",
            mouth: "Wide Smile",
            shirt: "Red Farmer Shirt",
            pants: "Farmer Pants",
            shoes: "Black Farmer Boots",
            tool: "Farmer Pitchfork",
          },
        },
        buildings: {
          ...buildings,
        },
      },
      action: {
        type: "building.constructed",
        name: "Fire Pit",
        coordinates: {
          x: 1,
          y: 2,
        },
      },
      createdAt: date,
    });
    expect(state.buildings).toEqual({
      "Fire Pit": [
        {
          coordinates: { x: 1, y: 1 },
          createdAt: date,
          readyAt: date + 30 * 1000,
          id: "1",
        },
        {
          coordinates: {
            x: 1,
            y: 2,
          },
          createdAt: date,
          readyAt: date + 30 * 1000,
        },
      ],
      Workbench: [
        {
          coordinates: { x: 2, y: 2 },
          createdAt: date,
          readyAt: date + 5 * 60 * 1000,
          id: "2",
        },
      ],
    });
  });
});
