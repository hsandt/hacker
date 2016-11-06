// require "game.js"

export default class {

    // @param title [String] mission title
    // @param onStart [Function()] called when the mission starts
    // @param onComplete [Function()] called when the mission is completed
    constructor(title, onStart, onComplete) {
        this.title = title;
        this.onStart = onStart;
        this.onComplete = onComplete;
    }
}
