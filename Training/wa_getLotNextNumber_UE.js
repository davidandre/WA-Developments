/**
* Management of WA / IA LotNumber
* 
* Version    Date            Author           Remarks
* 1.00       19 Jan 2016     david.andre
*
*/


/*********************************************************************
wa_BeforeSubmitAssembly(type)

Description of the function: 
	Case on the type of 
Input Arguments:
	type: String : Provide the type of event that occured.
	
Output Value(s): 
	none

**********************************************************************/
 
function wa_BeforeSubmitAssembly(type)
{
  if (type == 'create')
  {// Here we are ---
	  var success = wa_getLotNextNumber();
  }
	
  if (type == 'delete')
  {
  }
	
  if (type == 'edit')
  {
  }
	
  if (type == 'cancel')
  {
  }
}

/*********************************************************************
wa_getLotNextNumber()

Description of the function: 
	Generate the next Lot Number based on the current week of the year, the year, the subsidiary and a unique counter
	With current definition, the unique counter is limited to 999.
	Data for calculation are stored in the Custom Record :  customrecord_wagl_lot_nextnumber
	History of each week (last lastnumber) is keep in the system.
	
Input Arguments:
	none
	
Output Value(s): 
	Boolean: True if generation is successfull, false if not.

**********************************************************************/

function wa_getLotNextNumber() {

    /* PJB: design consideration - 
    permissions - does the user have access to read/write our lastNumber record type?
    ... but if changing to a User Event script, we can escalate the Role on the script to ensure this.
    
    format of the number is YYWW etc. but the custom record only holds Week Number - what happens from 2016 to 2017?   - DA : Corrected by added the year in the custom record  
        
    inventorydetail subrecord is not available in Client Script - so we need to redesign and test as User Event Script!
        
    Pre-conditions - we need Subsidiary to be set before we can run this - test not blank/empty
    We also need the subsidiary code to be set on the Subsidiary record - so retrieve this much earlier and fail if blank?
    */

    // PJB: global try {...} catch ? OR individual try-catch around each potential point of failure?
    // Or both, local ones to capture detailed information and if unable to resolve, re-throw to general one for overall "tidy up and exit"
    // and what do we actually do in case of failure - do we need to release a Lock for example?

    // Get current week Value
    var currweekA = getWeekNumber(new Date());
    var currweek = currweekA[1];
    var curryear = currweekA[0];

    // Read location from transaction

    var subsId = nlapiGetFieldValue('subsidiary');

    // Use location and current week to build the search filter

    var filters = new Array();
    filters[0] = new nlobjSearchFilter('custrecord_wagl_calclotnumber_weeknumber', null, 'equalto', currweek);
    filters[1] = new nlobjSearchFilter('custrecord_wagl_calc_lotnumber_subsid', null, 'anyof', subsId);
    filters[2] = new nlobjSearchFilter('custrecord_wagl_calc_lotnumber_year', null, 'equalto', curryear);
    
    // PJB: filter on "not inactive"
    
    // DA ? If filter on inactive and create a new counter for the current week we might have duplicate???
    
    // Define search column : Lastnumber	 

    var columns = new Array();
    columns[0] = new nlobjSearchColumn('custrecord_wagl_calc_lotnumber_lastnum');
    columns[1] = new nlobjSearchColumn('custrecord_wagl_calc_lotnumber_lock');
    columns[2] = new nlobjSearchColumn('isinactive');
    

    // Run Search
    try {
    var lastnumberS = nlapiSearchRecord('customrecord_wagl_lot_nextnumber', null, filters, columns);
    }
    catch ( e )
	{
	if ( e instanceof nlobjError )
		nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
    }
    var lotnumberid;
    var actuallastnumber = 0;

    // IF record found
    // PJB: what if more than one record found? - DA : Forbidden by the system. Throws an error to the user.
    if (lastnumberS !== null && lastnumberS.length > 0) {
    	// if multiple rows throws error as this is not permitted
    	if (lastnumberS.length>1) 
    		throw nlapiCreateError('WA-0001','WA Generate Lot Number : Critical Error - Duplicate Reference records found in database.');
        
    	// IF record is invalidated. Define what to do ?
    	
    	if (lastnumberS[0].getValue('isinactive') == 'T') 
    		throw nlapiCreateError('WA-0002','WA Generate lot Number Warning : Generation of new lot number has been disabled by administrator.');
    	
    	// Check if next number is at the maximum allowed (999).
    	if (lastnumberS[0].getValue('custrecord_wagl_calc_lotnumber_lastnum') == '999') 
    		throw nlapiCreateError('WA-0003','WA Generate lot Number Error : Cannot generate a new lot number. Sytem maximum number of lots build this week has been reached.');
    	
    	// IF record not lock
        if (lastnumberS[0].getValue('custrecord_wagl_calc_lotnumber_lock') == 'F') {

            // Lock record			
            lotnumberid = lastnumberS[0].getId();
            nlapiSubmitField('customrecord_wagl_lot_nextnumber', lotnumberid, 'custrecord_wagl_calc_lotnumber_lock', 'T');
            
            actuallastnumber = lastnumberS[0].getValue('custrecord_wagl_calc_lotnumber_lastnum');

        }
        else {
       		throw nlapiCreateError('WA-0004','WA Generate Lot Number Warning - A user is alreay generating a lot number. Please try again later.');          
        }

    } else {

    	// Generate the LastNumber record with start value at 0.
    	try {
    		var newlotNumberR = nlapiCreateRecord('customrecord_wagl_lot_nextnumber');

    		newlotNumberR.setFieldValue('custrecord_wagl_calc_lotnumber_subsid',subsId);
    		newlotNumberR.setFieldValue('custrecord_wagl_calclotnumber_weeknumber',currweek);
    		newlotNumberR.setFieldValue('custrecord_wagl_calc_lotnumber_year',curryear);
    		newlotNumberR.setFieldValue('custrecord_wagl_calc_lotnumber_lock','T');
    		newlotNumberR.setFieldValue('custrecord_wagl_calc_lotnumber_lastnum',0);
    
    		lotnumberid = nlapiSubmitRecord(newlotNumberR, false, false);
    	}
    	catch (e)
    	{
    		if ( e instanceof nlobjError ) 
    			nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
			else
				nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
     		throw nlapiCreateError('WA-0006','WA Generate Lot Number Warning - Netsuite were unable to generate the new Next Number record for the current week.'); 
    	}
    	
    }

    // Now we can generate the new lot number
    
    // Get the subsidiary code from the Subsidiary Form
    
    var subsidCode = nlapiLookupField('subsidiary', subsId, 'custrecord_subsidiary_code');

    // Create the new Lot Number
    var newLotNumber = curryear.toString().substr(2) + ('00' + currweek).toString().substr(-2) + subsidCode + ('000' + ++actuallastnumber).toString().substr(-3);
    

    // PJB: is three digits guaranteed to be enough? what happens if we reach 999? - DA : Test is done and return alert to user if lastnumber is 999

    // David: verify the new number has not already been used! search on inventorynumber records for the current item... (probably)
    if (wa_CheckLotNumberExists(newLotNumber)) {
    	// Release the lock
        nlapiSubmitField('customrecord_wagl_lot_nextnumber', lotnumberid, 'custrecord_wagl_calc_lotnumber_lock', 'F');

    	throw nlapiCreateError('WA-0005','WA Generate Lot Number Error - The generated Lot Number already exists in the system. Please contact your administrator to fix the problem.\nLot Number:'+newLotNumber);    	
    }
    // Check that we are really the user who locked the NextNumber
    if (wa_CheckUserWhoLocked(lotnumberid)) {
    	
    // Assign lot number to transaction
    	nlapiSetFieldValue('serialnumbers', newLotNumber);   // PJB: We need to use the subrecord API for inventorydetail and inventoryassignment

  
    	nlapiSubmitField('customrecord_wagl_lot_nextnumber', lotnumberid,
			['custrecord_wagl_calc_lotnumber_lock', 'custrecord_wagl_calc_lotnumber_lastnum'],
			['F', actuallastnumber]);
      
    }else{
    	
       	throw nlapiCreateError('WA-0006','WA Generate Lot Number Error - You try to generate a Lot Number. However you are not the User who request the lock on the Next Number. Please try again later and tell your adminsitrator that its script sucks.');    	     
    }
    return true;

}

