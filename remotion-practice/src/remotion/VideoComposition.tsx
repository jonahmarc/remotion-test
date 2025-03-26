import { AbsoluteFill, Video } from "remotion";

export const VideoComposition = ({ videoSrc }: { videoSrc: string }) => {
    return (
        <AbsoluteFill>
            <Video src={videoSrc}
            />
        </AbsoluteFill>
    );
};
