import React, { useContext, useState } from "react";
import { useActor } from "@xstate/react";
import { Modal } from "react-bootstrap";
import classNames from "classnames";
import Decimal from "decimal.js-light";
import ReCAPTCHA from "react-google-recaptcha";
import { CONFIG } from "lib/config";

import token from "assets/icons/token.gif";
import tokenStatic from "assets/icons/token.png";

import { Box } from "components/ui/Box";
import { OuterPanel, Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { ToastContext } from "features/game/toast/ToastQueueProvider";
import { Context } from "features/game/GameProvider";
import { ITEM_DETAILS } from "features/game/types/images";
import { CraftableItem } from "features/game/types/craftables";
import { InventoryItemName } from "features/game/types/game";
import { Stock } from "components/ui/Stock";
import { getBuyPrice } from "features/game/events/craft";
import { getMaxChickens } from "features/game/events/feedChicken";

interface Props {
  items: Partial<Record<InventoryItemName, CraftableItem>>;
  isBulk?: boolean;
  onClose: () => void;
}

export const CraftingItems: React.FC<Props> = ({
  items,
  onClose,
  isBulk = false,
}) => {
  // Convert to array and filter out hidden from crafting items
  const craftableItems = Object.values(items).filter((item) => !item.hidden);

  const [selected, setSelected] = useState<CraftableItem>(craftableItems[0]);
  const [isCraftTenModalOpen, showCraftTenModal] = useState(false);
  const { setToast } = useContext(ToastContext);
  const { gameService, shortcutItem } = useContext(Context);
  const [showCaptcha, setShowCaptcha] = useState(false);

  const [
    {
      context: { state },
    },
  ] = useActor(gameService);
  const inventory = state.inventory;

  const price = getBuyPrice(selected, inventory);

  const lessIngredients = (amount = 1) =>
    selected.ingredients?.some((ingredient) =>
      ingredient.amount.mul(amount).greaterThan(inventory[ingredient.item] || 0)
    );

  const lessFunds = (amount = 1) => {
    if (!price) return;

    return state.balance.lessThan(price.mul(amount));
  };

  const craft = (amount = 1) => {
    gameService.send("item.crafted", {
      item: selected.name,
      amount,
    });

    setToast({
      icon: tokenStatic,
      content: `-$${price?.mul(amount)}`,
    });

    selected.ingredients?.map((ingredient) => {
      const item = ITEM_DETAILS[ingredient.item];
      setToast({
        icon: item.image,
        content: `-${ingredient.amount.mul(amount)}`,
      });
    });

    shortcutItem(selected.name);
  };

  const onCaptchaSolved = async (captcha: string | null) => {
    await new Promise((res) => setTimeout(res, 1000));

    gameService.send("SYNC", { captcha });

    onClose();
  };

  const restock = () => {
    setShowCaptcha(true);
  };
  // ask confirmation if crafting more than 10
  const openConfirmationModal = () => {
    showCraftTenModal(true);
  };

  const closeConfirmationModal = () => {
    showCraftTenModal(false);
  };
  const handleCraftTen = () => {
    craft(10);
    closeConfirmationModal();
  };
  if (showCaptcha) {
    return (
      <ReCAPTCHA
        sitekey={CONFIG.RECAPTCHA_SITEKEY}
        onChange={onCaptchaSolved}
        onExpired={() => setShowCaptcha(false)}
        className="w-full m-4 flex items-center justify-center"
      />
    );
  }

  const Action = () => {
    if (selected.disabled) {
      return <span className="text-xs mt-1 text-shadow">Locked</span>;
    }

    if (
      selected.name === "Chicken" &&
      inventory[selected.name]?.gte(getMaxChickens(inventory))
    ) {
      return (
        <span className="text-xs mt-1 text-shadow text-center">
          No more space for chickens
        </span>
      );
    }

    if (stock?.equals(0)) {
      return (
        <div>
          <p className="text-xxs no-wrap text-center my-1 underline">
            Sold out
          </p>
          <p className="text-xxs text-center">
            Sync your farm to the Blockchain to restock
          </p>
          <Button className="text-xs mt-1" onClick={restock}>
            Sync
          </Button>
        </div>
      );
    }

    return (
      <>
        <Button
          disabled={lessFunds() || lessIngredients() || stock?.lessThan(1)}
          className="text-xxs sm:text-xs mt-1 whitespace-nowrap"
          onClick={() => craft()}
        >
          Craft {isBulk && "1"}
        </Button>
        {isBulk && (
          <Button
            disabled={
              lessFunds(10) || lessIngredients(10) || stock?.lessThan(10)
            }
            className="text-xxs sm:text-xs mt-1 whitespace-nowrap"
            onClick={openConfirmationModal}
          >
            Craft 10
          </Button>
        )}
        <Modal
          centered
          show={isCraftTenModalOpen}
          onHide={closeConfirmationModal}
        >
          <Panel className="md:w-4/5 m-auto">
            <div className="m-auto flex flex-col">
              <span className="text-sm text-center text-shadow">
                Are you sure you want to <br className="hidden md:block" />
                craft 10 {selected.name}?
              </span>
            </div>
            <div className="flex justify-content-around p-1">
              <Button className="text-xs" onClick={handleCraftTen}>
                Yes
              </Button>
              <Button className="text-xs ml-2" onClick={closeConfirmationModal}>
                No
              </Button>
            </div>
          </Panel>
        </Modal>
      </>
    );
  };

  const stock = state.stock[selected.name] || new Decimal(0);

  return (
    <div className="flex">
      <div className="w-3/5 flex flex-wrap h-fit">
        {craftableItems.map((item) => (
          <Box
            isSelected={selected.name === item.name}
            key={item.name}
            onClick={() => setSelected(item)}
            image={ITEM_DETAILS[item.name].image}
            count={inventory[item.name]}
          />
        ))}
      </div>
      <OuterPanel className="flex-1 w-1/3">
        <div className="flex flex-col justify-center items-center p-2 relative">
          <Stock item={selected} />
          <span className="text-shadow text-center">{selected.name}</span>
          <img
            src={ITEM_DETAILS[selected.name].image}
            className="h-16 img-highlight mt-1"
            alt={selected.name}
          />
          <span className="text-shadow text-center mt-2 sm:text-sm">
            {selected.description}
          </span>

          <div className="border-t border-white w-full mt-2 pt-1">
            {selected.ingredients?.map((ingredient, index) => {
              const item = ITEM_DETAILS[ingredient.item];
              const inventoryAmount =
                inventory[ingredient.item]?.toDecimalPlaces(1) || 0;
              const requiredAmount = ingredient.amount.toDecimalPlaces(1);

              // Ingredient difference
              const lessIngredient = new Decimal(inventoryAmount).lessThan(
                requiredAmount
              );

              // rendering item remenants
              const renderRemenants = () => {
                if (lessIngredient) {
                  // if inventory items is less than required items
                  return (
                    <>
                      <span className="text-xs text-shadow text-center mt-2 text-red-500">
                        {`${inventoryAmount}`}
                      </span>
                      <span className="text-xs text-shadow text-center mt-2 text-red-500">
                        {`/${requiredAmount}`}
                      </span>
                    </>
                  );
                } else {
                  // if inventory items is equal to required items
                  return (
                    <span className="text-xs text-shadow text-center mt-2">
                      {`${requiredAmount}`}
                    </span>
                  );
                }
              };

              return (
                <div
                  className="flex justify-center flex-wrap items-end"
                  key={index}
                >
                  <img src={item.image} className="h-5 me-2" />
                  {renderRemenants()}
                </div>
              );
            })}

            <div className="flex justify-center items-end">
              <img src={token} className="h-5 mr-1" />
              <span
                className={classNames("text-xs text-shadow text-center mt-2 ", {
                  "text-red-500": lessFunds(),
                })}
              >
                {`$${price?.toNumber()}`}
              </span>
            </div>
          </div>
          {Action()}
        </div>
      </OuterPanel>
    </div>
  );
};
