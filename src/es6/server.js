import Game from './game'

// Server simulation
export class Server {

    // TODO: unit tests

    // Return server where address matches either URL or IP
    static find(address) {
        // IMPROVE: test 1st character of address, if it's a figure consider it as an IP... maybe
        let server = this.getByURL(address);
        if (server != null) {
            return server;
        } else {
            return this.getByIP(address);
        }
    }

    // Return server in game data with given url
    static getByURL(url) {
        return this.getByIP(game.dns[url]);
    }

    // Return server in game data with given ip
    static getByIP(ip) {
        for (let _ in game.servers) {
            let server = game.servers[_];
            if (server.ip === ip) {
                return server;
            }
        }
        return null;
    }

    // Construct server
    //
    // mainURL [string] main domain URL, the most common among those in the domain table
    // ip [string] IPv6
    // files [File[]] files at the filesystem root
    // databaseList [string[]] array of database used by applications on server
    constructor(mainURL, ip, files, databaseList = []) {
        // fileSystem [FileSystem] filesystem of the server
        this.mainURL = mainURL;
        this.ip = ip;
        this.fileSystem = new FileSystem(new Directory("root", files));
        this.databaseList = databaseList;
    }

    // Return filesystem root
    getRoot() {
        return this.fileSystem.root;
    }

    toString() {
        return `Server ${this.mainURL} (${this.ip})`;
    }
};


export class FileSystem {

    // @param root [File] filesystem root directory
    constructor(root) {
        this.root = root;
    }
};

// File or directory (file in the UNIX sense)
export class File {};


export class Directory extends File {

    // @param name [String] name of the directory
    // @param children [File[]] list of children files / directories
    constructor(name, children = []) {
        super()  // optional, but removes "this not allowed before super" error in Babel if using preset es2015
        this.name = name;
        this.children = children;
    }

    // Return list of children directories
    getChildrenDirs() {
        return this.children.filter(value => value instanceof Directory);
    }

    // Return child directory with given name, or null if none was found
    getChildDir(name) {
        let results = this.children.filter(value => value instanceof Directory && value.name === name);
        if (results.length === 0) {
            return null;
        } else if (results.length === 1) {
            return results[0];
        } else {
            throw new Error(`Error: more than 1 directory found with name '${name}'`);
        }
    }

    // Return array
//  getDirChain: (path) =>
//    if path == ''
//      return [@]
//    pathChain = path.split '/'
//    currentDir = @  # start from this directory
//    for nextDirName in pathChain
//  # TODO: support '..'
//      if nextDirName != '.'
//        currentDir = currentDir.getChildDir nextDirName


    // Return directory at relative path from this directory
    //
    // @param path [String] path in the "./a/b" format; empty string is equivalent to '.'
    getDir(path) {
        // split the path at each '/', but if it is empty create empty chain array manually ("".split returns [''])
        if (path === '') {
            return this;
        }
        let pathChain = path.split('/');
        let currentDir = this;  // start from this directory
        for (let i = 0; i < pathChain.length; i++) {
            // TODO: support '..'
            let nextDirName = pathChain[i];
            if (nextDirName !== '.') {
                currentDir = currentDir.getChildDir(nextDirName);
                if (currentDir == null) { return null; }  // if path cannot be resolved at this step, STOP, no such directory found
            }
        }
        return currentDir;
    }

// Return child file of given class with given name, or null if none was found
    //
    // @param fileClass [function] the constructor function representing the target class (e.g. TextFile)
    getFile(fileClass, name) {
        let results = this.children.filter(value => value instanceof fileClass && value.name === name);
        if (results.length === 0) {
            return null;
        } else if (results.length === 1) {
            return results[0];
        } else {
            throw new Error(`Error: more than 1 file of type ${fileClass} found with name '${name}'`);
        }
    }

    // Add file/directory in relative path from this directory
    //
    // @param file [File] file to add
    addFile(file, path = '') {
        return this.getDir(path).children.push(file);
    }

    toString() {
        return this.name;
    }
};

// Non-directory file
export class RegularFile extends File {};


// Text file, assumed extension .txt
export class TextFile extends RegularFile {

    // @param name [String] name of the file (without extension)
    // @param content [String] text content
    // @param onReadEvent [String] name of the event called when the file is read by the player in the terminal
    constructor(name, content, onReadEvent = null) {
        super()
        this.name = name;
        this.content = content;
        this.onReadEvent = onReadEvent;
    }
    // TODO: put localization helper here

    toString() {
        return this.name + ".txt";
    }
};


export class DatabaseSim {

    // Construct database with tables
    constructor(tables = []) {
        this.tables = tables;
    }
};


export class Table {

    // Construct table from row entries
    constructor(rows = []) {
        this.rows = rows;
    }
};

//# Computer process simulation
//class @Process
//
//  execute: (terminal) =>
//
