/**
 * Native functions.
 **/

'use strict';

module.exports = class Native {
  constructor() {

  }

  move(wo, world) {
    return wo.move(world);
  }

  turnRight(wo, world) {
    let numd = wo.changeDirection('right');
    console.log('new direction:', wo.setKarelDirection(world, numd));
  }

  turnLeft(wo, world) {
    let numd = wo.changeDirection('left');
    console.log('new direction:', wo.setKarelDirection(world, numd));
  }

  turnAround(wo, world) {
    let numd = wo.changeDirection('right');
    console.log('new direction:', wo.setKarelDirection(world, numd));

    numd = wo.changeDirection('right');
    console.log('new direction:', wo.setKarelDirection(world, numd));
  }

  pickBeeper(wo, world) {
    return wo.removeObject(world, 'Beeper', world.k.x, world.k.y);
  }
}
