import React from "react";
import { Composition, type CalculateMetadataFunction } from "remotion";
import { CharacterSheet } from "./CharacterSheet";
import { Short } from "./engine/Short";
import { buildTimeline } from "./engine/timeline";
import type { ShortProps } from "./engine/types";
import { VIDEOS } from "./videos";
import { FPS, H, W } from "./theme";

const calculateMetadata: CalculateMetadataFunction<ShortProps> = async ({ props }) => {
  const timeline = await buildTimeline(props.spec, FPS);
  return { durationInFrames: timeline.durationInFrames, props: { ...props, timeline } };
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {VIDEOS.map((spec) => (
        <Composition
          key={spec.id}
          id={spec.id}
          component={Short}
          durationInFrames={30 * FPS}
          fps={FPS}
          width={W}
          height={H}
          defaultProps={{ spec } as ShortProps}
          calculateMetadata={calculateMetadata}
        />
      ))}
      <Composition id="Personajes" component={CharacterSheet} durationInFrames={120} fps={FPS} width={W} height={H} />
    </>
  );
};
