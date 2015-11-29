/**
 * Created by huulong on 2015/11/29.
 */

var incomingMessageSequence = [
    "Hi!",
    "How are you?",
    "Is everything alright?"
];

// index of next message to receive
var nextIncomingMessageIdx = 0;

var chatHistoryList = null;

function init() {
    chatHistoryList = $(".chat-history").find("ul");
}

function displayNextMessage() {
    var template = Handlebars.compile($("#message-template").html());
    var context = {
        messageOutput: incomingMessageSequence[nextIncomingMessageIdx],
        time: "12:00"
    }
    chatHistoryList.append(template(context));

    nextIncomingMessageIdx ++;
}