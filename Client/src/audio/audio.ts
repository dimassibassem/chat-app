const load = require('audio-loader')

let incomingMsg: AudioBuffer | null
let outgoingMsg: AudioBuffer | null

(async () => {
    incomingMsg = await load(`incomingMessage.mp3`)
    outgoingMsg = await load(`outgoingMessage.mp3`)
})()

export function incomingMessage() {
    const audio = new AudioContext()
    const source = audio.createBufferSource()
    source.buffer = incomingMsg
    source.connect(audio.destination)
    source.start()
}

export function outgoingMessage() {
    const audio = new AudioContext()
    const source = audio.createBufferSource()
    source.buffer = outgoingMsg
    source.connect(audio.destination)
    source.start()
}


