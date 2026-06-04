import {
  Room,
  RoomEvent,
  Track,
  ConnectionState,
  createLocalVideoTrack,
  createLocalAudioTrack,
} from "livekit-client"
import type { CameraDevice } from "@/types"

let roomInstance: Room | null = null

export function getRoom(): Room {
  if (!roomInstance) {
    roomInstance = new Room({
      adaptiveStream: true,
      dynacast: true,
    })
  }
  return roomInstance
}

export async function joinRoom(
  url: string,
  token: string,
  onCameraAdded: (camera: CameraDevice) => void,
  onCameraRemoved: (cameraId: string) => void,
): Promise<Room> {
  const room = getRoom()

  room.on(
    RoomEvent.TrackSubscribed,
    (track, _publication, participant) => {
      if (track.kind === Track.Kind.Video) {
        onCameraAdded({
          id: participant.identity + "-" + track.sid,
          name: participant.identity,
          status: "connected",
          battery: 80,
          signal: 90,
          trackSid: track.sid,
        })
      }
    },
  )

  room.on(
    RoomEvent.TrackUnsubscribed,
    (_track, _publication, participant) => {
      onCameraRemoved(participant.identity)
    },
  )

  await room.connect(url, token)
  return room
}

export async function publishCameraTracks(
  facingMode: "user" | "environment" = "environment",
): Promise<void> {
  const room = getRoom()
  if (!room.localParticipant) return

  const videoTrack = await createLocalVideoTrack({
    resolution: { width: 1920, height: 1080, frameRate: 30 },
    facingMode,
  })
  await room.localParticipant.publishTrack(videoTrack, { simulcast: true })

  const audioTrack = await createLocalAudioTrack()
  await room.localParticipant.publishTrack(audioTrack)
}

export async function leaveRoom(): Promise<void> {
  const room = getRoom()
  await room.disconnect()
  roomInstance = null
}

export function isRoomConnected(): boolean {
  const room = getRoom()
  return room.state === ConnectionState.Connected
}

export function getRemoteVideoTracks(): Map<string, MediaStream> {
  const room = getRoom()
  const tracks = new Map<string, MediaStream>()

  room.remoteParticipants.forEach((participant) => {
    participant.videoTrackPublications.forEach((pub) => {
      if (pub.track?.mediaStreamTrack) {
        const stream = new MediaStream([pub.track.mediaStreamTrack])
        participant.audioTrackPublications.forEach((audioPub) => {
          if (audioPub.track?.mediaStreamTrack) {
            stream.addTrack(audioPub.track.mediaStreamTrack)
          }
        })
        tracks.set(participant.identity + "-" + pub.trackSid, stream)
      }
    })
  })

  return tracks
}
