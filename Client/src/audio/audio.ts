const {Howl, Howler} = require('howler');

const incomingMsg = new Howl({
    src: ["incomingMessage.mp3"],
    html5: true
})

const outgoingMsg = new Howl({
    src: ["outgoingMessage.mp3"],
    html5: true
})

export function incomingMessage() {
    incomingMsg.play()
}

export function outgoingMessage() {
    outgoingMsg.play()
}


