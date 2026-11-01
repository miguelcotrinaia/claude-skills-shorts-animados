import React from "react";
import { Composition, type CalculateMetadataFunction } from "remotion";
import { CharacterSheet } from "./CharacterSheet";
import { AmbienteSheet } from "./AmbienteSheet";
import { Revision, calcularRevision, type RevisionProps } from "./Revision";
import { Short } from "./engine/Short";
import { buildTimeline } from "./engine/timeline";
import type { ShortProps } from "./engine/types";
import type { AmbienteId } from "./engine/ambientes";
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
      <Composition id="Personajes" component={CharacterSheet} durationInFrames={120} fps={FPS} width={W} height={H} defaultProps={{ ambiente: "grafito" as AmbienteId }} />
      <Composition id="Ambiente" component={AmbienteSheet} durationInFrames={60} fps={FPS} width={W} height={H} defaultProps={{ ambiente: "grafito" as AmbienteId }} />
      {/* Hoja de revisión (npm run revisar -- <id>): una toma por línea en una sola imagen */}
      <Composition
        id="Revision"
        component={Revision}
        durationInFrames={1}
        fps={FPS}
        width={1400}
        height={600}
        defaultProps={{ id: VIDEOS[0]?.id ?? "" } as RevisionProps}
        calculateMetadata={calcularRevision}
      />
    </>
  );
};
