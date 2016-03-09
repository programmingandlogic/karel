/*
 * File: CollectNewspaperKarel.java
 * --------------------------------
 * At present, the CollectNewspaperKarel subclass does nothing.
 * Your job in the assignment is to add the necessary code to
 * instruct Karel to walk to the door of its house, pick up the
 * newspaper (represented by a beeper, of course), and then return
 * to its initial position in the upper left corner of the house.
 */

import stanford.karel.*;

public class CollectNewspaperKarel extends SuperKarel {

	public void run(){
		getNewspaper();
		pickUpNewspaper();
		returnToPosition();
	}

 //moves to the inital place of the "newspaper"

	private void getNewspaper(){
		move();
		move();
		turnRight();
		move();
		turnLeft();
		move();

	}

//pick up "newspaper"

	private void pickUpNewspaper(){
		pickBeeper();

	}

//returns to the original starting point of the program

	private void returnToPosition(){
		turnAround();
		move();
		turnRight();
		move();
		turnLeft();
		move();
		move();
		turnAround();

	}


}
