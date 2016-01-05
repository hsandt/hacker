// Generated by CoffeeScript 1.10.0
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.StoryGraph = (function() {
    function StoryGraph(nodes, initialNodeTitle) {
      this.nodes = nodes != null ? nodes : {};
      this.initialNodeTitle = initialNodeTitle != null ? initialNodeTitle : "initial";
      this.getNode = bind(this.getNode, this);
      this.getInitialNode = bind(this.getInitialNode, this);
      this.addNode = bind(this.addNode, this);
    }

    StoryGraph.prototype.addNode = function(node) {
      return this.nodes[node.title] = node;
    };

    StoryGraph.prototype.getInitialNode = function() {
      return this.nodes[this.initialNodeTitle];
    };

    StoryGraph.prototype.getNode = function(title) {
      if (!(title in this.nodes)) {
        throw "Node '" + title + "' is not in the story graph";
      }
      return this.nodes[title];
    };

    return StoryGraph;

  })();

  this.StoryNode = (function() {
    function StoryNode(title1, onEnter, successors) {
      this.title = title1;
      this.successors = successors != null ? successors : [];
      this.onEnter = bind(this.onEnter, this);
      if (onEnter != null) {
        this.onEnter = onEnter;
      }
    }

    StoryNode.prototype.onEnter = function() {
      throw this + " has not implemented the 'onEnter' method.";
    };

    return StoryNode;

  })();

  this.Story = (function() {
    Story.prototype.storyGraph = null;

    Story.prototype.currentStoryNode = null;

    Story.prototype.currentMission = null;

    Story.prototype.events = {
      "mission01.accepted": false
    };

    function Story() {
      this.startMission = bind(this.startMission, this);
      this.enterNode = bind(this.enterNode, this);
      this.start = bind(this.start, this);
    }

    Story.prototype.start = function(storyGraph) {
      console.log("[STORY] Start");
      this.storyGraph = storyGraph;
      return this.enterNode(storyGraph.getInitialNode());
    };

    Story.prototype.enterNode = function(storyNode) {
      this.currentStoryNode = storyNode;
      return this.currentStoryNode.onEnter();
    };

    Story.prototype.startMission = function(title) {
      if (this.currentMission !== null) {
        throw new Exception("Cannot start new mission " + title + " while there is a current mission, " + this.currentMission.title);
      }
      this.currentMission = game.missions[title];
      return this.currentMission.onStart();
    };

    return Story;

  })();

}).call(this);
