/*******************************************************************
 * wa_mainInclude.js
 *
 *  This file contains all Constants and global function for any WA development
 *  
 *  For Error ID & MSG, please use the next number and in the message indicate which module it refers to.
 *  Add a comment for each Error message with help for debugging or sorting the issue on netsuite
 * 
 * Version    Date            Author           Remarks
 * 1.00       20 Jan 2016     david.andre
 *
 ******************************************************************/

/*******************************************************************
 * ERROR HANDLING
 *
 * Duplicate the following two rows and increment the xxxxx to the next value (must be a 5 chars number)
 * Add a comment to give debug informations to IT Team
 *
 * // Comment the Error for debugging purpose
 * wa_errors.WAxxxxx = 'WA Generate Lot Number : Critical Error - Duplicate Reference records found in database.';
 *
 ******************************************************************/

/*******************************************************************
 *  WA Error Throwing function
 *  
 *  Display a WA error to the end user.
 *  Usage : 
 *  	if(condition_that_end_in_error) 
 *  		wa_throwError('WA00005');
 *  
 *  @params {integer} errornum ID of the error to display to end user 
 * 
 *  @results none
 *  
 ******************************************************************/

function wa_throwError(errornum) {
	
	// Check if the errornum exists before trying to throw it
	if (wa_errors[errornum])  {
		
		var errormsg =  wa_errors[errornum];
		throw nlapiCreateError(errornum, errormsg);
	}
	else
		// if not  throw the default unknown error
		throw nlapiCreateError('WA-00000', 'WA Error : Unknow Error code return. Please contact your administrator');
}

/* Empty function as base for error message 
 * Do Not change this
 * */

function wa_errors() {
	
}

/*******************************************************************
 *  List here all WA error messages
 *  Be careful not to have duplicate codes
 * 
 ******************************************************************/

//This ususaly mean that the Custom Record customrecord_wagl_lot_nextnumber which contains the lastnumber has more than one row for the same week, year & subsidiary. 
//Check which one is the good one and remove the other one. 
//You have to check in the Inventory what is the last number and set it correctly in this custom record
wa_errors.WA00001 = 'WA Purchase Order - Defaulting Departement : Departement not defined in the PO header.';

//The selected row (week, subsidiary, year) in the Custom Record customrecord_wagl_lot_nextnumber has been setup as inactive. 
//Check why and activate the row again
wa_errors.WA00002 = 'WA Generate lot Number - Generation of new lot number has been disabled by administrator.';

