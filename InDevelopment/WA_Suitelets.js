/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       04 Apr 2016     david.andre
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){

	// Construct the url to call

	   var invname; 
	   var dept;
	   var subs;
	   var adjloc;
	   var record;
	   var id;
	   var cust;
	   var params= new Array();
	   
	   
	   // Retreive data from the project
	   try {
		   invname = nlapiGetFieldText('entityid');
		   dept = nlapiGetFieldValue('custentity_nbs_projectdepartment');
		   subs = nlapiGetFieldValue('subsidiary');
		   adjloc = nlapiGetFieldValue('custentity_nbs_projectlocation');
		   cust = nlapiGetFieldValue('id');
	   }
	   catch (e)
	   {
		   alert('Erreur de reception de valeur');
	   }
	   // Past data into the adjustment
	   //record = nlapiCreateRecord( 'inventoryadjustment');
	   //record.setFieldValue( 'tranid', invname );
	   //record.setFieldValue('subsidiary',subs);
	   //record.setFieldValue('department',dept);
	   //record.setFieldValue('adjlocation',adjloc);
	   //record.setFieldValue('customer',cust);
	   // Submit the record
	   //id = nlapiSubmitRecord(record, true,true);
	   alert('prepare table');
	   // create param array 
	   // Redirect the user to this FORM
	   params['custparam_tranid'] = invname;
	   params['custparam_subsidiary'] = subs;
	   params['custparam_department'] = dept;
	   params['custparam_adjlocation'] = adjloc;
	   params['custparam_customer'] = cust;
	   alert('start redirect');
	   try {
		   nlapiSetRedirectURL( 'RECORD', 'inventoryadjustment');
	   }
	   catch (e) {
		   throw nlapiCreateError('Error redirect: ',e);
	   }
	   alert('end redirect');
}
