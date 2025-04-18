import React, { useContext, useRef, useState } from "react";
import { useActor } from "@xstate/react";
import classNames from "classnames";

import selectBox from "assets/ui/select/select_box.png";
import cancel from "assets/icons/cancel.png";

import { Context } from "features/game/GameProvider";
import { CropReward as Reward } from "features/game/types/game";

import { CropName, CROPS } from "features/game/types/crops";
import { ITEM_DETAILS } from "features/game/types/images";
import { GRID_WIDTH_PX, POPOVER_TIME_MS } from "features/game/lib/constants";
import { ToastContext } from "features/game/toast/ToastQueueProvider";
import { Soil } from "./Soil";
import { harvestAudio, plantAudio } from "lib/utils/sfx";
import { HealthBar } from "components/ui/HealthBar";
import { CropReward } from "../CropReward";

interface Props {
  plotIndex: number;
  expansionIndex: number;
  className?: string;
  onboarding?: boolean;
}

const isCropReady = (now: number, plantedAt: number, harvestSeconds: number) =>
  now - plantedAt > harvestSeconds * 1000;

export const Plot: React.FC<Props> = ({
  className,
  plotIndex,
  expansionIndex,
}) => {
  const { gameService, selectedItem } = useContext(Context);
  const [game] = useActor(gameService);
  const [showPopover, setShowPopover] = useState(false);
  const [showCropDetails, setShowCropDetails] = useState(false);
  const { setToast } = useContext(ToastContext);
  // Rewards
  const [touchCount, setTouchCount] = useState(0);
  const [reward, setReward] = useState<Reward | null>(null);
  const clickedAt = useRef<number>(0);

  const expansion = game.context.state.expansions[expansionIndex];
  const plot = expansion.plots?.[plotIndex];

  const crop = plot && plot.crop;

  const displayPopover = async () => {
    setShowPopover(true);
    await new Promise((resolve) => setTimeout(resolve, POPOVER_TIME_MS));
    setShowPopover(false);
  };

  const onCollectReward = () => {
    setReward(null);
    setTouchCount(0);

    gameService.send("crop.harvested", {
      index: plotIndex,
      expansionIndex,
    });
  };

  const handleMouseHover = () => {
    if (crop) {
      const { harvestSeconds } = CROPS()[crop.name];
      const now = Date.now();
      const isReady = isCropReady(now, crop.plantedAt, harvestSeconds);
      const isJustPlanted = now - crop.plantedAt < 1000;

      // show details if field is NOT ready and NOT just planted
      if (!isReady && !isJustPlanted) {
        // set state to show details
        setShowCropDetails(true);
      }
    }

    return;
  };

  const handleMouseLeave = () => {
    // set state to hide details
    setShowCropDetails(false);
  };

  const onClick = (analytics: boolean | undefined = undefined) => {
    // Small buffer to prevent accidental double clicks
    const now = Date.now();
    if (now - clickedAt.current < 100) return;

    clickedAt.current = now;

    // Crop is growing do nothing
    if (
      crop &&
      !isCropReady(now, crop.plantedAt, CROPS()[crop.name].harvestSeconds)
    )
      return;

    // Already looking at a reward
    if (reward) return;

    if (
      crop?.reward &&
      isCropReady(now, crop.plantedAt, CROPS()[crop.name].harvestSeconds)
    ) {
      if (touchCount < 1) {
        // Add to touch count for reward pickup
        setTouchCount((count) => count + 1);
        return;
      }

      // They have touched enough!
      setReward(crop.reward);

      return;
    }

    // Plant
    if (!crop) {
      try {
        gameService.send("seed.planted", {
          index: plotIndex,
          expansionIndex,
          item: selectedItem,
          analytics,
        });

        plantAudio.play();

        setToast({
          icon: ITEM_DETAILS[selectedItem as CropName].image,
          content: `-1`,
        });
      } catch (e: any) {
        // TODO - catch more elaborate errors
        displayPopover();
      }

      return;
    }

    try {
      gameService.send("crop.harvested", {
        index: plotIndex,
        expansionIndex,
      });

      harvestAudio.play();

      setToast({
        icon: ITEM_DETAILS[crop.name].image,
        content: `+${crop.amount || 1}`,
      });
    } catch (e: any) {
      // TODO - catch more elaborate errors
      displayPopover();
    }

    setTouchCount(0);
  };

  const playing = game.matches("playing") || game.matches("autosaving");

  return (
    <div
      onMouseEnter={handleMouseHover}
      onMouseLeave={handleMouseLeave}
      className={classNames("relative group", className)}
      style={{
        width: `${GRID_WIDTH_PX}px`,
        height: `${GRID_WIDTH_PX}px`,
      }}
    >
      <div className="absolute bottom-1 w-full h-full">
        <Soil
          className="absolute bottom-0 pointer-events-none"
          plantedCrop={crop}
          showCropDetails={showCropDetails}
        />

        <div
          className={classNames(
            "transition-opacity pointer-events-none absolute -bottom-2 left-1",
            {
              "opacity-100": touchCount > 0,
              "opacity-0": touchCount === 0,
            }
          )}
        >
          <HealthBar percentage={100 - touchCount * 50} />
        </div>
        <div
          className={classNames(
            "transition-opacity absolute -bottom-2 w-full z-20 pointer-events-none flex justify-center",
            {
              "opacity-100": showPopover,
              "opacity-0": !showPopover,
            }
          )}
        >
          <img className="w-5" src={cancel} />
        </div>
        <img
          src={selectBox}
          style={{
            opacity: 0.1,
            visibility: "hidden",
          }}
          className="absolute inset-0 w-full opacity-0 sm:group-hover:opacity-100 sm:hover:!opacity-100 z-20 cursor-pointer"
          onClick={() => onClick(true)}
        />
        {playing && (
          <img
            src={selectBox}
            style={{
              opacity: 0.1,
            }}
            className="absolute block inset-0 w-full opacity-0 sm:group-hover:opacity-100 sm:hover:!opacity-100 z-30 cursor-pointer"
            onClick={() => onClick()}
          />
        )}
        <CropReward
          reward={reward}
          onCollected={onCollectReward}
          fieldIndex={plotIndex}
        />
      </div>
    </div>
  );
};
