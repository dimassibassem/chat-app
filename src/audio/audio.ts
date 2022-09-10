const load = require('audio-loader')

export function incomingMessage() {
    load('incomingMessage.mp3').then((buffer: any) => {
        const audio = new AudioContext()
        const source = audio.createBufferSource()
        source.buffer = buffer
        source.connect(audio.destination)
        source.start()
    })
}

export function outgoingMessage() {
    load('outgoingMessage.mp3').then((buffer: any) => {
        const audio = new AudioContext()
        const source = audio.createBufferSource()
        source.buffer = buffer
        source.connect(audio.destination)
        source.start()
    })
}

export function typingMessage() {
    load('typingMessage.mp3').then((buffer: any) => {
        const audio = new AudioContext()
        const source = audio.createBufferSource()
        source.buffer = buffer
        source.connect(audio.destination)
        source.start()
    })
}

