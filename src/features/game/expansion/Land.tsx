import React, { useContext, useLayoutEffect } from "react";
import { Section, useScrollIntoView } from "lib/utils/hooks/useScrollIntoView";
import { MapPlacement } from "./components/MapPlacement";
import { useActor } from "@xstate/react";
import { Context } from "../GameProvider";
import { getTerrainImageByKey } from "../lib/getTerrainImageByKey";
import { COLLECTIBLES_DIMENSIONS, getKeys } from "../types/craftables";
import { Plot } from "features/farming/crops/components/landExpansion/Plot";
import { Tree } from "./components/resources/Tree";
import { Pebble } from "./components/resources/Pebble";
import { Shrub } from "./components/resources/Shrub";
import { LandBase } from "./components/LandBase";
import { UpcomingExpansion } from "./components/UpcomingExpansion";
import { LandExpansion } from "../types/game";
import { TerrainPlacement } from "./components/TerrainPlacement";
import { EXPANSION_ORIGINS } from "./lib/constants";
import { Stone } from "./components/resources/Stone";
import { Placeable } from "./placeable/Placeable";
import { BuildingName, BUILDINGS_DIMENSIONS } from "../types/buildings";
import { Building } from "features/island/buildings/components/building/Building";
import { ITEM_DETAILS } from "../types/images";
import { Character } from "features/island/bumpkin/components/Character";

type ExpansionProps = Pick<
  LandExpansion,
  "shrubs" | "plots" | "trees" | "terrains" | "pebbles" | "stones" | "createdAt"
>;

export const Expansion: React.FC<
  ExpansionProps & { expansionIndex: number }
> = ({
  shrubs,
  plots,
  trees,
  stones,
  terrains,
  pebbles,
  createdAt,
  expansionIndex,
}) => {
  const { x: xOffset, y: yOffset } = EXPANSION_ORIGINS[expansionIndex];

  return (
    <>
      {shrubs &&
        getKeys(shrubs).map((index) => {
          const { x, y, width, height } = shrubs[index];

          return (
            <MapPlacement
              key={`${createdAt}-shrub-${index}`}
              x={x + xOffset}
              y={y + yOffset}
              height={height}
              width={width}
            >
              <Shrub shrubIndex={index} expansionIndex={expansionIndex} />
            </MapPlacement>
          );
        })}

      {pebbles &&
        getKeys(pebbles).map((index) => {
          const { x, y, width, height } = pebbles[index];

          return (
            <MapPlacement
              key={`${createdAt}-pebble-${index}`}
              x={x + xOffset}
              y={y + yOffset}
              height={height}
              width={width}
            >
              <Pebble pebbleIndex={index} expansionIndex={expansionIndex} />
            </MapPlacement>
          );
        })}

      {terrains &&
        getKeys(terrains).map((index) => {
          const { x, y, width, height, name } = terrains[index];

          return (
            <TerrainPlacement
              key={`${createdAt}-terrain-${index}`}
              x={x + xOffset}
              y={y + yOffset}
              height={height}
              width={width}
            >
              <img src={getTerrainImageByKey(name)} className="h-full w-full" />
            </TerrainPlacement>
          );
        })}

      {plots &&
        getKeys(plots).map((index) => {
          const { x, y, width, height } = plots[index];

          return (
            <MapPlacement
              key={`${createdAt}-plot-${index}`}
              x={x + xOffset}
              y={y + yOffset}
              height={height}
              width={width}
            >
              <Plot plotIndex={Number(index)} expansionIndex={expansionIndex} />
            </MapPlacement>
          );
        })}

      {trees &&
        getKeys(trees).map((index) => {
          const { x, y, width, height } = trees[index];

          return (
            <MapPlacement
              key={`${createdAt}-tree-${index}`}
              x={x + xOffset}
              y={y + yOffset}
              height={height}
              width={width}
            >
              <Tree treeIndex={Number(index)} expansionIndex={expansionIndex} />
            </MapPlacement>
          );
        })}

      {stones &&
        getKeys(stones).map((index) => {
          const { x, y, width, height } = stones[index];

          return (
            <MapPlacement
              key={`${createdAt}-stone-${index}`}
              x={x + xOffset}
              y={y + yOffset}
              height={height}
              width={width}
            >
              <Stone
                rockIndex={Number(index)}
                expansionIndex={expansionIndex}
              />
            </MapPlacement>
          );
        })}
    </>
  );
};

export const Land: React.FC = () => {
  const { gameService } = useContext(Context);
  const [gameState] = useActor(gameService);
  const { state } = gameState.context;

  const { expansions, buildings, collectibles } = state;

  const [scrollIntoView] = useScrollIntoView();

  useLayoutEffect(() => {
    scrollIntoView(Section.GenesisBlock, "auto");
  }, []);

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="relative w-full h-full">
        <LandBase expansions={expansions} />
        <UpcomingExpansion gameState={state} />

        {expansions
          .filter((expansion) => expansion.readyAt < Date.now())
          .map(
            (
              { shrubs, pebbles, stones, terrains, trees, plots, createdAt },
              index
            ) => (
              <Expansion
                createdAt={createdAt}
                expansionIndex={index}
                key={index}
                shrubs={shrubs}
                pebbles={pebbles}
                stones={stones}
                terrains={terrains}
                trees={trees}
                plots={plots}
              />
            )
          )}

        {gameState.matches("editing") && <Placeable />}

        {gameState.context.state.bumpkin?.equipped && (
          <MapPlacement x={2} y={1}>
            <Character
              body={gameState.context.state.bumpkin.equipped.body}
              hair={gameState.context.state.bumpkin.equipped.hair}
              pants={gameState.context.state.bumpkin.equipped.pants}
              onClick={console.log}
            />
          </MapPlacement>
        )}

        {getKeys(buildings).flatMap((name) => {
          const items = buildings[name];
          return items?.map((building, index) => {
            const { x, y } = building.coordinates;
            const { width, height } = BUILDINGS_DIMENSIONS[name];

            return (
              <MapPlacement
                key={index}
                x={x}
                y={y}
                height={height}
                width={width}
              >
                <Building
                  id={building.id}
                  building={building}
                  name={name as BuildingName}
                />
              </MapPlacement>
            );
          });
        })}

        {getKeys(collectibles).flatMap((name) => {
          const items = collectibles[name];
          return items?.map((collectible, index) => {
            const { x, y } = collectible.coordinates;
            const { width, height } = COLLECTIBLES_DIMENSIONS[name];

            return (
              <MapPlacement
                key={index}
                x={x}
                y={y}
                height={height}
                width={width}
              >
                <div className="flex justify-center w-full h-full">
                  <img src={ITEM_DETAILS[name].image} alt={name} />
                </div>
              </MapPlacement>
            );
          });
        })}
      </div>
    </div>
  );
};