/*********************************************************************
wa_CheckLotNumberExists(lotnumber)

Description of the function: 
	Return the value of the object based on the ID and the language

Input Arguments:
	lotnumber : string: lotNumber to search in the InventoryNumber LIST
	

Output Value(s): 
	Boolean: True if the Lot Number Exists. False if not.

**********************************************************************/
function wa_CheckLotNumberExists(lotnumber) {
	
	var filters = new Array();
	filters[0] = new nlobjSearchFilter('inventorynumber', null, 'is', lotnumber);
	    
	    
	    // Define search column : Lastnumber	 

	var columns = new Array();
	columns[0] = new nlobjSearchColumn('inventorynumber');
	    

	    // Run Search
	    var existsinventorynumber = nlapiSearchRecord('inventorynumber', null, filters, columns);
	
	    if (existsinventorynumber !== null && existsinventorynumber.length > 0) 
	    	return true;
	    else
	    	return false;
}

/*********************************************************************
wa_CheckUserWhoLocked(recordID)

Description of the function: 
	Check that the current logged user is the one who locked the Lot NextNumber record

Input Arguments:
@param {string} recordID ID of the record that we need to check the lock
	
	
Output Value(s): 
	Boolean: True if we are the user who locked this record. False if not.

**********************************************************************/
function wa_CheckUserWhoLocked(recordID) {
	
	var lockinguser = nlapiLookupField('customrecord_wagl_lot_nextnumber', recordID, 'lastmodifiedby');
    var userId = nlapiGetUser();
 
	if (lockinguser == userId)
		return true;
	else
		return false;
	
	
}

/***********************************************************************
*  For a given date, get the ISO week number
*
* Based on information at:
*
*    http://www.merlyn.demon.co.uk/weekcalc.htm#WNR
*
* Algorithm is to find nearest thursday, it's year
* is the year of the week number. Then get weeks
* between that date and the first day of that year.
*
* Note that dates in one year can be weeks of previous
* or next year, overlap is up to 3 days.
*
* e.g. 2014/12/29 is Monday in week  1 of 2015
*      2012/1/1   is Sunday in week 52 of 2011
*************************************************************************/
function getWeekNumber(d) {
   // Copy date so don't modify original
   d = new Date(+d);
   d.setHours(0,0,0);
   // Set to nearest Thursday: current date + 4 - current day number
   // Make Sunday's day number 7
   d.setDate(d.getDate() + 4 - (d.getDay()||7));
   // Get first day of year
   var yearStart = new Date(d.getFullYear(),0,1);
   // Calculate full weeks to nearest Thursday
   var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
   // Return array of year and week number
   return [d.getFullYear(), weekNo];
}

