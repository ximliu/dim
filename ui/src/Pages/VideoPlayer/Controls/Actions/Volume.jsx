import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import VolumeUpIcon from "../../../../assets/Icons/VolumeUp";
import VolumeMuteIcon from "../../../../assets/Icons/VolumeMute";

import { updateVideo } from "../../../../actions/video";

function VideoActionVolume() {
  const dispatch = useDispatch();

  const { video, player } = useSelector(store => ({
    video: store.video,
    player: store.video.player
  }));

  const volSliderRef = useRef(null);
  const volRef = useRef(null);

  const [currentVolume, setCurrentVolume] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [showVolCount, setShowVolCount] = useState(false);

  const toggleMute = useCallback(() => {
    dispatch(updateVideo({
      idleCount: 0
    }));

    if (currentVolume === 0) {
      player.setMute(false);
      player.setVolume(1);
      setCurrentVolume(100);
    }

    if (currentVolume > 0) {
      const currentMuteState = player.isMuted();

      player.setMute(!currentMuteState);

      dispatch(updateVideo({
        muted: !currentMuteState
      }));
    }
  }, [currentVolume, dispatch, player]);

  const handleKeyDown = useCallback(e => {
    if (e.key === "m") {
      toggleMute();
    }
  }, [toggleMute]);

  const handleClick = useCallback(e => {
    const slider = volSliderRef.current.getBoundingClientRect();
    const x = e.clientX - slider.left;

    let percent = Math.round((x / slider.width) * 100);

    if (percent <= 10) {
      percent = 0;
    }

    if (percent >= 90) {
      percent = 100;
    }

    volRef.current.style.transition = "width 100ms ease-in-out";

    setCurrentVolume(percent);
    setShowVolCount(true);
    localStorage.setItem("videoVolume", percent);
  }, []);

  const handleMouseDown = useCallback(() => {
    setDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
    localStorage.setItem("videoVolume", currentVolume);
  }, [currentVolume]);

  const handleMouseMove = useCallback((e) => {
    if (dragging) {
      const slider = volSliderRef.current.getBoundingClientRect();
      const x = e.clientX - slider.left;

      let percent = Math.round((x / slider.width) * 100);

      if (percent <= 5) {
        percent = 0;
      }

      if (percent >= 95) {
        percent = 100;
      }

      volRef.current.style.transition = "";

      setCurrentVolume(percent);
      setShowVolCount(true);
    }
  }, [dragging]);

  useEffect(() => {
    if (!player) return;

    const newVolume = currentVolume / 100;

    player.setVolume(newVolume);

    volRef.current.style.width = `${currentVolume}%`;
    volSliderRef.current.setAttribute("data-currentVolume", currentVolume);
  }, [currentVolume, player]);

  useEffect(() => {
    if (!player) return;

    const prefVideoVolume = localStorage.getItem("videoVolume");

    if (prefVideoVolume) {
      setCurrentVolume(prefVideoVolume);
      player.setVolume(prefVideoVolume / 100);
    }
  }, [player]);

  useEffect(() => {
    const volSlider = volSliderRef.current;

    volSlider.addEventListener("click", handleClick);
    volSlider.addEventListener("mousedown", handleMouseDown);
    volSlider.addEventListener("mouseup", handleMouseUp);
    volSlider.addEventListener("mousemove", handleMouseMove);

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      volSlider.removeEventListener("click", handleClick);
      volSlider.removeEventListener("mousedown", handleMouseDown);
      volSlider.removeEventListener("mouseup", handleMouseUp);
      volSlider.removeEventListener("mousemove", handleMouseMove);

      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClick, handleKeyDown, handleMouseDown, handleMouseMove, handleMouseUp]);

  return (
    <>
      <button onClick={toggleMute} className="volume">
        {!video.muted && currentVolume > 0 ? <VolumeUpIcon/> : <VolumeMuteIcon/>}
      </button>
      <div className="volSliderWrapper">
        <div className={`volSlider dragging-${showVolCount}`} ref={volSliderRef}>
          <div className="vol" ref={volRef}/>
        </div>
      </div>
    </>
  );
}

export default VideoActionVolume;
