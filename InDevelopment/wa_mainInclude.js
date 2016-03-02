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

// Trying to update purchase order rows, but the default departement is empty and the test in the script didn't find it
wa_errors.WA00001 = 'WA Purchase Order - Defaulting Departement : Departement not defined in the PO header.';

//Error while refrehsing the list of purchase order rows after the departement field has been changed  in the header
wa_errors.WA00002 = 'WA Purchase Order - Defaulting Departement : Unable to refresh the list of item with the new selected departement';

//Error while trying to change the departement on a new line of the PO
wa_errors.WA00003 = 'WA Purchase Order - Defaulting Departement : Unable to change the departement in the new line of the purchase order';

//Error while trying to change the departement on a new line of the PO
wa_errors.WA00004 = 'WA Purchase Order - Defaulting Departement : Error reading departement on current line';

// The departement value is empty
wa_errors.WA00005 = 'WA Purchase Order - Defaulting Departement : Departement is empty';

//Trying to update purchase order rows, but the default departement is empty and the test in the script didn't find it
wa_errors.WA00006 = 'WA Sales Order - Defaulting Departement : Departement not defined in the PO header.';

//Error while refrehsing the list of purchase order rows after the departement field has been changed  in the header
wa_errors.WA00007 = 'WA Sales Order - Defaulting Departement : Unable to refresh the list of item with the new selected departement';

//Error while trying to change the departement on a new line of the PO
wa_errors.WA00008 = 'WA Sales Order - Defaulting Departement : Unable to change the departement in the new line of the purchase order';

//Error while trying to change the departement on a new line of the PO
wa_errors.WA00009 = 'WA Sales Order - Defaulting Departement : Error reading departement on current line';

// The departement value is empty
wa_errors.WA00010 = 'WA Sales Order - Defaulting Departement : Departement is empty';
