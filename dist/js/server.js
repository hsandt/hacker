// Generated by CoffeeScript 1.10.0
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  this.Server = (function() {
    Server.find = function(address) {
      var server;
      server = this.getByURL(address);
      if (server != null) {
        return server;
      } else {
        return this.getByIP(address);
      }
    };

    Server.getByURL = function(url) {
      return this.getByIP(Game.dns[url]);
    };

    Server.getByIP = function(ip) {
      var _, ref, server;
      ref = game.servers;
      for (_ in ref) {
        server = ref[_];
        if (server.ip === ip) {
          return server;
        }
      }
      return null;
    };

    function Server(mainURL, ip1, files, databaseList) {
      this.mainURL = mainURL;
      this.ip = ip1;
      this.databaseList = databaseList != null ? databaseList : [];
      this.toString = bind(this.toString, this);
      this.getRoot = bind(this.getRoot, this);
      this.fileSystem = new FileSystem(new Directory("root", files));
    }

    Server.prototype.getRoot = function() {
      return this.fileSystem.root;
    };

    Server.prototype.toString = function() {
      return "Server " + this.mainURL + " (" + this.ip + ")";
    };

    return Server;

  })();

  this.FileSystem = (function() {
    function FileSystem(root) {
      this.root = root;
    }

    return FileSystem;

  })();

  this.File = (function() {
    function File() {}

    return File;

  })();

  this.Directory = (function(superClass) {
    extend(Directory, superClass);

    function Directory(name1, children) {
      this.name = name1;
      this.children = children != null ? children : [];
      this.toString = bind(this.toString, this);
      this.addFile = bind(this.addFile, this);
      this.getFile = bind(this.getFile, this);
      this.getDir = bind(this.getDir, this);
      this.getChildDir = bind(this.getChildDir, this);
      this.getChildrenDirs = bind(this.getChildrenDirs, this);
    }

    Directory.prototype.getChildrenDirs = function() {
      return this.children.filter(function(value) {
        return value instanceof Directory;
      });
    };

    Directory.prototype.getChildDir = function(name) {
      var results;
      results = this.children.filter(function(value) {
        return value instanceof Directory && value.name === name;
      });
      if (results.length === 0) {
        return null;
      } else if (results.length === 1) {
        return results[0];
      } else {
        throw new Error("Error: more than 1 directory found with name '" + name + "'");
      }
    };

    Directory.prototype.getDir = function(path) {
      var currentDir, i, len, nextDirName, pathChain;
      if (path === '') {
        return this;
      }
      pathChain = path.split('/');
      currentDir = this;
      for (i = 0, len = pathChain.length; i < len; i++) {
        nextDirName = pathChain[i];
        if (nextDirName !== '.') {
          currentDir = currentDir.getChildDir(nextDirName);
          if (currentDir == null) {
            return null;
          }
        }
      }
      return currentDir;
    };

    Directory.prototype.getFile = function(fileClass, name) {
      var results;
      results = this.children.filter(function(value) {
        return value instanceof fileClass && value.name === name;
      });
      if (results.length === 0) {
        return null;
      } else if (results.length === 1) {
        return results[0];
      } else {
        throw new Error("Error: more than 1 file of type " + fileClass + " found with name '" + name + "'");
      }
    };

    Directory.prototype.addFile = function(file, path) {
      if (path == null) {
        path = '';
      }
      return this.getDir(path).children.push(file);
    };

    Directory.prototype.toString = function() {
      return this.name;
    };

    return Directory;

  })(File);

  this.RegularFile = (function(superClass) {
    extend(RegularFile, superClass);

    function RegularFile() {
      return RegularFile.__super__.constructor.apply(this, arguments);
    }

    return RegularFile;

  })(File);

  this.TextFile = (function(superClass) {
    extend(TextFile, superClass);

    function TextFile(name1, content, onReadEvent) {
      this.name = name1;
      this.content = content;
      this.onReadEvent = onReadEvent != null ? onReadEvent : null;
      this.toString = bind(this.toString, this);
    }

    TextFile.prototype.toString = function() {
      return this.name + ".txt";
    };

    return TextFile;

  })(RegularFile);

  this.DatabaseSim = (function() {
    function DatabaseSim(tables) {
      this.tables = tables != null ? tables : [];
    }

    return DatabaseSim;

  })();

  this.Table = (function() {
    function Table(rows) {
      this.rows = rows != null ? rows : [];
    }

    return Table;

  })();

}).call(this);

//# sourceMappingURL=server.js.map
