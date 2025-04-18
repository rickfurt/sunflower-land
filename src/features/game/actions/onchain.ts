import { metamask } from "lib/blockchain/metamask";
import { fromWei } from "web3-utils";
import Decimal from "decimal.js-light";

import { balancesToInventory, populateFields } from "lib/utils/visitUtils";

import { GameState, Inventory } from "../types/game";
import { LIMITED_ITEM_NAMES } from "../types/craftables";
import { EMPTY } from "../lib/constants";
import { CONFIG } from "lib/config";
import { KNOWN_IDS } from "../types";
import { Recipe } from "lib/blockchain/Sessions";
import { OnChainBumpkin } from "lib/blockchain/BumpkinDetails";

const API_URL = CONFIG.API_URL;

async function loadMetadata(id: number) {
  // Go and fetch the metadata file for this farm
  const url = `${API_URL}/nfts/farm/${id}`;
  const response = await window.fetch(url, {
    method: "GET",
    headers: {
      "content-type": "application/json;charset=UTF-8",
    },
  });

  const data = await response.json();

  return data;
}
type GetStateArgs = {
  farmAddress: string;
  id: number;
};

export async function isFarmBlacklisted(id: number) {
  const metadata = await loadMetadata(id);

  return metadata.image.includes("blacklisted");
}

const RECIPES_IDS = LIMITED_ITEM_NAMES.map((name) => KNOWN_IDS[name]);

export type LimitedItemRecipeWithMintedAt = Recipe & {
  mintedAt: number;
};

export async function getOnChainState({
  farmAddress,
  id,
}: GetStateArgs): Promise<{
  game: GameState;
  owner: string;
  limitedItems: LimitedItemRecipeWithMintedAt[];
  bumpkin?: OnChainBumpkin;
}> {
  if (!CONFIG.API_URL) {
    return { game: EMPTY, owner: "", limitedItems: [] };
  }

  const balanceFn = metamask.getToken().balanceOf(farmAddress);
  const balancesFn = metamask.getInventory().getBalances(farmAddress);
  const farmFn = metamask.getFarm().getFarm(id);
  const bumpkinFn = metamask.getBumpkinDetails().loadBumpkins();

  // Short term workaround to get data from session contract
  const recipesFn = metamask.getSessionManager().getRecipes(RECIPES_IDS);

  const mintedAtsFn = metamask
    .getSessionManager()
    .getMintedAtBatch(id, RECIPES_IDS);

  // Promise all
  const [balance, balances, farm, recipes, mintedAts, bumpkins] =
    await Promise.all([
      balanceFn,
      balancesFn,
      farmFn,
      recipesFn,
      mintedAtsFn,
      bumpkinFn,
    ]);

  const limitedItems = recipes.map((recipe, index) => ({
    ...recipe,
    mintedAt: mintedAts[index],
  }));

  const inventory = balancesToInventory(balances);
  const fields = populateFields(inventory);

  console.log({ bumpkins });
  return {
    game: {
      ...EMPTY,
      balance: new Decimal(fromWei(balance)),
      farmAddress,
      fields,
      inventory,
    },
    owner: farm.owner,
    limitedItems,
    bumpkin: bumpkins[0],
  };
}

export async function getTreasuryItems() {
  if (!API_URL) return {} as Inventory;

  const treasuryItems = await metamask
    .getInventory()
    .getBalances(CONFIG.TREASURY_ADDRESS);

  return balancesToInventory(treasuryItems);
}
