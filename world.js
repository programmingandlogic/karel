/**
 * World Generator for Karel
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @license MIT
 * @version 1.0.0
 **/

'use strict';

// Node.js requires
const fs   = require('fs');
const path = require('path');

/**
 * World
 * @class
 **/
module.exports = class World {
  /**
   * World constructor
   * @constructor
   **/
  constructor(worlddir) {
    this.AST_PARSE = /(\w+)\: \((\d+, \d+)\) ?([a-z]+)?/ig
    this.worlds    = worlddir;
    this.dn        = 0;
  }

  /**
   * Get all matches for a regex
   **/
  _getRegexMatches(regex, string) {
    if(!(regex instanceof RegExp)) {
      return "ERROR";
    }

    const matches = [];
    let match = regex.exec(string);
    while (match) {
      if (match.length > 2) {
        const group_matches = [];
        for (var i = 1; i < match.length; i++) {
          group_matches.push(match[i]);
        }
        matches.push(group_matches);
      } else {
        matches.push(match[1]);
      }

      match = regex.exec(string);
    }

    return matches;
  }

  /**
   * Add an object to the world table.
   **/
  _addObject(wt, type, x, y,d ) {
    if(wt.x[x] === undefined) {
      wt.x[x] = [];
    }

    let isValid = true;

    if(x > wt.w || y > wt.h) {
      console.log('DROP: out-of-bounds.')
      return;
    }

    // check if it already exists, or already has something there.
    wt.x[x].forEach(function(v) {
      if(v.y === y) {
        isValid = false;
        console.log('DROP: already exists');
      }
    });

    if(isValid) {
      wt.x[x].push({
        type: type,
        x: x,
        y: y,
        d: d
      });
    }
  }

  /**
   * Get object at x, y
   **/
  getObject(wt, x, y) {
    let obj = false;

    if(wt.x[x] === undefined) {
      return false;
    }

    wt.x[x].forEach(function(v) {
      if(v.y == y && v.x == x) {
        obj = v;
      }
    });

    return obj;
  }

  /**
   * Remove object
   **/
  removeObject(wt, type, x, y) {
    let o = this.getObject(wt, x, y);

    if(o === false) {
      return false;
    }

    if(o.type !== type) {
      return false;
    }

    let i = 0;
    let obj = { c: null, i:null}
    wt.x[x].forEach(function(v) {
      if(v.y == y && v.x == x) {
        obj.c = v;
        obj.i = i;
      }

      i++;
    });

    wt.x[x].splice(obj.i, 1);
  }

  changeDirection(side) {
    let newd;
    if(side === 'right') {
      newd = this.dn+1;
    } else if(side === 'left') {
      newd = this.dn-1;
    } else {
      return false;
    }

    // determine if "change" of compass
    if(newd === 5) {
      this.dn = 1;
    } else if(newd === 0) {
      this.dn = 4;
    } else {
      this.dn = newd;
    }

    return this.dn;
  }

  setKarelDirection(world, num) {
    let dir;
    if(num === 1) {
      dir = 'west';
    } else if(num === 2) {
      dir = 'south';
    } else if(num === 3) {
      dir = 'east';
    } else if(num === 4) {
      dir = 'north';
    }

    world.k.d = dir;

    return world.k.d;
  }

  /**
   * Move the robot in direction amount
   **/
  move(wt, amount) {
    if(!this.dn || amount) {
      return false;
    }

    let newX = wt.k.x;
    let newY = wt.k.y;

    let oldO  = this.getObject(wt, newX, newY);
    let kd = wt.k.d;

    // console.log(oldO);
    // console.log('karel direction:', kd);

    let collision = false; // status
    if(oldO.type === 'Wall') {
      if(oldO.d === 'west' || oldO.d === 'east') {
        if(kd === 'north' || kd === 'south') {
          collision = true;
        }
      } else if(oldO.d === 'north' || oldO.d === 'south') {
        if(kd === 'west' || kd === 'east') {
          collision = true;
        }
      }
    }

    if(collision) {
      console.log(oldO);
      console.log(kd);
      console.log('COLLISION');

      return false;
    }

    if(this.dn === 1) { // north
      newY = wt.k.y+1;
    } else if(this.dn === 3) { // south
      newY = wt.k.y-1;
    }

    if(this.dn === 2) { // east
      newX = wt.k.x+1;
    } else if(this.dn === 4) { // west
      newX = wt.k.x-1;
    }

    let x = newX;
    let y = newY;
    let o = this.getObject(wt, newX, newY);

    wt.k.x = newX;
    wt.k.y = newY;

    // DEBUG: Status
    // console.log('new pos:', x, y);
    // console.log('object:', o);
  }

  /**
   * Parse a world
   **/
  parse(world) {
    if(this.worlds === undefined) {
      return false;
    }

    // world table "schema"
    let worldTable = {
      x: {}, // object storage
      k: { // karel location object
        x: 0, // karel x value
        y: 0, // karel y value
        d: null // karel direction
      },
      w: 0, // width of map
      h: 0, // height of map
      v: 2 // world table version constant
    }

    // combine path and join .w to ext
    world      = path.join(this.worlds, world).replace(/\.w$/g, '')+'.w';

    // load the world
    let res    = fs.readFileSync(world, 'utf8');

    // parsed object.
    let parsed = this._getRegexMatches(this.AST_PARSE, res);

    parsed.forEach((v) => {
      let type = v[0]              // type of object
      let pos  = v[1].split(', '); // x, y points

      let d = v[2];                // direction it's "facing"?
      let x = parseInt(pos[0]);
      let y = parseInt(pos[1]);

      if(type === 'Dimension') {
        worldTable.w = x;
        worldTable.h = y;
        return //console.log('dimension set to', x, '*', y);
      } else if(type === 'Wall') {
        //console.log('wall at', x, y);
      } else if(type === 'Beeper') {
        //console.log('beeper at', x, y);
      } else if(type === 'Karel') {
        worldTable.k.x = x;
        worldTable.k.y = y;
        worldTable.k.d = d

        if(d === 'north') {
          this.dn = 1;
        } else if(d === 'east') {
          this.dn = 2;
        } else if(d === 'south') {
          this.dn = 3;
        } else if(d === 'west') {
          this.dn = 4;
        } else {
          throw 'Direction out of bounds.'
        }

        console.log('DIRECTION SET:', this.dn);

        return;
      } else {
        return;
      }

      // add the object to the virtual world storage
      return this._addObject(worldTable, type, x, y, d);
    });

    return worldTable;
  }
}
